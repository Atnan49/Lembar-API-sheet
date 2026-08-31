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
      { status: 400 }
    );
  }

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
    const result = await updateSheetRow(
      auth.context.sheet.spreadsheetId,
      decodedSheetName,
      rowNumber,
      body,
      auth.context.refreshToken
    );

    return NextResponse.json({
      success: true,
      message: `Row ${rowNumber} updated successfully`,
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update row in Google Sheets";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
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
      { status: 400 }
    );
  }

  const auth = await validateApiKeyRequest(apiKey, req);
  if (auth.errorResponse || !auth.context) {
    return auth.errorResponse!;
  }

  try {
    const result = await deleteSheetRow(
      auth.context.sheet.spreadsheetId,
      decodedSheetName,
      rowNumber,
      auth.context.refreshToken
    );

    return NextResponse.json({
      success: true,
      message: `Row ${rowNumber} deleted successfully`,
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete row from Google Sheets";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
