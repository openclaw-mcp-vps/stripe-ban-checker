import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://stripe-ban-checker.vercel.app";

  return [
    {
      url: `${base}/`,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${base}/check`,
      changeFrequency: "weekly",
      priority: 0.8
    }
  ];
}
