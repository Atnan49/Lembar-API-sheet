import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/crypto";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/sheets/[id]/regenerate-key
 * Generates a new API key for the sheet, immediately invalidating the old one.
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

  const { apiKey, apiKeyHash, apiKeyPrefix } = generateApiKey();

  const updatedSheet = await prisma.connectedSheet.update({
    where: { id },
    data: {
      apiKey,
      apiKeyHash,
      apiKeyPrefix,
    },
  });

  return NextResponse.json({
    success: true,
    message: "API key regenerated successfully",
    apiKey: updatedSheet.apiKey,
    apiKeyPrefix: updatedSheet.apiKeyPrefix,
  });
}
