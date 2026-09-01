"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import {
  Database,
  ArrowRight,
  Check,
  Copy,
  Plus,
  Play,
  Key,
  ShieldCheck,
  Zap,
  Code2,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"read" | "append" | "create">("read");
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({ 0: true });

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleUpgradeClick = () => {
    if (session) {
      router.push("/dashboard?upgrade=true");
    } else {
      signIn("google", { callbackUrl: "/dashboard?upgrade=true" });
    }
  };

  const handleFreeClick = () => {
    if (session) {
      router.push("/dashboard");
    } else {
      signIn("google", { callbackUrl: "/dashboard" });
    }
  };

  // Playground simulation data
  const demoApiKey = "lmbr_live_demo847291";
  const demoEndpoints = {
    read: {
      method: "GET",
      url: `https://lembar.atnan.my.id/api/v1/${demoApiKey}/Peserta`,
      body: null,
      response: {
        success: true,
        totalRows: 2,
        headers: ["nama", "email", "status", "institusi"],
        data: [
          {
            _rowNumber: 2,
            nama: "Budi Santoso",
            email: "budi@example.com",
            status: "hadir",
            institusi: "HIMATIF UMS",
          },
          {
            _rowNumber: 3,
            nama: "Siti Rahma",
            email: "siti@example.com",
            status: "hadir",
            institusi: "Informatika",
          },
        ],
      },
    },
    append: {
      method: "POST",
      url: `https://lembar.atnan.my.id/api/v1/${demoApiKey}/Peserta`,
      body: {
        nama: "Ahmad Fauzi",
        email: "ahmad@example.com",
        status: "hadir",
        institusi: "Teknik Elektro",
      },
      response: {
        success: true,
        message: "Row appended successfully",
        rowNumber: 4,
      },
    },
    create: {
      method: "POST",
      url: `https://lembar.atnan.my.id/api/v1/${demoApiKey}/RekapAbsen/create`,
      body: {
        headers: ["nim", "nama", "tanggal", "keterangan"],
      },
      response: {
        success: true,
        message: 'Tab "RekapAbsen" created successfully with 4 headers',
        data: {
          sheetName: "RekapAbsen",
          headers: ["nim", "nama", "tanggal", "keterangan"],
        },
      },
    },
  };

  const handleCopyUrl = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-16 sm:gap-24 py-8 sm:py-16">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-start gap-6 max-w-3xl">
          <Badge variant="yellow" className="text-xs">
            Closed Beta 2026
          </Badge>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-black leading-none">
            Ubah Google Sheets Jadi REST API Instan
          </h1>

          <p className="text-base sm:text-lg text-zinc-700 font-medium leading-relaxed">
            Hubungkan spreadsheet dengan sekali login akun Google. Dapatkan endpoint CRUD cepat dan fitur
            <span className="font-extrabold text-black bg-[#ffe600] px-1.5 ml-1">
              auto-create tab baru lewat API
            </span>
            , tanpa setup service account manual.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {session ? (
              <Link href="/dashboard">
                <Button variant="primary" size="lg">
                  <span>Buka Dashboard</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </Button>
              </Link>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              >
                <span>Mulai Pakai Akun Google</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </Button>
            )}

            <Link href="/docs">
              <Button variant="secondary" size="lg">
                <Code2 className="w-5 h-5 stroke-[2.5]" />
                <span>Lihat Dokumentasi</span>
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-extrabold uppercase tracking-wider text-zinc-700">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-black stroke-[3]" />
              <span>Free Tier 1.000 Req/Bulan</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-black stroke-[3]" />
              <span>Token Terenkripsi AES-256</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-black stroke-[3]" />
              <span>Pencegahan Formula Injection</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive API Playground */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="border-3 border-black bg-white shadow-[6px_6px_0px_#000000] p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-5 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="black">Playground</Badge>
                <h2 className="text-xl font-extrabold uppercase tracking-wider text-black">
                  Uji Coba Request Real-Time
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-700 mt-1 font-medium">
                Pilih metode di bawah untuk melihat contoh format request dan respons JSON langsung.
              </p>
            </div>

            {/* Method Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab("read")}
                className={`px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider border-2 border-black transition-all ${
                  activeTab === "read"
                    ? "bg-[#ffe600] text-black shadow-[2px_2px_0px_#000000]"
                    : "bg-white text-black hover:bg-zinc-100"
                }`}
              >
                GET Read Rows
              </button>
              <button
                onClick={() => setActiveTab("append")}
                className={`px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider border-2 border-black transition-all ${
                  activeTab === "append"
                    ? "bg-[#ffe600] text-black shadow-[2px_2px_0px_#000000]"
                    : "bg-white text-black hover:bg-zinc-100"
                }`}
              >
                POST Append Row
              </button>
              <button
                onClick={() => setActiveTab("create")}
                className={`px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider border-2 border-black transition-all ${
                  activeTab === "create"
                    ? "bg-[#ffe600] text-black shadow-[2px_2px_0px_#000000]"
                    : "bg-white text-black hover:bg-zinc-100"
                }`}
              >
                POST Auto Create Tab
              </button>
            </div>
          </div>

          {/* Endpoint URL Bar */}
          <div className="flex items-center justify-between gap-3 bg-zinc-50 border-2 border-black p-3 mb-6 font-mono text-xs sm:text-sm overflow-x-auto">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`px-2 py-0.5 font-bold uppercase text-xs border-2 border-black ${
                  demoEndpoints[activeTab].method === "GET"
                    ? "bg-white text-black"
                    : "bg-[#ffe600] text-black"
                }`}
              >
                {demoEndpoints[activeTab].method}
              </span>
              <span className="truncate text-black font-semibold">
                {demoEndpoints[activeTab].url}
              </span>
            </div>
            <button
              onClick={() => handleCopyUrl(demoEndpoints[activeTab].url)}
              aria-label="Salin URL endpoint"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider bg-white border-2 border-black hover:bg-black hover:text-white transition-all active:translate-x-[1px] active:translate-y-[1px] shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Salin URL</span>
                </>
              )}
            </button>
          </div>

          {/* Request / Response Split Pane */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request Body (if POST) */}
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-black mb-2 flex items-center justify-between">
                <span>Payload Request</span>
                <span className="text-zinc-600 font-mono">application/json</span>
              </div>
              <div className="bg-black text-white p-4 font-mono text-xs overflow-x-auto border-2 border-black h-56">
                {demoEndpoints[activeTab].body ? (
                  <pre>{JSON.stringify(demoEndpoints[activeTab].body, null, 2)}</pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-500 italic">
                    (Tidak membutuhkan request body untuk GET request)
                  </div>
                )}
              </div>
            </div>

            {/* Response JSON */}
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-black mb-2 flex items-center justify-between">
                <span>Respons API Google Sheets</span>
                <span className="text-black font-mono font-bold bg-[#ffe600] px-1.5 border border-black">
                  STATUS 200 OK
                </span>
              </div>
              <div className="bg-black text-white p-4 font-mono text-xs overflow-x-auto border-2 border-black h-56">
                <pre>{JSON.stringify(demoEndpoints[activeTab].response, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Differentiators & Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="border-b-2 border-black pb-4 mb-8">
          <Badge variant="black">Fitur Unggulan</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-black mt-2">
            Mengapa Memilih Lembar
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card accent="yellow">
            <CardHeader>
              <div className="w-10 h-10 bg-[#ffe600] border-2 border-black flex items-center justify-center mb-3 shadow-[2px_2px_0px_#000000]">
                <Plus className="w-5 h-5 text-black stroke-[3]" />
              </div>
              <CardTitle>Auto Create Tab & Header</CardTitle>
              <CardDescription>
                Bikin tab/lembar kerja baru dan langsung inisialisasi baris kolom header via API tanpa perlu membuka dokumen Google Sheets manual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-600 font-mono bg-zinc-50 p-2.5 border-2 border-black">
                POST /api/v1/:key/:tab/create
              </p>
            </CardContent>
          </Card>

          <Card accent="black">
            <CardHeader>
              <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center mb-3 shadow-[2px_2px_0px_#000000]">
                <Key className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <CardTitle>Single OAuth Flow</CardTitle>
              <CardDescription>
                Consent izin akses Google Sheets digabung langsung saat login pertama. Tidak perlu download service account JSON atau setup GCP manual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-600 font-mono bg-zinc-50 p-2.5 border-2 border-black">
                OAuth2 offline access + AES-256
              </p>
            </CardContent>
          </Card>

          <Card accent="red">
            <CardHeader>
              <div className="w-10 h-10 bg-[#ff3b30] border-2 border-black flex items-center justify-center mb-3 shadow-[2px_2px_0px_#000000]">
                <ShieldCheck className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <CardTitle>Sanitasi Formula Injection</CardTitle>
              <CardDescription>
                Nilai input yang diawali simbol formula berbahaya (=, +, -, @) otomatis dinetralisir sebelum ditulis ke Google Sheets untuk keamanan penuh.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-600 font-mono bg-zinc-50 p-2.5 border-2 border-black">
                Proteksi formula injection aktif
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it Works (Developer Flow) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="border-b-2 border-black pb-4 mb-8">
          <Badge variant="black">Alur Penggunaan</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-black mt-2">
            Cara Mengubah Sheets Jadi API
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border-2 border-black p-5 bg-white shadow-[4px_4px_0px_#000000]">
            <div className="text-3xl font-extrabold text-black font-mono mb-2">01</div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-black mb-1">
              Login Akun Google
            </h3>
            <p className="text-xs text-zinc-700 font-medium">
              Masuk dengan akun Google Anda untuk memberikan izin akses ke spreadsheet pribadi atau organisasi.
            </p>
          </div>

          <div className="border-2 border-black p-5 bg-white shadow-[4px_4px_0px_#000000]">
            <div className="text-3xl font-extrabold text-black font-mono mb-2">02</div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-black mb-1">
              Tempel URL Sheet
            </h3>
            <p className="text-xs text-zinc-700 font-medium">
              Cukup tempelkan link Google Sheets ke dashboard. Sistem memverifikasi akses dan membuat API key unik.
            </p>
          </div>

          <div className="border-2 border-black p-5 bg-white shadow-[4px_4px_0px_#000000]">
            <div className="text-3xl font-extrabold text-black font-mono mb-2">03</div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-black mb-1">
              Setup Tab & Header
            </h3>
            <p className="text-xs text-zinc-700 font-medium">
              Buat tab baru lewat dashboard atau via endpoint API tanpa perlu membuka Google Sheets.
            </p>
          </div>

          <div className="border-2 border-black p-5 bg-white shadow-[4px_4px_0px_#000000]">
            <div className="text-3xl font-extrabold text-black font-mono mb-2">04</div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-black mb-1">
              Panggil dari Aplikasi
            </h3>
            <p className="text-xs text-zinc-700 font-medium">
              Gunakan curl, Fetch JS, PHP, atau Python untuk append dan fetch data secara real-time.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing & Closed Beta Plan */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="border-b-2 border-black pb-4 mb-8">
          <Badge variant="black">Skema Paket</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-black mt-2">
            Transparansi Kuota & Harga
          </h2>
          <p className="text-xs sm:text-sm text-zinc-700 font-medium mt-1">
            Selama fase Closed Beta, tier Free aktif untuk seluruh pengguna terdaftar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Beta Tier */}
          <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-base uppercase tracking-wider text-black">
                  Free Beta
                </span>
                <Badge variant="yellow">Aktif</Badge>
              </div>
              <div className="text-3xl font-extrabold font-mono text-black my-3">
                Rp0 <span className="text-xs font-normal text-zinc-600">/bln</span>
              </div>
              <ul className="space-y-2 text-xs font-bold text-zinc-700 my-4 border-t-2 border-black pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3]" />
                  <span>1.000 request / bulan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3]" />
                  <span>1 connected sheet</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3]" />
                  <span>Auto-create tab endpoint</span>
                </li>
              </ul>
            </div>
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              onClick={handleFreeClick}
            >
              Gunakan Sekarang
            </Button>
          </div>

          {/* Pro Tier (Aktif dengan Pakasir) */}
          <div className="border-3 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] flex flex-col justify-between relative bg-yellow-50/20">
            <div className="absolute -top-3 right-4 bg-[#ffe600] border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
              Paling Populer
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-base uppercase tracking-wider text-black">
                  Lembar PRO
                </span>
                <Badge variant="black">QRIS / Manual</Badge>
              </div>
              <div className="text-3xl font-extrabold font-mono text-black my-3">
                Rp49rb <span className="text-xs font-normal text-zinc-600">/bln</span>
              </div>
              <ul className="space-y-2 text-xs font-bold text-zinc-800 my-4 border-t-2 border-black pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3]" />
                  <span>50.000 request / bulan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3]" />
                  <span>Unlimited connected sheets</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3]" />
                  <span>Auto-create tab tanpa batas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3]" />
                  <span>Prioritas server & Upstash</span>
                </li>
              </ul>
            </div>
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center bg-[#ffe600] hover:bg-black hover:text-white"
              onClick={handleUpgradeClick}
            >
              Upgrade PRO (QRIS)
            </Button>
          </div>

          {/* Organisasi Tier */}
          <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
            <div>
              <div className="font-extrabold text-base uppercase tracking-wider text-black mb-2">
                Organisasi
              </div>
              <div className="text-3xl font-extrabold font-mono text-black my-3">
                Rp199rb <span className="text-xs font-normal text-zinc-600">/bln</span>
              </div>
              <ul className="space-y-2 text-xs font-bold text-zinc-700 my-4 border-t-2 border-black pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3]" />
                  <span>150.000 request / bulan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3]" />
                  <span>Multi-user (Role Access)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3]" />
                  <span>Audit log lengkap & SLA 99.9%</span>
                </li>
              </ul>
            </div>
            <a
              href="mailto:info@atnan.my.id?subject=Inquiry%20Paket%20Organisasi%20Lembar"
              className="w-full text-center inline-block py-2 text-xs font-extrabold uppercase border-2 border-black bg-zinc-100 hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_#000]"
            >
              Hubungi Tim
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section (AEO & Search Engine Snippets) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 w-full py-8">
        <div className="border-b-3 border-black pb-4 mb-8 text-center sm:text-left">
          <Badge variant="yellow" className="mb-2">
            Pertanyaan Umum
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-black">
            FAQ Seputar Lembar API
          </h2>
          <p className="text-xs sm:text-sm text-zinc-700 font-medium mt-1">
            Jawaban lengkap untuk pertanyaan teknis dan operasional yang sering diajukan.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Apa itu Lembar dan bagaimana cara kerjanya?",
              a: "Lembar adalah platform yang mengubah spreadsheet Google Sheets Anda menjadi REST API instan siap pakai. Anda cukup login dengan akun Google (single consent), masukkan link spreadsheet, dan Anda langsung mendapatkan endpoint REST (GET, POST, PUT, DELETE) serta API Key terlindungi.",
            },
            {
              q: "Bagaimana cara kerja fitur Auto-Create Tab & Header?",
              a: "Lembar menyediakan endpoint khusus 'POST /api/v1/:apiKey/:sheetName/create'. Melalui endpoint ini, aplikasi Anda bisa membuat tab baru di spreadsheet sekaligus mendefinisikan nama baris kolom header secara otomatis tanpa perlu membuka dokumen Google Sheets manual.",
            },
            {
              q: "Apakah data spreadsheet saya disimpan di server Lembar?",
              a: "Tidak. Lembar menganut prinsip minimalisasi data: data spreadsheet Anda tetap berada di Google Sheets milik Anda. Lembar hanya bertindak sebagai gateway perantara aman. Kredensial OAuth dienkripsi at-rest menggunakan algoritma AES-256-GCM berstandar industri.",
            },
            {
              q: "Platform apa saja yang bisa diintegrasikan dengan Lembar?",
              a: "Lembar menghasilkan REST API berbasis JSON standar yang dapat dihubungkan ke platform no-code/low-code (Glide, Bubble, FlutterFlow, AppSheet, Webflow), frontend web (React, Next.js, Vue, Vanilla JS), backend (Node.js, Laravel, Django, Python), maupun otomasi (Make, n8n, Zapier).",
            },
            {
              q: "Bagaimana cara melakukan upgrade ke Lembar PRO?",
              a: "Anda dapat melakukan upgrade langsung dari Dashboard dengan mengklik tombol 'Upgrade PRO'. Pembayaran didukung otomatis secara instan via QRIS Pakasir (BCA, Mandiri, GoPay, OVO, DANA, ShopeePay) seharga Rp 49.000 / bulan untuk 50.000 request.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="border-2 border-black bg-white shadow-[4px_4px_0px_#000000] overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-extrabold uppercase text-xs sm:text-sm tracking-wide text-black hover:bg-zinc-50"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-black shrink-0" />
                  <span>{item.q}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-black shrink-0 transition-transform duration-200 ${
                    openFaq[idx] ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq[idx] && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-zinc-800 font-medium leading-relaxed border-t-2 border-black pt-3 bg-zinc-50/50">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="bg-[#ffe600] border-3 border-black p-8 sm:p-12 shadow-[6px_6px_0px_#000000] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-black leading-tight">
              Siap Membangun Backend dari Google Sheets?
            </h2>
            <p className="text-sm font-bold text-black mt-2">
              Daftar sekarang di Closed Beta dan dapatkan 1.000 request gratis setiap bulan.
            </p>
          </div>
          <Button
            variant="secondary"
            size="lg"
            className="bg-white text-black hover:bg-black hover:text-white border-2 border-black shadow-[4px_4px_0px_#000000] shrink-0"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <span>Daftar dengan Google</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </Button>
        </div>
      </section>
    </div>
  );
}
