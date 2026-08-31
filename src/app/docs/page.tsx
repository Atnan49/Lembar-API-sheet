"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Copy, ArrowRight, Code2, Database, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DocsPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<"curl" | "fetch" | "php" | "python">("curl");

  const sampleKey = "lmbr_live_your_api_key_here";
  const baseUrl = "https://lembar.atnan.my.id/api/v1";

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getCodeSnippet = (endpoint: string, method: string, body?: object) => {
    const fullUrl = `${baseUrl}/${sampleKey}/${endpoint}`;

    if (selectedLang === "curl") {
      if (method === "GET") {
        return `curl -X GET "${fullUrl}"`;
      }
      if (method === "DELETE") {
        return `curl -X DELETE "${fullUrl}"`;
      }
      return `curl -X ${method} "${fullUrl}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(body || {}, null, 2)}'`;
    }

    if (selectedLang === "fetch") {
      if (method === "GET") {
        return `const response = await fetch("${fullUrl}");
const result = await response.json();
console.log(result);`;
      }
      return `const response = await fetch("${fullUrl}", {
  method: "${method}",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(${JSON.stringify(body || {}, null, 2)}),
});
const result = await response.json();
console.log(result);`;
    }

    if (selectedLang === "php") {
      if (method === "GET") {
        return `// Laravel Http Client
use Illuminate\\Support\\Facades\\Http;

$response = Http::get("${fullUrl}");
$data = $response->json();`;
      }
      return `// Laravel Http Client
use Illuminate\\Support\\Facades\\Http;

$response = Http::${method.toLowerCase()}("${fullUrl}", ${JSON.stringify(body || {}, null, 2)});
$data = $response->json();`;
    }

    if (selectedLang === "python") {
      if (method === "GET") {
        return `import requests

response = requests.get("${fullUrl}")
data = response.json()
print(data)`;
      }
      return `import requests

payload = ${JSON.stringify(body || {}, null, 2)}
response = requests.${method.toLowerCase()}("${fullUrl}", json=payload)
data = response.json()
print(data)`;
    }

    return "";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Header */}
      <div className="border-b-3 border-black pb-6 mb-10">
        <Badge variant="yellow" className="mb-2">
          Dokumentasi API
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-black leading-none">
          Referensi API Publik
        </h1>
        <p className="text-sm sm:text-base text-zinc-700 font-medium mt-2">
          Semua endpoint API dipanggil dengan menyertakan API Key unik spreadsheet Anda pada path URL.
        </p>
      </div>

      {/* Language Switcher Bar */}
      <div className="flex items-center justify-between gap-4 border-2 border-black bg-zinc-100 p-3 mb-8">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-black stroke-[2.5]" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-black">
            Pilih Bahasa:
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["curl", "fetch", "php", "python"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`px-3 py-1 text-xs font-extrabold uppercase tracking-wider border-2 border-black transition-all ${
                selectedLang === lang
                  ? "bg-[#ffe600] text-black shadow-[2px_2px_0px_#000000]"
                  : "bg-white text-black hover:bg-zinc-200"
              }`}
            >
              {lang === "fetch" ? "JavaScript" : lang === "php" ? "PHP (Laravel)" : lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Endpoints List */}
      <div className="flex flex-col gap-10">
        {/* 1. Append Row */}
        <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-extrabold uppercase bg-[#ffe600] text-black border-2 border-black">
                POST
              </span>
              <h2 className="text-base font-extrabold uppercase tracking-wider font-mono text-black">
                /api/v1/:apiKey/:sheetName
              </h2>
            </div>
            <Badge variant="zinc">Menambah Baris</Badge>
          </div>

          <p className="text-xs sm:text-sm text-zinc-700 font-medium mb-4">
            Menambahkan 1 baris baru ke tab Google Sheets yang dituju. Kunci pada JSON payload otomatis dipetakan ke nama kolom header yang sesuai.
          </p>

          <div className="relative bg-black text-white p-4 font-mono text-xs overflow-x-auto border-2 border-black">
            <button
              onClick={() => handleCopy("post-row", getCodeSnippet("Peserta", "POST", { nama: "Budi", status: "hadir" }))}
              aria-label="Salin kode"
              className="absolute top-3 right-3 px-2 py-1 text-[10px] font-extrabold uppercase bg-white text-black border-2 border-black hover:bg-[#ffe600]"
            >
              {copiedKey === "post-row" ? "Tersalin" : "Salin"}
            </button>
            <pre>{getCodeSnippet("Peserta", "POST", { nama: "Budi", status: "hadir" })}</pre>
          </div>
        </div>

        {/* 2. Read Rows */}
        <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-extrabold uppercase bg-white text-black border-2 border-black">
                GET
              </span>
              <h2 className="text-base font-extrabold uppercase tracking-wider font-mono text-black">
                /api/v1/:apiKey/:sheetName
              </h2>
            </div>
            <Badge variant="zinc">Membaca Semua Baris</Badge>
          </div>

          <p className="text-xs sm:text-sm text-zinc-700 font-medium mb-4">
            Mengambil semua data pada sheet sebagai array of JSON objects. Setiap objek menyertakan properti <code className="font-mono bg-zinc-100 px-1 border border-black">_rowNumber</code> untuk referensi update/delete.
          </p>

          <div className="relative bg-black text-white p-4 font-mono text-xs overflow-x-auto border-2 border-black">
            <button
              onClick={() => handleCopy("get-rows", getCodeSnippet("Peserta", "GET"))}
              aria-label="Salin kode"
              className="absolute top-3 right-3 px-2 py-1 text-[10px] font-extrabold uppercase bg-white text-black border-2 border-black hover:bg-[#ffe600]"
            >
              {copiedKey === "get-rows" ? "Tersalin" : "Salin"}
            </button>
            <pre>{getCodeSnippet("Peserta", "GET")}</pre>
          </div>
        </div>

        {/* 3. Auto Create Tab */}
        <div className="border-3 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] border-t-[6px] border-t-[#ffe600]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-extrabold uppercase bg-[#ffe600] text-black border-2 border-black">
                POST
              </span>
              <h2 className="text-base font-extrabold uppercase tracking-wider font-mono text-black">
                /api/v1/:apiKey/:sheetName/create
              </h2>
            </div>
            <Badge variant="yellow">Fitur Utama</Badge>
          </div>

          <p className="text-xs sm:text-sm text-zinc-700 font-medium mb-4">
            Membuat tab baru pada spreadsheet dan langsung mengisi baris pertama dengan kolom header yang ditentukan.
          </p>

          <div className="relative bg-black text-white p-4 font-mono text-xs overflow-x-auto border-2 border-black">
            <button
              onClick={() =>
                handleCopy(
                  "create-tab",
                  getCodeSnippet("Rekap2026/create", "POST", { headers: ["nim", "nama", "skor", "keterangan"] })
                )
              }
              aria-label="Salin kode"
              className="absolute top-3 right-3 px-2 py-1 text-[10px] font-extrabold uppercase bg-white text-black border-2 border-black hover:bg-[#ffe600]"
            >
              {copiedKey === "create-tab" ? "Tersalin" : "Salin"}
            </button>
            <pre>
              {getCodeSnippet("Rekap2026/create", "POST", {
                headers: ["nim", "nama", "skor", "keterangan"],
              })}
            </pre>
          </div>
        </div>

        {/* 4. Update Row */}
        <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-extrabold uppercase bg-[#ffe600] text-black border-2 border-black">
                PUT
              </span>
              <h2 className="text-base font-extrabold uppercase tracking-wider font-mono text-black">
                /api/v1/:apiKey/:sheetName/:rowId
              </h2>
            </div>
            <Badge variant="zinc">Update Baris</Badge>
          </div>

          <p className="text-xs sm:text-sm text-zinc-700 font-medium mb-4">
            Memperbarui nilai pada baris tertentu berdasarkan nomor baris (<code className="font-mono bg-zinc-100 px-1 border border-black">rowId</code> &ge; 2). Kolom yang tidak disertakan pada payload akan mempertahankan nilai sebelumnya.
          </p>

          <div className="relative bg-black text-white p-4 font-mono text-xs overflow-x-auto border-2 border-black">
            <button
              onClick={() => handleCopy("put-row", getCodeSnippet("Peserta/2", "PUT", { status: "lulus" }))}
              aria-label="Salin kode"
              className="absolute top-3 right-3 px-2 py-1 text-[10px] font-extrabold uppercase bg-white text-black border-2 border-black hover:bg-[#ffe600]"
            >
              {copiedKey === "put-row" ? "Tersalin" : "Salin"}
            </button>
            <pre>{getCodeSnippet("Peserta/2", "PUT", { status: "lulus" })}</pre>
          </div>
        </div>

        {/* 5. Delete Row */}
        <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-extrabold uppercase bg-[#ff3b30] text-white border-2 border-black">
                DELETE
              </span>
              <h2 className="text-base font-extrabold uppercase tracking-wider font-mono text-black">
                /api/v1/:apiKey/:sheetName/:rowId
              </h2>
            </div>
            <Badge variant="red">Hapus Baris</Badge>
          </div>

          <p className="text-xs sm:text-sm text-zinc-700 font-medium mb-4">
            Menghapus satu baris dari Google Sheets menggunakan nomor baris (<code className="font-mono bg-zinc-100 px-1 border border-black">rowId</code> &ge; 2).
          </p>

          <div className="relative bg-black text-white p-4 font-mono text-xs overflow-x-auto border-2 border-black">
            <button
              onClick={() => handleCopy("delete-row", getCodeSnippet("Peserta/2", "DELETE"))}
              aria-label="Salin kode"
              className="absolute top-3 right-3 px-2 py-1 text-[10px] font-extrabold uppercase bg-white text-black border-2 border-black hover:bg-[#ffe600]"
            >
              {copiedKey === "delete-row" ? "Tersalin" : "Salin"}
            </button>
            <pre>{getCodeSnippet("Peserta/2", "DELETE")}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
