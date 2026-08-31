import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPakasirPaymentUrl, PRO_PLAN_CONFIG } from "@/lib/pakasir";
import { nanoid } from "nanoid";

/**
 * POST /api/billing/checkout
 * Initiates an upgrade checkout with Pakasir payment gateway.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const orderId = `LMBR-${Date.now()}-${nanoid(6).toUpperCase()}`;
  const amount = PRO_PLAN_CONFIG.price;
  const paymentUrl = getPakasirPaymentUrl(orderId, amount);

  // Create pending transaction in database
  await prisma.transaction.create({
    data: {
      orderId,
      userId: session.user.id,
      amount,
      plan: "PRO_MONTHLY",
      status: "pending",
      paymentMethod: "qris",
      paymentUrl,
    },
  });

  return NextResponse.json({
    success: true,
    orderId,
    amount,
    paymentUrl,
    plan: "PRO_MONTHLY",
  });
}
