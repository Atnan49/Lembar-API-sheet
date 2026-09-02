"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import {
  Check,
  Zap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  CreditCard,
  Building,
  Mail,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [userPlan, setUserPlan] = useState<"FREE" | "PRO">("FREE");
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({ 0: true, 1: true });

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/billing/status")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUserPlan(data.plan);
            setPlanExpiresAt(data.planExpiresAt);
          }
        })
        .catch(() => {});
    }
  }, [status]);

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

  const isProActive = userPlan === "PRO";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col gap-12 sm:gap-16">
      {/* Top Header & Breadcrumb */}
      <div>
        <Link href="/" className="inline-block mb-4">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Kembali ke Beranda</span>
          </Button>
        </Link>
        <div className="flex flex-col items-start gap-3 border-b-3 border-black pb-6">
          <Badge variant="yellow" className="text-xs">
            Transparansi Harga & Kuota
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-black leading-none">
            Skema Paket & Harga Lembar
          </h1>
          <p className="text-sm sm:text-base text-zinc-700 font-medium max-w-2xl leading-relaxed">
            Pilih paket yang sesuai dengan kebutuhan integrasi Anda. Tanpa biaya tersembunyi, tanpa kontrak rumit, dan dapat di-upgrade instan dengan QRIS.
          </p>
        </div>
      </div>

      {/* User Current Subscription Status Banner (If Logged In) */}
      {session && (
        <div
          className={`border-3 border-black p-5 sm:p-6 shadow-[5px_5px_0px_#000000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isProActive ? "bg-[#ffe600]" : "bg-white"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000]">
              {isProActive ? (
                <Sparkles className="w-5 h-5 text-black stroke-[2.5]" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-black stroke-[2.5]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm uppercase tracking-wider text-black">
                  Status Akun: {session.user?.email}
                </span>
                <Badge variant={isProActive ? "black" : "yellow"}>
                  {isProActive ? "PRO PLAN AKTIF" : "FREE TIER"}
                </Badge>
              </div>
              <p className="text-xs text-zinc-800 font-bold mt-0.5">
                {isProActive && planExpiresAt
                  ? `Paket PRO aktif hingga ${new Date(planExpiresAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })} (Kuota: 50.000 req/bulan)`
                  : "Anda saat ini berada di paket Free Tier (1.000 req/bulan, 1 sheet)."}
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            {isProActive ? (
              <Link href="/dashboard" className="w-full sm:w-auto inline-block">
                <Button variant="secondary" size="md" className="w-full justify-center bg-white text-black">
                  <LayoutDashboard className="w-4 h-4 stroke-[2.5]" />
                  <span>Buka Dashboard</span>
                </Button>
              </Link>
            ) : (
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center bg-[#ffe600] text-black hover:bg-black hover:text-white"
                onClick={handleUpgradeClick}
              >
                <Zap className="w-4 h-4 fill-current stroke-[2.5]" />
                <span>Upgrade ke PRO (Rp 49rb)</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        {/* Tier 1: Free Tier */}
        <div className="border-2 border-black bg-white p-6 sm:p-7 shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-lg uppercase tracking-wider text-black">
                Free Tier
              </span>
              <Badge variant="yellow">Mulai Gratis</Badge>
            </div>
            <p className="text-xs text-zinc-600 font-medium">
              Cocok untuk eksplorasi, eksperimen awal, dan proyek tugas hobi.
            </p>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-black my-4">
              Rp0 <span className="text-xs font-normal text-zinc-600">/bulan</span>
            </div>

            <ul className="space-y-3 text-xs font-bold text-zinc-800 my-6 border-t-2 border-black pt-5">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                <span><strong>1.000 request</strong> per bulan</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                <span><strong>1 connected</strong> spreadsheet</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                <span>Endpoint auto-create tab & header</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                <span>Enkripsi token AES-256-GCM</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                <span>Proteksi sanitasi formula injection</span>
              </li>
            </ul>
          </div>

          <Button
            variant="secondary"
            size="md"
            className="w-full justify-center mt-2 border-2 border-black"
            onClick={handleFreeClick}
          >
            {session && !isProActive ? "Buka Dashboard" : "Mulai Pakai Gratis"}
          </Button>
        </div>

        {/* Tier 2: Lembar PRO */}
        <div className="border-3 border-black bg-yellow-50/25 p-6 sm:p-7 shadow-[6px_6px_0px_#000000] flex flex-col justify-between relative bg-white">
          <div className="absolute -top-3.5 right-6 bg-[#ffe600] border-2 border-black px-3 py-0.5 text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
            Paling Populer
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-lg uppercase tracking-wider text-black">
                Lembar PRO
              </span>
              <Badge variant="black">QRIS Instan</Badge>
            </div>
            <p className="text-xs text-zinc-600 font-medium">
              Ideal untuk aplikasi produksi, form aktif, dan integrasi no-code.
            </p>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-black my-4">
              Rp49.000 <span className="text-xs font-normal text-zinc-600">/30 hari</span>
            </div>

            <ul className="space-y-3 text-xs font-bold text-zinc-900 my-6 border-t-2 border-black pt-5">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                <span><strong>50.000 request</strong> per bulan</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                <span><strong>Unlimited</strong> connected sheets</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                <span>Auto-create tab tanpa batas</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                <span>Prioritas server & Upstash Redis</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                <span>Pembayaran QRIS otomatis aktif</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                <span>Dukungan email prioritas</span>
              </li>
            </ul>
          </div>

          {isProActive ? (
            <Link href="/dashboard" className="w-full">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center bg-[#ffe600] text-black hover:bg-black hover:text-white"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Paket Anda Saat Ini</span>
              </Button>
            </Link>
          ) : (
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center bg-[#ffe600] text-black hover:bg-black hover:text-white shadow-[3px_3px_0px_#000]"
              onClick={handleUpgradeClick}
            >
              <Zap className="w-4 h-4 fill-current stroke-[2.5]" />
              <span>Upgrade PRO Sekarang</span>
            </Button>
          )}
        </div>

        {/* Tier 3: Organisasi */}
        <div className="border-2 border-black bg-white p-6 sm:p-7 shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-lg uppercase tracking-wider text-black">
                Organisasi
              </span>
              <Badge variant="black">Custom Limit</Badge>
            </div>
            <p className="text-xs text-zinc-600 font-medium">
              Untuk tim bisnis, agensi, dan kebutuhan volume tinggi.
            </p>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-black my-4">
              Rp199.000 <span className="text-xs font-normal text-zinc-600">/bulan</span>
            </div>

            <ul className="space-y-3 text-xs font-bold text-zinc-800 my-6 border-t-2 border-black pt-5">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                <span><strong>150.000+ request</strong> per bulan</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                <span>Unlimited spreadsheet & tab</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                <span>Multi-user (Role Access Management)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                <span>Audit log lengkap & SLA 99.9%</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                <span>Dukungan langsung via Telegram VIP</span>
              </li>
            </ul>
          </div>

          <a
            href="mailto:info@atnan.my.id?subject=Inquiry%20Paket%20Organisasi%20Lembar"
            className="w-full text-center inline-block py-2.5 text-xs font-extrabold uppercase border-2 border-black bg-zinc-100 hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_#000]"
          >
            Hubungi Tim via Email
          </a>
        </div>
      </section>

      {/* Feature Comparison Matrix Table */}
      <section className="w-full">
        <div className="border-b-2 border-black pb-4 mb-6">
          <Badge variant="black">Komparasi Detail</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-black mt-2">
            Matriks Perbandingan Fitur
          </h2>
        </div>

        <div className="border-3 border-black bg-white shadow-[5px_5px_0px_#000000] overflow-x-auto">
          <table className="w-full text-left border-collapse font-medium text-xs sm:text-sm">
            <thead>
              <tr className="border-b-3 border-black bg-zinc-100 font-extrabold uppercase tracking-wider text-black">
                <th className="p-4 border-r-2 border-black min-w-[200px]">Fitur & Kapabilitas</th>
                <th className="p-4 border-r-2 border-black text-center min-w-[120px]">Free Tier</th>
                <th className="p-4 border-r-2 border-black text-center bg-[#ffe600] min-w-[140px]">Lembar PRO</th>
                <th className="p-4 text-center min-w-[140px]">Organisasi</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black text-zinc-900 font-medium">
              <tr>
                <td className="p-4 border-r-2 border-black font-bold">Kuota Request per Bulan</td>
                <td className="p-4 border-r-2 border-black text-center">1.000 req</td>
                <td className="p-4 border-r-2 border-black text-center font-bold bg-yellow-50/40">50.000 req</td>
                <td className="p-4 text-center font-bold">150.000+ req</td>
              </tr>
              <tr>
                <td className="p-4 border-r-2 border-black font-bold">Jumlah Spreadsheet Terhubung</td>
                <td className="p-4 border-r-2 border-black text-center">1 Sheet</td>
                <td className="p-4 border-r-2 border-black text-center font-bold bg-yellow-50/40">Unlimited</td>
                <td className="p-4 text-center font-bold">Unlimited</td>
              </tr>
              <tr>
                <td className="p-4 border-r-2 border-black font-bold">Operasi CRUD Lengkap (GET, POST, PUT, DELETE)</td>
                <td className="p-4 border-r-2 border-black text-center">✓</td>
                <td className="p-4 border-r-2 border-black text-center bg-yellow-50/40 font-bold">✓</td>
                <td className="p-4 text-center font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-4 border-r-2 border-black font-bold">Auto-Create Tab & Header Endpoint (/create)</td>
                <td className="p-4 border-r-2 border-black text-center">✓</td>
                <td className="p-4 border-r-2 border-black text-center bg-yellow-50/40 font-bold">✓ (Prioritas)</td>
                <td className="p-4 text-center font-bold">✓ (Prioritas)</td>
              </tr>
              <tr>
                <td className="p-4 border-r-2 border-black font-bold">Enkripsi Kredensial AES-256-GCM</td>
                <td className="p-4 border-r-2 border-black text-center">✓</td>
                <td className="p-4 border-r-2 border-black text-center bg-yellow-50/40 font-bold">✓</td>
                <td className="p-4 text-center font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-4 border-r-2 border-black font-bold">Pencegahan Formula Injection Otomatis</td>
                <td className="p-4 border-r-2 border-black text-center">✓</td>
                <td className="p-4 border-r-2 border-black text-center bg-yellow-50/40 font-bold">✓</td>
                <td className="p-4 text-center font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-4 border-r-2 border-black font-bold">Metode Pembayaran</td>
                <td className="p-4 border-r-2 border-black text-center">Gratis</td>
                <td className="p-4 border-r-2 border-black text-center font-bold bg-yellow-50/40">QRIS Instan (Pakasir)</td>
                <td className="p-4 text-center">Invoice / Transfer</td>
              </tr>
              <tr>
                <td className="p-4 border-r-2 border-black font-bold">Dukungan Bantuan</td>
                <td className="p-4 border-r-2 border-black text-center">Komunitas / Docs</td>
                <td className="p-4 border-r-2 border-black text-center bg-yellow-50/40 font-bold">Email Prioritas</td>
                <td className="p-4 text-center font-bold">Direct Telegram VIP</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Billing FAQ Section */}
      <section className="w-full">
        <div className="border-b-2 border-black pb-4 mb-6">
          <Badge variant="yellow">FAQ Pembayaran</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-black mt-2">
            Pertanyaan Seputar Langganan & Billing
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Bagaimana cara melakukan pembayaran Lembar PRO?",
              a: "Pembayaran dilakukan langsung melalui checkout QRIS Pakasir. Anda cukup menekan tombol 'Upgrade PRO', lalu memindai kode QRIS menggunakan e-wallet (GoPay, OVO, DANA, ShopeePay, LinkAja) atau aplikasi mobile banking bank mana pun (BCA, Mandiri, BRI, BNI, CIMB, dll).",
            },
            {
              q: "Apakah akun saya langsung aktif setelah scan QRIS?",
              a: "Ya. Sistem webhook Lembar terhubung real-time dengan gateway Pakasir. Begitu pembayaran Anda terverifikasi, status akun otomatis berubah menjadi PRO dan batas kuota semua spreadsheet Anda langsung naik ke 50.000 request per bulan.",
            },
            {
              q: "Apakah ada biaya perpanjangan otomatis yang mendebet saldo saya?",
              a: "Tidak ada. Lembar menggunakan sistem prabayar (prepaid). Anda hanya membayar ketika ingin mengaktifkan atau memperpanjang paket selama 30 hari ke depan, tanpa kekhawatiran auto-debit diam-diam.",
            },
            {
              q: "Apa yang terjadi jika kuota request bulanan saya habis?",
              a: "Jika kuota mencapai batas, pemanggilan API akan mengembalikan respons HTTP 429 (Too Many Requests) secara aman tanpa merusak data spreadsheet Anda. Anda dapat meng-upgrade paket atau menunggu reset siklus kuota bulanan berikutnya.",
            },
            {
              q: "Apakah saya bisa menghubungkan beberapa spreadsheet sekaligus di akun PRO?",
              a: "Ya, akun Lembar PRO mendukung jumlah connected sheets tanpa batas (unlimited spreadsheets). Setiap spreadsheet akan memiliki API key unik masing-masing.",
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

      {/* Custom Inquiry Callout */}
      <section className="bg-zinc-100 border-3 border-black p-6 sm:p-8 shadow-[5px_5px_0px_#000000] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-extrabold uppercase tracking-tight text-black">
            Butuh Kapasitas Khusus atau Kustomisasi?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-700 font-medium mt-1">
            Hubungi tim teknis kami untuk integrasi enterprise, SLA dedicated, atau pengaturan kuota skala besar.
          </p>
        </div>
        <a
          href="mailto:info@atnan.my.id?subject=Inquiry%20Kustom%20Lembar%20API"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider bg-black text-white hover:bg-[#ffe600] hover:text-black border-2 border-black transition-all shadow-[3px_3px_0px_#000] shrink-0"
        >
          <Mail className="w-4 h-4 stroke-[2.5]" />
          <span>Hubungi: info@atnan.my.id</span>
        </a>
      </section>
    </div>
  );
}
