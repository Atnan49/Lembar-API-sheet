import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractSpreadsheetId, getSpreadsheetDetails } from "@/lib/google-sheets";
import { generateApiKey, decryptToken, encryptToken } from "@/lib/crypto";

/**
 * POST /api/sheets/connect
 * Connects a new Google Sheet by URL or ID.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { spreadsheetUrl?: string; spreadsheetId?: string; customName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON request body" }, { status: 400 });
  }

  const rawInput = body.spreadsheetUrl || body.spreadsheetId;
  if (!rawInput) {
    return NextResponse.json(
      { success: false, error: "Please provide a spreadsheet URL or ID" },
      { status: 400 }
    );
  }

  const spreadsheetId = extractSpreadsheetId(rawInput);
  if (!spreadsheetId) {
    return NextResponse.json({ success: false, error: "Invalid spreadsheet URL or ID" }, { status: 400 });
  }

  // Retrieve user's Google OAuth refresh token
  let refreshToken: string | null = null;

  if (session.user.encryptedRefreshToken) {
    try {
      refreshToken = decryptToken(session.user.encryptedRefreshToken);
    } catch {
      refreshToken = null;
    }
  }

  // Fallback: Check if user already has an existing connected sheet with a stored token
  if (!refreshToken) {
    const existingSheet = await prisma.connectedSheet.findFirst({
      where: { userId: session.user.id },
      select: { refreshTokenEncrypted: true },
    });

    if (existingSheet) {
      try {
        refreshToken = decryptToken(existingSheet.refreshTokenEncrypted);
      } catch {
        refreshToken = null;
      }
    }
  }

  if (!refreshToken) {
    return NextResponse.json(
      {
        success: false,
        error: "Google Sheets access token not found. Please log out and sign in again to grant consent.",
      },
      { status: 403 }
    );
  }

  // Verify access and fetch spreadsheet title
  let title = body.customName;
  let tabs: Array<{ title: string; sheetId?: number | null }> = [];

  try {
    const details = await getSpreadsheetDetails(spreadsheetId, refreshToken);
    if (!title) {
      title = details.title;
    }
    tabs = details.tabs;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to verify spreadsheet access";
    return NextResponse.json(
      {
        success: false,
        error: `Could not access spreadsheet: ${message}. Make sure your Google account has edit access.`,
      },
      { status: 400 }
    );
  }

  // Generate unique API Key
  const { apiKey, apiKeyHash, apiKeyPrefix } = generateApiKey();
  const refreshTokenEncrypted = encryptToken(refreshToken);

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  try {
    const newSheet = await prisma.connectedSheet.create({
      data: {
        userId: session.user.id,
        spreadsheetId,
        spreadsheetName: title || "My Spreadsheet",
        refreshTokenEncrypted,
        apiKey,
        apiKeyHash,
        apiKeyPrefix,
        requestCount: 0,
        quotaLimit: 1000,
        quotaResetAt: nextMonth,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Spreadsheet connected successfully",
      sheet: {
        id: newSheet.id,
        spreadsheetId: newSheet.spreadsheetId,
        spreadsheetName: newSheet.spreadsheetName,
        apiKey: newSheet.apiKey,
        apiKeyPrefix: newSheet.apiKeyPrefix,
        requestCount: newSheet.requestCount,
        quotaLimit: newSheet.quotaLimit,
        tabs,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
