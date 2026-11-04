
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merge PDF Online Free – Combine PDF Files | PDFMaster",
  description:
    "Merge multiple PDF files into one document online for free with PDFMaster. Combine your PDF documents quickly with a simple and easy-to-use tool.",
  keywords: [
    "merge PDF",
    "merge PDF online",
    "combine PDF files",
    "join PDF files",
    "free PDF merger",
    "combine PDF online",
  ],
  alternates: {
    canonical: "https://pdfmaster-delta.vercel.app/tools/merge-pdf",
  },
  openGraph: {
    title: "Merge PDF Online Free | PDFMaster",
    description:
      "Combine multiple PDF files into one document with PDFMaster's free online PDF merger.",
    url: "https://pdfmaster-delta.vercel.app/tools/merge-pdf",
    siteName: "PDFMaster",
    type: "website",
  },
};

export default function MergePDFLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
