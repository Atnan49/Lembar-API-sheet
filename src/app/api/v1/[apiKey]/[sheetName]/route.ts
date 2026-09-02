import { NextRequest, NextResponse } from "next/server";
import { validateApiKeyRequest } from "@/lib/api-key-auth";
import { readSheetRows, appendSheetRow } from "@/lib/google-sheets";

interface RouteParams {
  params: Promise<{
    apiKey: string;
    sheetName: string;
  }>;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
 * GET /api/v1/[apiKey]/[sheetName]
 * Reads all rows from the specified sheet tab and returns JSON objects.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { apiKey, sheetName } = await params;
  const decodedSheetName = decodeURIComponent(sheetName);

  const auth = await validateApiKeyRequest(apiKey, req);
  if (auth.errorResponse || !auth.context) {
    const res = auth.errorResponse!;
    Object.entries(corsHeaders).forEach(([key, val]) => res.headers.set(key, val));
    return res;
  }

  try {
    const result = await readSheetRows(
      auth.context.sheet.spreadsheetId,
      decodedSheetName,
      auth.context.refreshToken
    );

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        totalRows: result.data.length,
        headers: result.headers,
      },
      { headers: corsHeaders }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to read data from Google Sheets";
    return NextResponse.json({ success: false, error: message }, { status: 500, headers: corsHeaders });
  }
}

/**
 * POST /api/v1/[apiKey]/[sheetName]
 * Appends a new row to the specified sheet tab.
 * Body: JSON object matching column headers.
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

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON request body" },
      { status: 400, headers: corsHeaders }
    );
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { success: false, error: "Request body must be a JSON object" },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const result = await appendSheetRow(
      auth.context.sheet.spreadsheetId,
      decodedSheetName,
      body,
      auth.context.refreshToken
    );

    return NextResponse.json(
      {
        success: true,
        message: "Row appended successfully",
        rowNumber: result.rowNumber,
      },
      { headers: corsHeaders }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to append row to Google Sheets";
    return NextResponse.json({ success: false, error: message }, { status: 500, headers: corsHeaders });
  }
}
