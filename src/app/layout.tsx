import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SessionProvider } from "@/components/providers/session-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/seo/json-ld";
import "./globals.css";

const siteUrl = "https://lembar.atnan.my.id";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Lembar | Ubah Google Sheets Jadi REST API Instan",
    template: "%s | Lembar API",
  },
  description:
    "Platform pengubah spreadsheet Google Sheets menjadi REST API instan siap pakai dalam 30 detik. Fitur auto-create tab, single OAuth consent, enkripsi AES-256, dan integrasi no-code/developer.",
  keywords: [
    "Google Sheets API",
    "REST API dari Google Sheets",
    "Spreadsheet Database",
    "No-code Database",
    "Sheets to JSON API",
    "Lembar API",
    "Backend Google Sheets",
    "Google Sheets CRUD API",
    "Google Spreadsheet REST API Indonesia",
  ],
  authors: [{ name: "Lembar API Team", url: siteUrl }],
  creator: "Lembar API",
  publisher: "Lembar API",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    title: "Lembar | Ubah Google Sheets Jadi REST API Instan",
    description:
      "Ubah spreadsheet Google Sheets Anda menjadi REST API instan dalam 30 detik. Dilengkapi fitur auto-create tab, endpoint CRUD lengkap, dan enkripsi data aman.",
    siteName: "Lembar API",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Lembar - Google Sheets to REST API Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lembar | Ubah Google Sheets Jadi REST API Instan",
    description:
      "Platform Google Sheets to REST API tercepat dengan fitur auto-create tab dan keamanan terenkripsi.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <JsonLd />
      </head>
      <body className="min-h-screen flex flex-col bg-[#ffffff] text-black selection:bg-[#ffe600] selection:text-black">
        <SessionProvider>
          <Navbar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
