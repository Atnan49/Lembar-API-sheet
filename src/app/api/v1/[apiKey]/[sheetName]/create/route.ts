import { NextRequest, NextResponse } from "next/server";
import { validateApiKeyRequest } from "@/lib/api-key-auth";
import { createSheetTab } from "@/lib/google-sheets";

interface RouteParams {
  params: Promise<{
    apiKey: string;
    sheetName: string;
  }>;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * POST /api/v1/[apiKey]/[sheetName]/create
 * Lembar's key differentiator: Auto-creates a new sheet tab and immediately populates the header row.
 * Body: { "headers": ["column1", "column2", ...] }
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { apiKey, sheetName } = await params;
  const decodedSheetName = decodeURIComponent(sheetName);

  const auth = await validateApiKeyRequest(apiKey, req);
  if (auth.errorResponse || !auth.context) {
    const res = auth.errorResponse!;
    Object.entries(corsHeaders).forEach(([key, val]) => res.headers.set(key, val));
    return res;
  }

  let body: { headers?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON request body" },
      { status: 400, headers: corsHeaders }
    );
  }

  if (!body || !Array.isArray(body.headers) || body.headers.length === 0) {
    return NextResponse.json(
      { success: false, error: "Request body must contain a non-empty 'headers' array: { headers: ['col1', 'col2'] }" },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const result = await createSheetTab(
      auth.context.sheet.spreadsheetId,
      decodedSheetName,
      body.headers,
      auth.context.refreshToken
    );

    return NextResponse.json(
      {
        success: true,
        message: `Tab "${decodedSheetName}" created successfully with ${body.headers.length} headers`,
        data: result,
      },
      { headers: corsHeaders }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create sheet tab in Google Sheets";
    return NextResponse.json({ success: false, error: message }, { status: 500, headers: corsHeaders });
  }
}
