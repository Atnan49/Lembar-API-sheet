import { NextRequest, NextResponse } from "next/server";
import { validateApiKeyRequest } from "@/lib/api-key-auth";
import { readSheetRows, appendSheetRow } from "@/lib/google-sheets";

interface RouteParams {
  params: Promise<{
    apiKey: string;
    sheetName: string;
  }>;
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
    return auth.errorResponse!;
  }

  try {
    const result = await readSheetRows(
      auth.context.sheet.spreadsheetId,
      decodedSheetName,
      auth.context.refreshToken
    );

    return NextResponse.json({
      success: true,
      data: result.data,
      totalRows: result.data.length,
      headers: result.headers,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to read data from Google Sheets";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
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
    return auth.errorResponse!;
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON request body" },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { success: false, error: "Request body must be a JSON object" },
      { status: 400 }
    );
  }

  try {
    const result = await appendSheetRow(
      auth.context.sheet.spreadsheetId,
      decodedSheetName,
      body,
      auth.context.refreshToken
    );

    return NextResponse.json({
      success: true,
      message: "Row appended successfully",
      rowNumber: result.rowNumber,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to append row to Google Sheets";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
