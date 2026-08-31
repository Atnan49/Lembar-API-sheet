"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Menu, X, Database, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b-3 border-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none"
        >
          <div className="w-9 h-9 bg-[#ffe600] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] transition-transform p-1">
            <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
              <line x1="2" y1="10" x2="30" y2="10" stroke="#000000" strokeWidth="2.5" />
              <line x1="13" y1="10" x2="13" y2="30" stroke="#000000" strokeWidth="2.5" />
              <line x1="13" y1="20" x2="30" y2="20" stroke="#000000" strokeWidth="2" />
              <path d="M5 14 v11 h6" stroke="#000000" strokeWidth="3" strokeLinecap="square" />
              <polygon points="19,13 26,13 21,18 27,18 18,27 20,20 16,20" fill="#000000" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-widest text-black uppercase leading-none">
              LEMBAR
            </span>
            <span className="text-[10px] font-bold text-zinc-600 tracking-wider uppercase leading-tight">
              Sheets to API
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-xs font-extrabold uppercase tracking-wider py-1 border-b-2 transition-colors ${
              isActive("/") ? "border-black text-black" : "border-transparent text-zinc-600 hover:text-black"
            }`}
          >
            Beranda
          </Link>
          <Link
            href="/docs"
            className={`text-xs font-extrabold uppercase tracking-wider py-1 border-b-2 transition-colors ${
              isActive("/docs") ? "border-black text-black" : "border-transparent text-zinc-600 hover:text-black"
            }`}
          >
            Dokumentasi API
          </Link>
          {session && (
            <Link
              href="/dashboard"
              className={`text-xs font-extrabold uppercase tracking-wider py-1 border-b-2 transition-colors ${
                isActive("/dashboard") ? "border-black text-black" : "border-transparent text-zinc-600 hover:text-black"
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Desktop Auth CTA */}
        <div className="hidden md:flex items-center gap-3">
          {status === "loading" ? (
            <div className="h-9 w-28 bg-zinc-100 border-2 border-black animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="primary" size="sm">
                  <LayoutDashboard className="w-4 h-4 stroke-[2.5]" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                title="Keluar"
              >
                <LogOut className="w-4 h-4 stroke-[2.5]" />
                <span className="sr-only sm:not-sr-only">Keluar</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              <span>Masuk Google</span>
            </Button>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
            className="p-2 border-2 border-black bg-white active:translate-x-[1px] active:translate-y-[1px] min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <Menu className="w-6 h-6 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t-2 border-black bg-white px-4 py-5 flex flex-col gap-4">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`text-sm font-extrabold uppercase tracking-wider py-2 px-3 border-2 ${
              isActive("/") ? "bg-[#ffe600] border-black text-black" : "border-black bg-white text-black"
            }`}
          >
            Beranda
          </Link>
          <Link
            href="/docs"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`text-sm font-extrabold uppercase tracking-wider py-2 px-3 border-2 ${
              isActive("/docs") ? "bg-[#ffe600] border-black text-black" : "border-black bg-white text-black"
            }`}
          >
            Dokumentasi API
          </Link>
          {session && (
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-sm font-extrabold uppercase tracking-wider py-2 px-3 border-2 ${
                isActive("/dashboard") ? "bg-[#ffe600] border-black text-black" : "border-black bg-white text-black"
              }`}
            >
              Dashboard
            </Link>
          )}

          <div className="pt-2 border-t-2 border-black flex flex-col gap-2">
            {session ? (
              <>
                <div className="text-xs font-bold text-zinc-600 px-1 truncate">
                  Login sebagai: {session.user?.email}
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full justify-center"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="w-4 h-4 stroke-[2.5]" />
                  <span>Keluar</span>
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              >
                <span>Masuk dengan Akun Google</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
