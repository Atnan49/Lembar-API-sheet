import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";
import { hashApiKey, decryptToken } from "./crypto";
import { checkRateLimit } from "./rate-limit";

export interface ResolvedApiKeyContext {
  sheet: {
    id: string;
    userId: string;
    spreadsheetId: string;
    spreadsheetName: string;
    requestCount: number;
    quotaLimit: number;
  };
  refreshToken: string;
}

/**
 * Validates public API key, enforces rate limiting and monthly quota, and decrypts token.
 */
export async function validateApiKeyRequest(
  apiKey: string,
  req: NextRequest
): Promise<{ errorResponse?: NextResponse; context?: ResolvedApiKeyContext }> {
  const startTime = Date.now();
  if (!apiKey || !apiKey.startsWith("lmbr_live_")) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: "Invalid API key format. Key must start with 'lmbr_live_'" },
        { status: 401 }
      ),
    };
  }

  const apiKeyHash = hashApiKey(apiKey);

  // 1. Rate Limiting Check (e.g. 100 requests per minute)
  const rateLimitResult = await checkRateLimit(apiKeyHash);
  if (!rateLimitResult.success) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please slow down your requests.",
          limit: rateLimitResult.limit,
          resetInMs: Math.max(0, rateLimitResult.reset - Date.now()),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      ),
    };
  }

  // 2. Lookup ConnectedSheet in database
  const connectedSheet = await prisma.connectedSheet.findUnique({
    where: { apiKeyHash },
  });

  if (!connectedSheet) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: "API key not found or sheet disconnected" },
        { status: 401 }
      ),
    };
  }

  // 3. Quota check (reset if monthly period has elapsed)
  const now = new Date();
  let currentRequestCount = connectedSheet.requestCount;

  if (now > connectedSheet.quotaResetAt) {
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await prisma.connectedSheet.update({
      where: { id: connectedSheet.id },
      data: {
        requestCount: 0,
        quotaResetAt: nextMonth,
      },
    });
    currentRequestCount = 0;
  }

  // Free Tier quota check: 1.000 requests / month
  if (currentRequestCount >= connectedSheet.quotaLimit) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: `Monthly quota of ${connectedSheet.quotaLimit} requests reached for this sheet.`,
          quotaLimit: connectedSheet.quotaLimit,
          requestCount: currentRequestCount,
          quotaResetAt: connectedSheet.quotaResetAt.toISOString(),
        },
        { status: 429 }
      ),
    };
  }

  // 4. Increment usage count
  await prisma.connectedSheet.update({
    where: { id: connectedSheet.id },
    data: {
      requestCount: { increment: 1 },
    },
  });

  // 5. Decrypt user's Google Sheets refresh token
  let refreshToken: string;
  try {
    refreshToken = decryptToken(connectedSheet.refreshTokenEncrypted);
  } catch {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: "Failed to decrypt credentials. Please reconnect the spreadsheet." },
        { status: 500 }
      ),
    };
  }

  // Log usage asynchronously
  const responseTimeMs = Date.now() - startTime;
  prisma.usageLog
    .create({
      data: {
        connectedSheetId: connectedSheet.id,
        endpoint: req.nextUrl.pathname,
        method: req.method,
        statusCode: 200,
        responseTimeMs,
      },
    })
    .catch(() => {});

  return {
    context: {
      sheet: {
        id: connectedSheet.id,
        userId: connectedSheet.userId,
        spreadsheetId: connectedSheet.spreadsheetId,
        spreadsheetName: connectedSheet.spreadsheetName,
        requestCount: currentRequestCount + 1,
        quotaLimit: connectedSheet.quotaLimit,
      },
      refreshToken,
    },
  };
}
