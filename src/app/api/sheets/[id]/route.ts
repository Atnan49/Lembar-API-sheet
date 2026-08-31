import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/crypto";
import { getSpreadsheetDetails } from "@/lib/google-sheets";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/sheets/[id]
 * Fetches single sheet details, tabs, and recent usage logs.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const sheet = await prisma.connectedSheet.findFirst({
    where: { id, userId: session.user.id },
    include: {
      usageLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!sheet) {
    return NextResponse.json({ success: false, error: "Sheet not found" }, { status: 404 });
  }

  // Fetch live tabs from Google Sheets
  let tabs: Array<{ title: string; sheetId?: number | null }> = [];
  try {
    const refreshToken = decryptToken(sheet.refreshTokenEncrypted);
    const details = await getSpreadsheetDetails(sheet.spreadsheetId, refreshToken);
    tabs = details.tabs;
  } catch {
    // If live fetch fails, tabs will remain empty
  }

  return NextResponse.json({
    success: true,
    sheet: {
      id: sheet.id,
      spreadsheetId: sheet.spreadsheetId,
      spreadsheetName: sheet.spreadsheetName,
      apiKey: sheet.apiKey,
      apiKeyPrefix: sheet.apiKeyPrefix,
      requestCount: sheet.requestCount,
      quotaLimit: sheet.quotaLimit,
      quotaResetAt: sheet.quotaResetAt,
      createdAt: sheet.createdAt,
      tabs,
      usageLogs: sheet.usageLogs,
    },
  });
}

/**
 * DELETE /api/sheets/[id]
 * Disconnects and permanently deletes the connected sheet and its access credentials.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const sheet = await prisma.connectedSheet.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!sheet) {
    return NextResponse.json({ success: false, error: "Sheet not found" }, { status: 404 });
  }

  // Hard delete credentials and associated logs
  await prisma.connectedSheet.delete({
    where: { id },
  });

  return NextResponse.json({
    success: true,
    message: `Spreadsheet "${sheet.spreadsheetName}" disconnected successfully`,
  });
}
