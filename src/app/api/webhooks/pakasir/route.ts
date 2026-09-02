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

    // Find the transaction in database
    const transaction = await prisma.transaction.findUnique({
      where: { orderId: order_id },
      include: { user: true },
    });

    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
    }

    // Idempotency: If transaction is already completed, return success immediately
    if (transaction.status === "completed") {
      return NextResponse.json({
        success: true,
        message: "Transaction already processed and completed",
      });
    }

    // Verify payment amount matches registered transaction amount if amount is provided
    if (amount !== undefined && amount !== null && Number(amount) !== transaction.amount) {
      console.warn(`[Webhook Alert] Amount mismatch for order ${order_id}: expected ${transaction.amount}, received ${amount}`);
      return NextResponse.json(
        { success: false, error: "Payment amount does not match transaction" },
        { status: 400 }
      );
    }

    // Handle completed payment
    if (status === "completed") {
      // Prevent completing non-pending transactions
      if (transaction.status !== "pending") {
        return NextResponse.json(
          { success: false, error: `Cannot complete transaction with current status: ${transaction.status}` },
          { status: 400 }
        );
      }

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
      if (transaction.status === "pending") {
        await prisma.transaction.update({
          where: { orderId: order_id },
          data: { status },
        });
      }
    }

    return NextResponse.json({ success: true, message: `Webhook received: ${status}` });
  } catch (error) {
    console.error("Pakasir webhook error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
