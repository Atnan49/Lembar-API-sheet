import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/billing/status
 * Returns current user subscription plan and transaction history.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      plan: true,
      planExpiresAt: true,
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  // Check if subscription has expired
  const isPro = user.plan === "PRO" && (!user.planExpiresAt || new Date(user.planExpiresAt) > new Date());

  return NextResponse.json({
    success: true,
    plan: isPro ? "PRO" : "FREE",
    planExpiresAt: user.planExpiresAt,
    transactions: user.transactions,
  });
}
