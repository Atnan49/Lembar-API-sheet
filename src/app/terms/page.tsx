import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="border-b-3 border-black pb-6 mb-8">
        <Link href="/" className="inline-block mb-4">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Kembali ke Beranda</span>
          </Button>
        </Link>
        <Badge variant="yellow" className="mb-2">
          Ketentuan Layanan
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-black">
          Syarat dan Ketentuan Layanan (Terms of Service)
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 font-medium mt-1">
          Terakhir diperbarui: 31 Agustus 2026
        </p>
      </div>

      <div className="flex flex-col gap-8 text-sm text-zinc-800 font-medium leading-relaxed">
        <section className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_#000000]">
          <h2 className="text-base font-extrabold uppercase tracking-wider text-black mb-3">
            1. Penerimaan Ketentuan
          </h2>
          <p>
            Dengan mendaftar, mengakses, atau menggunakan layanan Lembar di domain lembar.atnan.my.id, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan ini.
          </p>
        </section>

        <section className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_#000000]">
          <h2 className="text-base font-extrabold uppercase tracking-wider text-black mb-3">
            2. Ketentuan Fase Closed Beta
          </h2>
          <p className="mb-2">
            Layanan saat ini beroperasi dalam status Closed Beta (uji coba tertutup). Selama fase ini:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-700">
            <li>Layanan disediakan dengan kuota Free sebesar 1.000 request per bulan untuk tiap API key.</li>
            <li>Akses pengguna dibatasi maksimal 100 pengguna terdaftar sesuai batasan pengujian Google OAuth.</li>
            <li>Pengguna setuju untuk menggunakan layanan secara wajar dan dapat memberikan umpan balik untuk peningkatan performa platform.</li>
          </ul>
        </section>

        <section className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_#000000]">
          <h2 className="text-base font-extrabold uppercase tracking-wider text-black mb-3">
            3. Penggunaan yang Dilarang (Fair Use)
          </h2>
          <p className="mb-2">Pengguna dilarang keras untuk:</p>
          <ul className="list-disc list-inside space-y-2 text-zinc-700">
            <li>Menyalahgunakan API untuk aktivitas Denial of Service (DoS) atau penyerangan infrastruktur.</li>
            <li>Mengunggah atau menyimpan data ilegal yang melanggar hukum Republik Indonesia.</li>
            <li>Melakukan upaya bypass atau eksploitasi terhadap mekanisme rate limiter atau kuota bulanan.</li>
          </ul>
        </section>

        <section className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_#000000]">
          <h2 className="text-base font-extrabold uppercase tracking-wider text-black mb-3">
            4. Batasan Tanggung Jawab
          </h2>
          <p>
            Lembar beroperasi sebagai jembatan API berbasis Google Sheets. Kami tidak bertanggung jawab atas kegagalan eksternal dari layanan Google Cloud Platform, gangguan jaringan telekomunikasi pihak ketiga, atau kehilangan data akibat modifikasi manual pengguna langsung pada dokumen spreadsheet.
          </p>
        </section>

        <section className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_#000000]">
          <h2 className="text-base font-extrabold uppercase tracking-wider text-black mb-3">
            5. Kontak dan Bantuan
          </h2>
          <p>
            Untuk pertanyaan seputar ketentuan layanan, kerja sama kemitraan, atau pelaporan masalah teknis, Anda dapat menghubungi kami melalui:{" "}
            <a
              href="mailto:info@atnan.my.id"
              className="font-bold text-black underline underline-offset-4 hover:bg-[#ffe600] px-1"
            >
              info@atnan.my.id
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
