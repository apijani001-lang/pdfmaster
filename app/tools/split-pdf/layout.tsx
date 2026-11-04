
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF Online Free – Separate PDF Pages | PDFMaster",
  description:
    "Split PDF files online for free with PDFMaster. Extract individual pages or divide your PDF document into separate files quickly and easily.",
  keywords: [
    "split PDF",
    "split PDF online",
    "separate PDF pages",
    "extract PDF pages",
    "PDF splitter",
    "free PDF splitter",
    "divide PDF pages",
  ],
  alternates: {
    canonical: "https://pdfmaster-delta.vercel.app/tools/split-pdf",
  },
  openGraph: {
    title: "Split PDF Online Free | PDFMaster",
    description:
      "Separate PDF pages and extract pages from your PDF documents with PDFMaster.",
    url: "https://pdfmaster-delta.vercel.app/tools/split-pdf",
    siteName: "PDFMaster",
    type: "website",
  },
};

export default function SplitPDFLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
