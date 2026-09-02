import React from "react";
import Link from "next/link";
import { Database } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t-3 border-black py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#ffe600] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] p-1">
            <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
              <line x1="2" y1="10" x2="30" y2="10" stroke="#000000" strokeWidth="2.5" />
              <line x1="13" y1="10" x2="13" y2="30" stroke="#000000" strokeWidth="2.5" />
              <line x1="13" y1="20" x2="30" y2="20" stroke="#000000" strokeWidth="2" />
              <path d="M5 14 v11 h6" stroke="#000000" strokeWidth="3" strokeLinecap="square" />
              <polygon points="19,13 26,13 21,18 27,18 18,27 20,20 16,20" fill="#000000" />
            </svg>
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
          <Link href="/pricing" className="hover:underline underline-offset-4">
            Harga & Paket
          </Link>
          <Link href="/docs" className="hover:underline underline-offset-4">
            Dokumentasi API
          </Link>
          <Link href="/privacy" className="hover:underline underline-offset-4">
            Kebijakan Privasi
          </Link>
          <Link href="/terms" className="hover:underline underline-offset-4">
            Syarat Layanan
          </Link>
          <a
            href="mailto:info@atnan.my.id"
            className="hover:underline underline-offset-4 text-zinc-900 flex items-center gap-1"
          >
            <span>Kontak: info@atnan.my.id</span>
          </a>
        </div>

        {/* Status / Copyright / Creator */}
        <div className="text-xs text-zinc-600 font-bold uppercase tracking-wider text-center md:text-right flex flex-col items-center md:items-end gap-1">
          <div>lembar.atnan.my.id</div>
          <div className="text-[11px] text-black font-extrabold tracking-wider">
            Developed by <span className="bg-[#ffe600] px-1.5 py-0.5 border border-black text-black inline-block shadow-[1px_1px_0px_#000000]">AtnanLabs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
