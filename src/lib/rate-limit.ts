import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Simple in-memory fallback rate limiter for local development
class MemoryRateLimiter {
  private requests = new Map<string, { count: number; expiresAt: number }>();

  async limit(identifier: string, maxRequests = 100, windowMs = 60000): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || entry.expiresAt < now) {
      this.requests.set(identifier, { count: 1, expiresAt: now + windowMs });
      return { success: true, limit: maxRequests, remaining: maxRequests - 1, reset: now + windowMs };
    }

    if (entry.count >= maxRequests) {
      return { success: false, limit: maxRequests, remaining: 0, reset: entry.expiresAt };
    }

    entry.count += 1;
    return { success: true, limit: maxRequests, remaining: maxRequests - entry.count, reset: entry.expiresAt };
  }
}

const memoryLimiter = new MemoryRateLimiter();

let upstashRatelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  upstashRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "60 s"),
    analytics: true,
    prefix: "lembar_ratelimit",
  });
}

/**
 * Checks rate limit for a given API key.
 * Default limit: 100 requests per 60 seconds.
 */
export async function checkRateLimit(apiKeyHash: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  if (upstashRatelimit) {
    const result = await upstashRatelimit.limit(apiKeyHash);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  return memoryLimiter.limit(apiKeyHash, 100, 60000);
}
