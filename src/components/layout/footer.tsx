import React from "react";
import Link from "next/link";
import { Database } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t-3 border-black py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#ffe600] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
            <Database className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-widest uppercase text-black">
              LEMBAR
            </div>
            <div className="text-xs text-zinc-600 font-medium">
              Google Sheets to REST API Platform
            </div>
          </div>
        </div>

        {/* Real Links (R-24 Compliance: no dead links) */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-extrabold uppercase tracking-wider text-black">
          <Link href="/docs" className="hover:underline underline-offset-4">
            Dokumentasi API
          </Link>
          <Link href="/privacy" className="hover:underline underline-offset-4">
            Kebijakan Privasi
          </Link>
          <Link href="/terms" className="hover:underline underline-offset-4">
            Syarat Layanan
          </Link>
        </div>

        {/* Status / Copyright */}
        <div className="text-xs text-zinc-600 font-bold uppercase tracking-wider text-center md:text-right">
          Closed Beta &bull; lembar.atnan.my.id
        </div>
      </div>
    </footer>
  );
}
