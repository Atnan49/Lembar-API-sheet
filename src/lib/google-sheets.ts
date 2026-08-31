import { google, sheets_v4 } from "googleapis";
import { sanitizeCellValue } from "./crypto";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

function createOAuth2Client(refreshToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    `${NEXTAUTH_URL}/api/auth/callback/google`
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return oauth2Client;
}

function getSheetsService(refreshToken: string): sheets_v4.Sheets {
  const auth = createOAuth2Client(refreshToken);
  return google.sheets({ version: "v4", auth });
}

/**
 * Extracts spreadsheet ID from full URL or returns raw ID.
 */
export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  return trimmed;
}

/**
 * Validates access to a spreadsheet and returns its title and available sheet tabs.
 */
export async function getSpreadsheetDetails(spreadsheetId: string, refreshToken: string) {
  const sheets = getSheetsService(refreshToken);

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "properties.title,sheets.properties(sheetId,title,index)",
  });

  const title = response.data.properties?.title || "Untitled Spreadsheet";
  const tabs = (response.data.sheets || []).map((s) => ({
    sheetId: s.properties?.sheetId,
    title: s.properties?.title || "Sheet1",
    index: s.properties?.index,
  }));

  return { title, tabs };
}

/**
 * Reads all rows from a sheet tab and returns array of JSON objects with header keys.
 */
export async function readSheetRows(spreadsheetId: string, sheetName: string, refreshToken: string) {
  const sheets = getSheetsService(refreshToken);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetName}'`,
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    return { headers: [], data: [] };
  }

  const rawHeaders = rows[0] as unknown[];
  const headers = rawHeaders.map((h, i) => (h ? String(h).trim() : `column_${i + 1}`));
  const dataRows = rows.slice(1);

  const data = dataRows.map((row, index) => {
    const rowObj: Record<string, unknown> = {
      _rowNumber: index + 2, // 1-indexed row number in Google Sheets (row 1 is header)
    };

    headers.forEach((header, colIndex) => {
      rowObj[header] = row[colIndex] !== undefined ? row[colIndex] : null;
    });

    return rowObj;
  });

  return { headers, data };
}

/**
 * Appends a new row to the sheet tab. Matches object keys to existing column headers.
 */
export async function appendSheetRow(
  spreadsheetId: string,
  sheetName: string,
  rowData: Record<string, unknown>,
  refreshToken: string
) {
  const sheets = getSheetsService(refreshToken);

  // Fetch current headers to ensure keys map to correct column index
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetName}'!1:1`,
  });

  const existingHeaders = (headerRes.data.values?.[0] as string[]) || [];

  if (existingHeaders.length === 0) {
    // If sheet has no header row, create headers from the payload keys
    const newHeaders = Object.keys(rowData);
    const sanitizedValues = newHeaders.map((k) => sanitizeCellValue(rowData[k]));

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${sheetName}'!1:2`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [newHeaders, sanitizedValues],
      },
    });

    return { success: true, headers: newHeaders, rowNumber: 2 };
  }

  // Map incoming object keys to existing column headers
  const rowValues = existingHeaders.map((header) => {
    const val = rowData[header];
    return sanitizeCellValue(val);
  });

  const appendRes = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${sheetName}'`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [rowValues],
    },
  });

  const updatedRange = appendRes.data.updates?.updatedRange || "";
  const match = updatedRange.match(/!.*?[A-Z]+(\d+)/);
  const rowNumber = match ? parseInt(match[1], 10) : undefined;

  return { success: true, rowNumber, updatedRange };
}

/**
 * Updates a specific row by its row number (e.g. row 2, 3, etc.).
 */
export async function updateSheetRow(
  spreadsheetId: string,
  sheetName: string,
  rowNumber: number,
  rowData: Record<string, unknown>,
  refreshToken: string
) {
  if (rowNumber < 2) {
    throw new Error("Cannot update row 1 (reserved for headers)");
  }

  const sheets = getSheetsService(refreshToken);

  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetName}'!1:1`,
  });

  const headers = (headerRes.data.values?.[0] as string[]) || [];
  if (headers.length === 0) {
    throw new Error("No headers found in sheet tab");
  }

  // Get current row values first to preserve unmentioned fields
  const currentRowRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetName}'!${rowNumber}:${rowNumber}`,
  });

  const currentValues = (currentRowRes.data.values?.[0] as unknown[]) || [];

  const updatedValues = headers.map((header, index) => {
    if (Object.prototype.hasOwnProperty.call(rowData, header)) {
      return sanitizeCellValue(rowData[header]);
    }
    return currentValues[index] !== undefined ? currentValues[index] : null;
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${sheetName}'!${rowNumber}:${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [updatedValues],
    },
  });

  return { success: true, rowNumber };
}

/**
 * Deletes a row from a sheet tab using batchUpdate DeleteDimension.
 */
export async function deleteSheetRow(
  spreadsheetId: string,
  sheetName: string,
  rowNumber: number,
  refreshToken: string
) {
  if (rowNumber < 2) {
    throw new Error("Cannot delete header row (row 1)");
  }

  const sheets = getSheetsService(refreshToken);

  // Retrieve numeric sheetId for the given sheet tab name
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties(sheetId,title))",
  });

  const sheetObj = meta.data.sheets?.find((s) => s.properties?.title === sheetName);
  if (!sheetObj || sheetObj.properties?.sheetId === undefined || sheetObj.properties?.sheetId === null) {
    throw new Error(`Sheet tab "${sheetName}" not found`);
  }

  const sheetId = sheetObj.properties.sheetId;

  // Google Sheets API dimensions use 0-indexed half-open intervals [startIndex, endIndex)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        },
      ],
    },
  });

  return { success: true, deletedRow: rowNumber };
}

/**
 * Killer feature: Auto-creates a new sheet tab and immediately populates the header row.
 */
export async function createSheetTab(
  spreadsheetId: string,
  sheetName: string,
  headers: string[],
  refreshToken: string
) {
  if (!headers || headers.length === 0) {
    throw new Error("Headers array is required to create a new tab");
  }

  const sheets = getSheetsService(refreshToken);

  // 1. Create the new tab using batchUpdate
  const addSheetRes = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: sheetName,
            },
          },
        },
      ],
    },
  });

  const createdSheetId = addSheetRes.data.replies?.[0]?.addSheet?.properties?.sheetId;

  // 2. Populate header row in A1
  const sanitizedHeaders = headers.map((h) => sanitizeCellValue(h));
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${sheetName}'!1:1`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [sanitizedHeaders],
    },
  });

  return {
    success: true,
    sheetName,
    sheetId: createdSheetId,
    headers: sanitizedHeaders,
  };
}
