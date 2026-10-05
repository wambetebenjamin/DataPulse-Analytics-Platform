import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { SITE, USE_CASES } from "@/data/site";

/**
 * Dynamic sitemap.
 *
 * Brief: "dynamic sitemap excluding auth routes". /login, /signup, /app/** and
 * /api/** are therefore absent by construction — they are never added here,
 * and robots.ts disallows them as well.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/features`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/use-cases`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/demo`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/custom`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    {
      url: `${base}/legal/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    { url: `${base}/legal/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    {
      url: `${base}/legal/cookie-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const useCaseAnchors: MetadataRoute.Sitemap = USE_CASES.map((uc) => ({
    url: `${base}/use-cases#${uc.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const posts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.iso),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...useCaseAnchors, ...posts];
}
