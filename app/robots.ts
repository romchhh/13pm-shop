import { MetadataRoute } from "next";
import { getSiteBaseUrl } from "@/lib/seo";

const PRIVATE_PATHS = [
  "/admin/",
  "/api/",
  "/_next/",
  "/private/",
  "/cart",
  "/final",
  "/favorites",
  "/success",
  "/forbidden",
];

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/api/images/"],
        disallow: PRIVATE_PATHS.filter((p) => p !== "/api/"),
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/api/images/"],
        disallow: PRIVATE_PATHS.filter((p) => p !== "/api/"),
      },
      { userAgent: "GPTBot", allow: "/", disallow: ["/admin/", "/api/", "/cart", "/final"] },
      { userAgent: "ChatGPT-User", allow: "/", disallow: ["/admin/", "/api/", "/cart", "/final"] },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: ["/admin/", "/api/", "/cart", "/final"] },
      { userAgent: "ClaudeBot", allow: "/", disallow: ["/admin/", "/api/", "/cart", "/final"] },
      { userAgent: "PerplexityBot", allow: "/", disallow: ["/admin/", "/api/", "/cart", "/final"] },
    ],
    host: new URL(baseUrl).host,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
