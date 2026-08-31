import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/crypto";
import { createSheetTab } from "@/lib/google-sheets";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/sheets/[id]/create-tab
 * Creates a new tab and populates headers directly from Dashboard UI.
 * Body: { tabName: string, headers: string[] }
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
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

  let body: { tabName?: string; headers?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.tabName || typeof body.tabName !== "string" || !body.tabName.trim()) {
    return NextResponse.json({ success: false, error: "Tab name is required" }, { status: 400 });
  }

  if (!Array.isArray(body.headers) || body.headers.length === 0) {
    return NextResponse.json({ success: false, error: "At least one header column is required" }, { status: 400 });
  }

  try {
    const refreshToken = decryptToken(sheet.refreshTokenEncrypted);
    const result = await createSheetTab(
      sheet.spreadsheetId,
      body.tabName.trim(),
      body.headers.map((h) => h.trim()).filter(Boolean),
      refreshToken
    );

    return NextResponse.json({
      success: true,
      message: `Tab "${body.tabName}" created successfully with headers`,
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create tab in Google Sheets";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
