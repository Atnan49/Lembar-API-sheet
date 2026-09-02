import { NextRequest, NextResponse } from "next/server";
import { validateApiKeyRequest } from "@/lib/api-key-auth";
import { updateSheetRow, deleteSheetRow } from "@/lib/google-sheets";

interface RouteParams {
  params: Promise<{
    apiKey: string;
    sheetName: string;
    rowId: string;
  }>;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, DELETE, OPTIONS",
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
 * PUT /api/v1/[apiKey]/[sheetName]/[rowId]
 * Updates a specific row by its row number (e.g. row 2, row 3).
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { apiKey, sheetName, rowId } = await params;
  const decodedSheetName = decodeURIComponent(sheetName);
  const rowNumber = parseInt(rowId, 10);

  if (isNaN(rowNumber) || rowNumber < 2) {
    return NextResponse.json(
      { success: false, error: "Invalid rowId. Must be an integer >= 2" },
      { status: 400, headers: corsHeaders }
    );
  }

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
    const result = await updateSheetRow(
      auth.context.sheet.spreadsheetId,
      decodedSheetName,
      rowNumber,
      body,
      auth.context.refreshToken
    );

    return NextResponse.json(
      {
        success: true,
        message: `Row ${rowNumber} updated successfully`,
        data: result,
      },
      { headers: corsHeaders }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update row in Google Sheets";
    return NextResponse.json({ success: false, error: message }, { status: 500, headers: corsHeaders });
  }
}

/**
 * DELETE /api/v1/[apiKey]/[sheetName]/[rowId]
 * Deletes a row from the sheet by row number.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { apiKey, sheetName, rowId } = await params;
  const decodedSheetName = decodeURIComponent(sheetName);
  const rowNumber = parseInt(rowId, 10);

  if (isNaN(rowNumber) || rowNumber < 2) {
    return NextResponse.json(
      { success: false, error: "Invalid rowId. Must be an integer >= 2" },
      { status: 400, headers: corsHeaders }
    );
  }

  const auth = await validateApiKeyRequest(apiKey, req);
  if (auth.errorResponse || !auth.context) {
    const res = auth.errorResponse!;
    Object.entries(corsHeaders).forEach(([key, val]) => res.headers.set(key, val));
    return res;
  }

  try {
    const result = await deleteSheetRow(
      auth.context.sheet.spreadsheetId,
      decodedSheetName,
      rowNumber,
      auth.context.refreshToken
    );

    return NextResponse.json(
      {
        success: true,
        message: `Row ${rowNumber} deleted successfully`,
        data: result,
      },
      { headers: corsHeaders }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete row from Google Sheets";
    return NextResponse.json({ success: false, error: message }, { status: 500, headers: corsHeaders });
  }
}
