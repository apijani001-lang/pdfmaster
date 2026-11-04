
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to JPG Converter Online Free – Convert PDF to Images | PDFMaster",
  description:
    "Convert PDF pages into JPG images online for free with PDFMaster. Turn your PDF documents into downloadable images quickly and easily.",
  keywords: [
    "PDF to JPG",
    "PDF to JPG converter",
    "convert PDF to JPG",
    "PDF to image",
    "PDF pages to JPG",
    "free PDF to JPG converter",
    "PDF image converter",
  ],
  alternates: {
    canonical: "https://pdfmaster-delta.vercel.app/tools/pdf-to-jpg",
  },
  openGraph: {
    title: "PDF to JPG Converter Online Free | PDFMaster",
    description:
      "Convert PDF pages into JPG images online with PDFMaster.",
    url: "https://pdfmaster-delta.vercel.app/tools/pdf-to-jpg",
    siteName: "PDFMaster",
    type: "website",
  },
};

export default function PDFToJPGLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
