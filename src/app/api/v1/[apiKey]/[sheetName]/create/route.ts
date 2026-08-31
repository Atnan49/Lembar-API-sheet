import { NextRequest, NextResponse } from "next/server";
import { validateApiKeyRequest } from "@/lib/api-key-auth";
import { createSheetTab } from "@/lib/google-sheets";

interface RouteParams {
  params: Promise<{
    apiKey: string;
    sheetName: string;
  }>;
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
    return auth.errorResponse!;
  }

  let body: { headers?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON request body" },
      { status: 400 }
    );
  }

  if (!body || !Array.isArray(body.headers) || body.headers.length === 0) {
    return NextResponse.json(
      { success: false, error: "Request body must contain a non-empty 'headers' array: { headers: ['col1', 'col2'] }" },
      { status: 400 }
    );
  }

  try {
    const result = await createSheetTab(
      auth.context.sheet.spreadsheetId,
      decodedSheetName,
      body.headers,
      auth.context.refreshToken
    );

    return NextResponse.json({
      success: true,
      message: `Tab "${decodedSheetName}" created successfully with ${body.headers.length} headers`,
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create sheet tab in Google Sheets";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
