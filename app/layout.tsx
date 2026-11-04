
import type { Metadata } from "next";
import "./globals.css";
import { PromoAdStrip, SiteFooter } from "./components/SiteChrome";

export const metadata: Metadata = {
  metadataBase: new URL("https://pdfmaster-delta.vercel.app"),

  title: {
    default: "PDFMaster - Free Online PDF Tools",
    template: "%s | PDFMaster",
  },

  description:
    "Use PDFMaster free online PDF tools to merge, split, compress and convert PDF files. Convert PDF to Word, PDF to JPG, JPG to PDF and more.",

  keywords: [
    "free PDF tools",
    "PDF tools online",
    "merge PDF online",
    "split PDF online",
    "compress PDF online",
    "PDF to Word converter",
    "PDF to JPG converter",
    "JPG to PDF converter",
    "Word to PDF converter",
    "protect PDF online",
  ],

  verification: {
    google: "JQpFkHSzAqT8DBHp6bNavWtfcvFfr7F2tVnZo8IELNc",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  openGraph: {
    title: "PDFMaster - Free Online PDF Tools",
    description:
      "Merge, split, compress and convert PDF files online with PDFMaster.",
    url: "https://pdfmaster-delta.vercel.app",
    siteName: "PDFMaster",
    type: "website",
  },
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
