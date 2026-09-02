import React from "react";

/**
 * JSON-LD Schema Structured Data for AEO (Answer Engine Optimization) & Rich Snippets
 */
export function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://lembar.atnan.my.id/#software",
        "name": "Lembar API",
        "url": "https://lembar.atnan.my.id",
        "description": "Platform pengubah Google Sheets menjadi REST API instan dengan dukungan single OAuth consent, auto-create tab, dan integrasi no-code/developer.",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "offers": [
          {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "IDR",
            "name": "Free Tier",
            "description": "1.000 requests per bulan, 1 connected sheet, auto-create tab",
          },
          {
            "@type": "Offer",
            "price": "49000",
            "priceCurrency": "IDR",
            "name": "Lembar PRO",
            "description": "50.000 requests per bulan, unlimited sheets, prioritas kecepatan",
          },
        ],
        "author": {
          "@type": "Organization",
          "@id": "https://lembar.atnan.my.id/#organization",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://lembar.atnan.my.id/#organization",
        "name": "Lembar API",
        "url": "https://lembar.atnan.my.id",
        "logo": {
          "@type": "ImageObject",
          "url": "https://lembar.atnan.my.id/logo.svg",
          "width": "512",
          "height": "512",
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "info@atnan.my.id",
          "contactType": "customer service",
          "availableLanguage": ["Indonesian", "English"],
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://lembar.atnan.my.id/#website",
        "url": "https://lembar.atnan.my.id",
        "name": "Lembar - Google Sheets to REST API",
        "publisher": {
          "@id": "https://lembar.atnan.my.id/#organization",
        },
        "inLanguage": "id-ID",
      },
      {
        "@type": "FAQPage",
        "@id": "https://lembar.atnan.my.id/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Apa itu Lembar?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Lembar adalah platform yang mengubah Google Sheets menjadi REST API instan dalam 30 detik tanpa perlu setup Cloud Console atau Service Account manual yang rumit.",
            },
          },
          {
            "@type": "Question",
            "name": "Bagaimana cara mengubah Google Sheets menjadi REST API di Lembar?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Cukup login dengan Google (single consent), masukkan link URL Google Sheets Anda di dashboard, dan Anda akan langsung mendapatkan API Key serta endpoint REST siap pakai (GET, POST, PUT, DELETE).",
            },
          },
          {
            "@type": "Question",
            "name": "Apakah data Google Sheets saya aman?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sangat aman. Lembar menerapkan prinsip minimalisasi data: data spreadsheet Anda tidak disimpan permanen di database internal kami. Refresh token Google OAuth dienkripsi at-rest menggunakan AES-256-GCM, dan seluruh endpoint dilengkapi proteksi Formula Injection serta rate limiter.",
            },
          },
          {
            "@type": "Question",
            "name": "Apakah Lembar mendukung pembuatan tab dan baris header otomatis?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Ya, Lembar memiliki endpoint khusus 'POST /api/v1/:apiKey/:sheetName/create' yang memungkinkan pembuatan tab baru dan inisialisasi baris kolom header secara otomatis melalui API.",
            },
          },
          {
            "@type": "Question",
            "name": "Berapa kuota request bulanan yang disediakan?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Tier Free menyediakan 1.000 request per bulan. Anda dapat melakukan upgrade ke tier PRO seharga Rp 49.000/bulan untuk mendapatkan 50.000 request per bulan dan unlimited connected sheets.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
