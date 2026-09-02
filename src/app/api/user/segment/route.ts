import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/user/segment
 * Saves the user's segmentation answer ("Kamu pakai Lembar buat apa?").
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { segmentTag?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.segmentTag || typeof body.segmentTag !== "string") {
    return NextResponse.json({ success: false, error: "segmentTag is required" }, { status: 400 });
  }

  const validTags = ["developer", "organization", "nocode", "other"];
  const sanitizedTag = validTags.includes(body.segmentTag) ? body.segmentTag : "other";

  await prisma.user.update({
    where: { id: session.user.id },
    data: { segmentTag: sanitizedTag },
  });

  return NextResponse.json({ success: true, segmentTag: sanitizedTag });
}
