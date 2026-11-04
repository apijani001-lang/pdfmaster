
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Word Converter Online Free – PDF to DOCX | PDFMaster",
  description:
    "Convert PDF to Word documents online for free with PDFMaster. Turn your PDF files into editable Word documents quickly and easily.",
  keywords: [
    "PDF to Word",
    "PDF to Word converter",
    "convert PDF to Word",
    "PDF to DOCX",
    "PDF to Word online",
    "free PDF to Word converter",
    "editable Word document",
  ],
  alternates: {
    canonical: "https://pdfmaster-delta.vercel.app/tools/pdf-to-word",
  },
  openGraph: {
    title: "PDF to Word Converter Online Free | PDFMaster",
    description:
      "Convert PDF files into editable Word documents online with PDFMaster.",
    url: "https://pdfmaster-delta.vercel.app/tools/pdf-to-word",
    siteName: "PDFMaster",
    type: "website",
  },
};

export default function PDFToWordLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
