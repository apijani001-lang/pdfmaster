import type { Metadata } from "next";
import "./globals.css";
import { PromoAdStrip, SiteFooter } from "./components/SiteChrome";

export const metadata: Metadata = {
  title: "PDFMaster - Free Online PDF Tools",
  description:
    "Merge, split, convert and manage PDF files online with PDFMaster. Simple and convenient PDF tools.",
  keywords: [
    "PDF tools",
    "Merge PDF",
    "Split PDF",
    "Compress PDF",
    "JPG to PDF",
    "PDF converter",
    "Free PDF tools",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <PromoAdStrip position="top" />
        {children}
        <PromoAdStrip position="bottom" />
        <SiteFooter />
      </body>
    </html>
  );
}