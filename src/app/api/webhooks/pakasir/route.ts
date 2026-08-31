import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PAKASIR_CONFIG, PRO_PLAN_CONFIG, PakasirWebhookPayload } from "@/lib/pakasir";

/**
 * POST /api/webhooks/pakasir
 * Receives payment status callbacks from Pakasir Payment Gateway.
 */
export async function POST(req: NextRequest) {
  try {
    const payload: PakasirWebhookPayload = await req.json();

    // Verify project slug matches our configured Pakasir slug
    if (payload.project && payload.project !== PAKASIR_CONFIG.slug) {
      return NextResponse.json({ success: false, error: "Invalid project slug" }, { status: 400 });
    }

    const { order_id, status, amount, payment_method, completed_at } = payload;

    if (!order_id) {
      return NextResponse.json({ success: false, error: "Missing order_id" }, { status: 400 });
    }

    // Find the pending transaction in database
    const transaction = await prisma.transaction.findUnique({
      where: { orderId: order_id },
      include: { user: true },
    });

    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
    }

    // Handle completed payment
    if (status === "completed") {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + PRO_PLAN_CONFIG.durationDays);

      // 1. Update transaction status
      await prisma.transaction.update({
        where: { orderId: order_id },
        data: {
          status: "completed",
          paymentMethod: payment_method || "qris",
          completedAt: completed_at ? new Date(completed_at) : new Date(),
        },
      });

      // 2. Upgrade user account to PRO
      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          plan: "PRO",
          planExpiresAt: expiresAt,
        },
      });

      // 3. Upgrade quota on all connected sheets to 50.000 requests/month
      await prisma.connectedSheet.updateMany({
        where: { userId: transaction.userId },
        data: {
          quotaLimit: PRO_PLAN_CONFIG.quotaLimit,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Payment verified and user account upgraded to PRO",
      });
    }

    // If payment failed or expired
    if (status === "expired" || status === "failed") {
      await prisma.transaction.update({
        where: { orderId: order_id },
        data: { status },
      });
    }

    return NextResponse.json({ success: true, message: `Webhook received: ${status}` });
  } catch (error) {
    console.error("Pakasir webhook error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
