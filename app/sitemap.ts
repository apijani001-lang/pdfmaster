import type { MetadataRoute } from "next";

const BASE_URL = "https://pdfmaster-delta.vercel.app";

const tools = [
  "merge-pdf",
  "split-pdf",
  "compress-pdf",
  "pdf-to-word",
  "pdf-to-jpg",
  "jpg-to-pdf",
  "word-to-pdf",
  "protect-pdf",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: BASE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },

    ...tools.map((tool) => ({
      url: `${BASE_URL}/tools/${tool}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}