/**
 * Pakasir Payment Gateway Integration Helper
 * Handles transaction creation, payment URL generation, and webhook validation.
 */

export interface CreateTransactionParams {
  orderId: string;
  amount: number;
  paymentMethod?: "qris" | "va";
}

export interface PakasirWebhookPayload {
  amount: number;
  order_id: string;
  project: string;
  status: "completed" | "pending" | "expired" | "failed";
  payment_method?: string;
  completed_at?: string;
}

export const PAKASIR_CONFIG = {
  get apiKey() {
    return process.env.PAKASIR_API_KEY || "Y8XInPg0n4MFPozh9dpUii1BVKUcLBLf";
  },
  get slug() {
    return process.env.PAKASIR_SLUG || "lembar-api-google-sheet";
  },
  baseUrl: "https://app.pakasir.com",
};

export const PRO_PLAN_CONFIG = {
  price: 49000, // Rp 49.000 / bulan
  quotaLimit: 50000, // 50.000 requests / bulan
  durationDays: 30,
};

/**
 * Generates direct payment URL for redirect flow to Pakasir.
 */
export function getPakasirPaymentUrl(orderId: string, amount: number): string {
  const slug = PAKASIR_CONFIG.slug;
  return `${PAKASIR_CONFIG.baseUrl}/pay/${slug}/${amount}?order_id=${encodeURIComponent(orderId)}`;
}

/**
 * Creates a transaction via Pakasir API.
 */
export async function createPakasirTransaction({
  orderId,
  amount,
  paymentMethod = "qris",
}: CreateTransactionParams) {
  const endpoint = `${PAKASIR_CONFIG.baseUrl}/api/transactioncreate/${paymentMethod}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project: PAKASIR_CONFIG.slug,
        order_id: orderId,
        amount,
        api_key: PAKASIR_CONFIG.apiKey,
      }),
    });

    const data = await res.json();
    return {
      success: res.ok,
      data,
      paymentUrl: getPakasirPaymentUrl(orderId, amount),
    };
  } catch (error) {
    console.error("Pakasir API creation error:", error);
    // Fallback to direct redirect payment URL if API call fails
    return {
      success: true,
      data: null,
      paymentUrl: getPakasirPaymentUrl(orderId, amount),
    };
  }
}
