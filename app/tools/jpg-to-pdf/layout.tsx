
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JPG to PDF Converter Online Free – Convert Images to PDF | PDFMaster",
  description:
    "Convert JPG images to PDF online for free with PDFMaster. Combine your images into a single PDF document quickly and easily.",
  keywords: [
    "JPG to PDF",
    "JPG to PDF converter",
    "convert JPG to PDF",
    "image to PDF",
    "JPG images to PDF",
    "free JPG to PDF converter",
    "photos to PDF",
  ],
  alternates: {
    canonical: "https://pdfmaster-delta.vercel.app/tools/jpg-to-pdf",
  },
  openGraph: {
    title: "JPG to PDF Converter Online Free | PDFMaster",
    description:
      "Convert JPG images into PDF documents online for free with PDFMaster.",
    url: "https://pdfmaster-delta.vercel.app/tools/jpg-to-pdf",
    siteName: "PDFMaster",
    type: "website",
  },
};

export default function JPGToPDFLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
