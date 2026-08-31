import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/sheets
 * Fetches all connected sheets for the authenticated user along with usage counts.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sheets = await prisma.connectedSheet.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        spreadsheetId: true,
        spreadsheetName: true,
        apiKey: true,
        apiKeyPrefix: true,
        requestCount: true,
        quotaLimit: true,
        quotaResetAt: true,
        createdAt: true,
        _count: {
          select: { usageLogs: true },
        },
      },
    });

    return NextResponse.json({ success: true, sheets });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch connected sheets";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
