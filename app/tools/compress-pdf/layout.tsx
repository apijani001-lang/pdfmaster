
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF Online Free – Reduce PDF File Size | PDFMaster",
  description:
    "Compress PDF files online for free with PDFMaster. Reduce PDF file size to make documents easier to store, share and upload.",
  keywords: [
    "compress PDF",
    "compress PDF online",
    "reduce PDF file size",
    "PDF compressor",
    "free PDF compressor",
    "shrink PDF",
    "make PDF smaller",
  ],
  alternates: {
    canonical: "https://pdfmaster-delta.vercel.app/tools/compress-pdf",
  },
  openGraph: {
    title: "Compress PDF Online Free | PDFMaster",
    description:
      "Reduce your PDF file size online with PDFMaster's free PDF compressor.",
    url: "https://pdfmaster-delta.vercel.app/tools/compress-pdf",
    siteName: "PDFMaster",
    type: "website",
  },
};

export default function CompressPDFLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
