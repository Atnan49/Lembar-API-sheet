import type { Metadata } from "next";
import { SessionProvider } from "@/components/providers/session-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lembar | Ubah Google Sheets Jadi REST API",
  description:
    "Ubah spreadsheet Google Sheets Anda menjadi REST API instan lengkap dengan fitur auto-create tab dan autentikasi aman.",
  keywords: [
    "Google Sheets API",
    "REST API dari Google Sheets",
    "Spreadsheet Database",
    "No-code Database",
    "Lembar API",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#ffffff] text-black selection:bg-[#ffe600] selection:text-black">
        <SessionProvider>
          <Navbar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
