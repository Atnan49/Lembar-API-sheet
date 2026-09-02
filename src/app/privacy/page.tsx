import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
          Kepatuhan Legal
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-black">
          Kebijakan Privasi (Privacy Policy)
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 font-medium mt-1">
          Terakhir diperbarui: 31 Agustus 2026
        </p>
      </div>

      <div className="flex flex-col gap-8 text-sm text-zinc-800 font-medium leading-relaxed">
        <section className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_#000000]">
          <h2 className="text-base font-extrabold uppercase tracking-wider text-black mb-3">
            1. Ringkasan dan Komitmen Kami
          </h2>
          <p>
            Platform <strong>Lembar</strong> berkomitmen untuk melindungi privasi dan keamanan data pengguna. Lembar hanya bertindak sebagai jembatan teknis (bridge) yang mengubah Google Sheets menjadi REST API. Kami menganut prinsip minimalisasi data: isi data spreadsheet Anda tetap berada di server Google Sheets milik Anda dan tidak kami salin atau simpan ke database internal kami secara permanen.
          </p>
        </section>

        <section className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_#000000]">
          <h2 className="text-base font-extrabold uppercase tracking-wider text-black mb-3">
            2. Data yang Kami Kumpulkan
          </h2>
          <ul className="list-disc list-inside space-y-2 text-zinc-700">
            <li>
              <strong>Informasi Akun Google:</strong> Nama, alamat email, dan foto profil yang diperoleh saat Anda melakukan login dengan Google OAuth.
            </li>
            <li>
              <strong>Kredensial Akses Google Sheets:</strong> Refresh token Google OAuth untuk mengeksekusi operasi baca, tambah, ubah, dan buat tab pada spreadsheet yang Anda hubungkan.
            </li>
            <li>
              <strong>Metadata Spreadsheet:</strong> ID spreadsheet, nama spreadsheet, dan nama tab yang Anda pilih untuk dihubungkan.
            </li>
            <li>
              <strong>Log Pemakaian API:</strong> Catatan teknis anonim berupa method HTTP, endpoint yang dipanggil, status code, dan waktu pemrosesan untuk keperluan pembatasan kuota (rate limiting) dan investigasi error.
            </li>
          </ul>
        </section>

        <section className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_#000000]">
          <h2 className="text-base font-extrabold uppercase tracking-wider text-black mb-3">
            3. Penggunaan dan Keamanan Data Google (Google API Limited Use Disclosure)
          </h2>
          <p className="mb-3">
            Penggunaan dan transfer informasi yang diterima dari Google APIs oleh <strong>Lembar</strong> ke aplikasi lain akan mematuhi{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline underline-offset-4 hover:bg-[#ffe600] px-1 text-black"
            >
              Google API Services User Data Policy
            </a>
            , termasuk persyaratan <em>Limited Use</em>:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-700">
            <li>
              Kredensial refresh token Anda <strong>wajib dienkripsi secara at-rest</strong> menggunakan algoritma kriptografi terstandar industri (AES-256-GCM) sebelum disimpan di database kami.
            </li>
            <li>
              Kunci enkripsi disimpan terpisah pada variabel lingkungan server (environment variables) yang terlindungi.
            </li>
            <li>
              Kami tidak pernah menjual, menyewakan, atau mentransfer data pengguna Google Anda kepada pihak ketiga atau jaringan periklanan.
            </li>
            <li>
              Data Google Sheets pengguna hanya diakses secara langsung saat ada instruksi request API yang terotentikasi dan tidak digunakan untuk melatih model kecerdasan buatan (AI/ML).
            </li>
          </ul>
        </section>

        <section className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_#000000]">
          <h2 className="text-base font-extrabold uppercase tracking-wider text-black mb-3">
            4. Hak Pengguna dan Penghapusan Data (UU PDP)
          </h2>
          <p>
            Anda memiliki kontrol penuh atas data Anda. Kapan saja Anda memilih untuk menghapus akun atau memutuskan (disconnect) spreadsheet dari dashboard, token enkripsi dan data terkait akan dihapus secara permanen (hard delete) dari database kami. Anda juga dapat mencabut izin akses Lembar langsung melalui pengaturan akun Google Anda di menu Keamanan Google.
          </p>
        </section>

        <section className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_#000000]">
          <h2 className="text-base font-extrabold uppercase tracking-wider text-black mb-3">
            5. Kontak & Permintaan Bantuan
          </h2>
          <p>
            Apabila Anda memiliki pertanyaan mengenai kebijakan privasi, permohonan penghapusan data akun, atau kendala keamanan lainnya, silakan hubungi kami melalui email resmi:{" "}
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
