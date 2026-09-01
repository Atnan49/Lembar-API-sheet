import { MetadataRoute } from "next";

/**
 * Dynamic robots.txt for Search Engines and AI Crawlers
 * https://lembar.atnan.my.id/robots.txt
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://lembar.atnan.my.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/docs", "/privacy", "/terms", "/icon.svg", "/logo.svg", "/opengraph-image"],
        disallow: [
          "/api/auth/",
          "/api/billing/",
          "/api/webhooks/",
          "/api/sheets/",
          "/api/user/",
          "/dashboard",
        ],
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "Google-Extended"],
        allow: ["/", "/docs", "/privacy", "/terms", "/llms.txt", "/llms-full.txt"],
        disallow: ["/api/", "/dashboard"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
