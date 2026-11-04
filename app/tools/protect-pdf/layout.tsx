
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Protect PDF Online Free – Password Protect PDF | PDFMaster",
  description:
    "Protect PDF files online with PDFMaster. Add password protection to your PDF documents to help keep your files private and secure.",
  keywords: [
    "protect PDF",
    "protect PDF online",
    "password protect PDF",
    "add password to PDF",
    "secure PDF",
    "PDF password protection",
    "lock PDF",
  ],
  alternates: {
    canonical: "https://pdfmaster-delta.vercel.app/tools/protect-pdf",
  },
  openGraph: {
    title: "Protect PDF Online Free | PDFMaster",
    description:
      "Add password protection to your PDF documents with PDFMaster.",
    url: "https://pdfmaster-delta.vercel.app/tools/protect-pdf",
    siteName: "PDFMaster",
    type: "website",
  },
};

export default function ProtectPDFLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
