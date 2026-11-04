
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word to PDF Converter Online Free – DOCX to PDF | PDFMaster",
  description:
    "Convert Word documents to PDF online for free with PDFMaster. Turn DOC and DOCX files into PDF documents quickly and easily.",
  keywords: [
    "Word to PDF",
    "Word to PDF converter",
    "convert Word to PDF",
    "DOCX to PDF",
    "DOC to PDF",
    "Word document to PDF",
    "free Word to PDF converter",
  ],
  alternates: {
    canonical: "https://pdfmaster-delta.vercel.app/tools/word-to-pdf",
  },
  openGraph: {
    title: "Word to PDF Converter Online Free | PDFMaster",
    description:
      "Convert Word documents into PDF files online for free with PDFMaster.",
    url: "https://pdfmaster-delta.vercel.app/tools/word-to-pdf",
    siteName: "PDFMaster",
    type: "website",
  },
};

export default function WordToPDFLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
