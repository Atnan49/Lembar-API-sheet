# Vibecoding Document — Lembar

> **Lembar** — Google Sheets to REST API, mirip SteinHQ, dengan fitur auto-create tab. Ditujukan untuk publik (developer, komunitas, organisasi seperti HIMATIF).

---

## 1. Ringkasan Produk

**Masalah:** Developer/organisasi butuh "database no-setup" cepat pakai Google Sheets, tapi:
- SteinHQ nggak bisa auto-create tab baru lewat API
- Setup Google Sheets API resmi (service account, OAuth) ribet buat non-developer

**Solusi:** Platform yang mengubah Google Sheets jadi REST API, dengan onboarding OAuth Google yang gampang, dan fitur auto-create tab + header yang jadi pembeda utama dari kompetitor.

**Target pengguna:**
- Developer yang butuh backend cepat buat prototipe/MVP
- Organisasi/komunitas (HIMATIF, UKM, event) buat form pendaftaran, rekap absen, dsb tanpa bikin backend sendiri
- No-code/low-code builder yang butuh data store simpel

---

## 2. Stack Teknis

| Layer | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 15 (App Router) | Full-stack serverless, cocok deploy di Vercel |
| Hosting | Vercel | Serverless API routes, auto-scaling, gampang CI/CD dari GitHub |
| Database internal | PostgreSQL (Vercel Postgres / Neon / Supabase) | Simpan user, connected_sheets, api_keys, usage_logs |
| ORM | Prisma | Type-safe, migrasi gampang |
| Auth user (dashboard) | NextAuth.js / Auth.js — Google Provider saja | Login khusus akun Google, sekaligus jadi pintu masuk consent OAuth ke Sheets (satu flow, bukan dua kali izin) |
| Auth ke Google Sheets | Google OAuth 2.0 (scope `spreadsheets` digabung ke scope login) | User connect sheet mereka sendiri tanpa service account manual |
| Rate limiting | Upstash Redis + `@upstash/ratelimit` | Serverless-friendly, cocok sama Vercel |
| Styling dashboard | Tailwind CSS + shadcn/ui | Cepat, konsisten |

**Catatan penting soal Vercel:**
- Semua API route harus **stateless & short-lived** (Vercel function timeout default 10-60 detik tergantung plan) — cocok karena operasi append/read/create row memang cepat
- Jangan pakai long-running job di dalam API route (misal sync besar) — kalau nanti butuh proses berat, pakai Vercel Cron Jobs atau queue eksternal (Upstash QStash)
- Environment variables (Google Client ID/Secret, DB URL) disimpan di Vercel dashboard, bukan hardcode

---

## 3. Arsitektur Alur

```
User Dashboard (Next.js, Vercel)
     │
     ├── Login pakai akun Google (NextAuth, Google Provider) ──► Postgres (users table)
     │        │
     │        └── Scope login sudah termasuk `spreadsheets`, jadi consent
     │            akses Sheets didapat sekaligus saat login pertama
     │
     ├── Connect Sheet ──► pakai token dari login ──► simpan refresh_token
     │                                                (encrypted) di connected_sheets
     │
     └── Generate API Key ──► simpan di api_keys table
                                    │
Public REST API (Next.js API Routes, Vercel)
     │
     ├── Middleware: validasi API key ──► rate limit (Upstash)
     │
     ├── POST /api/v1/{apiKey}/{sheetName}          → append row
     ├── GET  /api/v1/{apiKey}/{sheetName}           → read rows
     ├── PUT  /api/v1/{apiKey}/{sheetName}/{rowId}   → update row
     ├── DELETE /api/v1/{apiKey}/{sheetName}/{rowId} → delete row
     └── POST /api/v1/{apiKey}/{sheetName}/create    → auto-create tab + header
                    │
                    └──► Google Sheets API (pakai refresh_token user)
```

---

## 4. Skema Database (Prisma)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  createdAt     DateTime @default(now())
  sheets        ConnectedSheet[]
}

model ConnectedSheet {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  spreadsheetId   String
  spreadsheetName String
  refreshToken    String   // encrypted
  apiKey          String   @unique
  createdAt       DateTime @default(now())
  usageLogs       UsageLog[]
}

model UsageLog {
  id               String   @id @default(cuid())
  connectedSheetId String
  connectedSheet   ConnectedSheet @relation(fields: [connectedSheetId], references: [id])
  endpoint         String
  method           String
  statusCode       Int
  createdAt        DateTime @default(now())
}
```

---

## 5. Rencana Endpoint API Publik

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/v1/{apiKey}/{sheetName}` | Append 1 row (body: JSON object, key = nama kolom) |
| GET | `/api/v1/{apiKey}/{sheetName}` | Ambil semua row jadi array of JSON |
| PUT | `/api/v1/{apiKey}/{sheetName}/{rowId}` | Update row tertentu |
| DELETE | `/api/v1/{apiKey}/{sheetName}/{rowId}` | Hapus row tertentu |
| POST | `/api/v1/{apiKey}/{sheetName}/create` | Bikin tab baru + isi header row (body: `{ headers: [...] }`) — **fitur pembeda dari SteinHQ** |

Semua response format JSON konsisten:
```json
{ "success": true, "data": [...] }
{ "success": false, "error": "message" }
```

---

## 6. Fase Pengembangan (MVP-first)

**Fase 1 — Fondasi**
- [ ] Setup Next.js 15 project + Vercel deploy pipeline
- [ ] Setup Prisma + Postgres (Neon/Vercel Postgres)
- [ ] NextAuth login — Google Provider saja (tanpa opsi email)

**Fase 2 — Google Sheets Integration**
- [ ] OAuth consent flow untuk scope `spreadsheets`
- [ ] Simpan & refresh token (encrypted at rest)
- [ ] Endpoint connect sheet (paste URL → simpan spreadsheetId)

**Fase 3 — Core REST API**
- [ ] Generate & validasi API key
- [ ] Endpoint append/read/update/delete row
- [ ] Endpoint auto-create tab + header
- [ ] Rate limiting per API key (Upstash)

**Fase 4 — Dashboard**
- [ ] List connected sheets + API key masing-masing
- [ ] Usage stats sederhana (jumlah request per hari)
- [ ] Dokumentasi API interaktif (contoh: pakai Swagger/simple docs page)

**Fase 5 — Publik & Growth**
- [ ] Landing page
- [ ] Free tier vs paid tier (kalau mau monetisasi)
- [ ] Onboarding tanpa perlu ngerti teknis (untuk non-developer)

---

## 7. Hal yang Perlu Diputuskan Sebelum Mulai Coding

1. Nama produk final + domain
2. Model monetisasi: gratis semua dulu, atau langsung ada free/paid tier?
3. Batas rate limit default (misal: 100 request/menit per API key)
4. Enkripsi refresh token: pakai library apa (misal `@vercel/kv` + custom encryption, atau NextAuth adapter yang udah handle ini)

---

## 8. Legalitas & Kepatuhan (Compliance)

**Google API Services User Data Policy**
- Scope `spreadsheets` termasuk kategori sensitif di mata Google, jadi OAuth consent screen app ini wajib melalui proses **verifikasi Google** sebelum bisa dipakai publik luas
- Selama tahap awal (development/testing), app cuma bisa dipakai maks. 100 user yang di-whitelist manual di OAuth consent screen — cukup buat closed beta
- Untuk publik penuh, submit app buat verifikasi — siapkan video demo, justifikasi scope, dan kemungkinan lolos **security assessment (CASA)** kalau diminta Google. Proses ini bisa makan waktu beberapa minggu

**Keamanan refresh token**
- Refresh token user (kredensial akses ke Sheets mereka) **wajib dienkripsi at-rest** di database, bukan opsional
- Rotasi/enkripsi key harus dikelola dengan baik (jangan hardcode encryption key di kode)

**Privacy Policy & Terms of Service**
- Wajib punya halaman **Privacy Policy** yang jelas — ini juga syarat dari Google buat lolos verifikasi OAuth consent screen
- Harus menjelaskan: data apa yang diakses (Sheets, profil Google), untuk apa dipakai, bagaimana disimpan, cara user cabut akses/hapus data
- Sertakan juga **Terms of Service** dasar (batas tanggung jawab, fair use, dll)

**UU PDP (Perlindungan Data Pribadi) — Indonesia**
- Karena produk menyimpan data pribadi user (nama, email, token akses), UU PDP berlaku kalau dipakai publik di Indonesia
- Minimal: consent eksplisit saat connect akun, mekanisme user bisa hapus data/akunnya sendiri, dan keamanan penyimpanan data yang memadai
- Kalau ada rencana serius untuk scale besar, disarankan konsultasi dengan yang lebih paham hukum digital — bagian ini bukan pengganti nasihat hukum

**Branding**
- Aman dari sisi trademark selama nama & logo produk tidak meniru SteinHQ secara langsung (boleh terinspirasi dari konsepnya)

## 9. Closed Beta

**Skema akses:**
- Hanya tersedia **1 tier: Free** (belum ada paid tier di fase closed beta)
- Kuota **1.000 request/bulan** per API key
- Reset kuota tiap awal bulan (bisa pakai cron job / cek timestamp saat validasi request)

**Deployment:**
- Subdomain closed beta: **`lembar.atnan.my.id`**
- Karena masih closed beta, batasi akses lewat whitelist manual (sejalan dengan batas 100 user testing dari Google OAuth consent screen — lihat bagian 8)

**Implementasi kuota:**
- Tambahkan kolom `requestCount` dan `quotaResetAt` di tabel `ConnectedSheet` (atau tabel terpisah `ApiUsageQuota`)
- Middleware validasi API key sekaligus cek kuota — kalau `requestCount >= 1000` dan belum lewat `quotaResetAt`, return `429 Too Many Requests`
- Tampilkan sisa kuota di dashboard biar user bisa pantau sendiri

## 10. Kebijakan Kuota Free Tier (Tanpa Iklan)

**Keputusan:** tidak ada monetisasi via iklan. Alasan: Lembar adalah produk B2D (business-to-developer) — API dipanggil server-ke-server, bukan aplikasi dengan UI langsung ke end-user, jadi tidak ada "layar" natural buat nampilin iklan. Nilai iklan buat developer tools juga relatif rendah dibanding paid tier langsung.

**Reward-based quota (non-iklan), untuk fase closed beta:**
- Share/promosikan Lembar di sosial media (post + tag) → bonus kuota (misal +200 request)
- Laporkan bug/kasih feedback → bonus kuota (sekalian dapet insight buat perbaikan produk selagi beta)
- Referral (ajak developer lain pakai) → bonus kuota buat yang mengundang

**Soft-block saat kuota habis (bukan hard-block):**
- Request tetap jalan dengan warning/notice di response, bukan langsung `429` total — hindari aplikasi mereka mendadak berhenti fungsi
- Opsional: grace period kecil (misal +50 request) dengan warning, sebelum benar-benar diblokir sampai kuota reset bulan depan

**Siapkan struktur paid tier dari awal (belum dijual saat closed beta):**
- Database & billing logic (`ConnectedSheet`/`ApiUsageQuota`) dirancang sudah mendukung multi-tier sejak awal, walau closed beta cuma expose Free tier
- Closed beta jadi ajang validasi: kalau banyak user sering keabisan kuota, itu sinyal kuat mereka butuh & mau bayar buat kuota lebih besar — baru dibuka paid tier di fase berikutnya

## 11. Target Pasar & Positioning

**Segmen target:**
1. **Developer/freelancer** — butuh backend cepat buat MVP/prototipe tanpa setup database dari nol
2. **Organisasi/komunitas non-teknis** (HIMATIF, UKM, panitia event) — butuh solusi "bikin form/data → langsung keliatan di spreadsheet" tanpa install apa-apa, non-teknis friendly
3. **No-code/low-code builder** (Bubble, Glide, Webflow, dll) — butuh data store simpel yang gampang diintegrasi

**Positioning statement:**
> "Lembar adalah cara tercepat mengubah Google Sheets jadi REST API — connect pakai akun Google, langsung dapet endpoint, termasuk bikin tab baru otomatis tanpa buka spreadsheet manual."

**Diferensiasi dari SteinHQ:**
1. Auto-create tab + header via API (SteinHQ tidak punya)
2. Onboarding lebih gampang — login pakai akun Google langsung, consent sekali jalan
3. (Opsional ke depan) Dashboard usage lebih modern, validasi data sebelum masuk sheet

**Strategi closed beta: semua segmen sekaligus, dengan tagging asal user**
- Saat signup, tambahkan 1 pertanyaan: "Kamu pakai Lembar buat apa?" (opsi: proyek pribadi/freelance, organisasi/komunitas, no-code project, lainnya) — disimpan di tabel `User` untuk analisis pola pemakaian per segmen
- Recruit closed beta dari kanal berbeda per segmen: developer/freelancer via komunitas kampus/HIMATIF atau grup developer; organisasi non-teknis via HIMATIF sendiri/UKM lain di UMS; no-code via komunitas no-code
- Feedback loop per-segmen: form feedback sederhana yang tertaut ke label segmen, direview berkala untuk lihat segmen mana yang retention-nya bagus vs cuma coba-coba

**Catatan penting:**
- Riset multi-segmen tidak berarti build fitur untuk semua segmen sekaligus — MVP tetap fokus ke API core + auto-create tab dulu
- Siapkan 1 channel terpusat (misal Discord/WA) untuk menampung semua feedback closed beta, mengingat kapasitas support masih solo/kecil

## 12. Flow Penggunaan (Developer)

1. **Discover & Landing** — developer menemukan Lembar (sharing, komunitas, search), lihat landing page dengan positioning dan contoh use case
2. **Sign Up (Login Google)** — klik "Get Started", login pakai akun Google (satu consent sekaligus untuk dashboard + akses scope `spreadsheets`), isi 1 pertanyaan tagging segmen ("Kamu pakai Lembar buat apa?")
3. **Connect Spreadsheet** — di dashboard, klik "Connect New Sheet" dan **cukup paste URL spreadsheet Google Sheets mereka** (yang sudah ada atau baru); sistem verifikasi akses lalu generate **API key unik** untuk sheet itu
4. **Setup Tab & Header** — kalau sheet masih kosong, bisa langsung klik "Create Tab" dari dashboard (isi nama tab + kolom header) tanpa buka Google Sheets manual; atau tetap bisa dibuat manual langsung di Sheets
5. **Lihat Dokumentasi API** — dashboard menampilkan API key + contoh endpoint yang otomatis menyesuaikan nama sheet/tab mereka, lengkap dengan contoh request siap pakai (curl, fetch JS, Laravel/PHP)
6. **Integrasi ke Aplikasi** — developer memanggil endpoint dari backend aplikasi mereka, contoh:
   ```
   POST https://lembar.atnan.my.id/api/v1/{apiKey}/{sheetName}
   Body: { "nama": "Budi", "status": "hadir" }
   ```
7. **Monitor Usage** — cek sisa kuota (1000 request/bulan), riwayat request, status per-sheet di dashboard; dapat warning saat kuota mepet
8. **Upgrade/Reward (fase mendatang)** — upgrade paid tier untuk kuota lebih besar (belum aktif saat closed beta), atau dapat bonus kuota lewat reward (share, feedback, referral)

**Catatan:** seluruh flow ini dari sisi developer (pemanggil API) — end-user aplikasi mereka tidak pernah berinteraksi langsung dengan Lembar.

## 13. Estimasi Biaya Operasional (Closed Beta)

| Komponen | Free tier tersedia? | Catatan |
|---|---|---|
| **Vercel (hosting)** | Hobby = $0, tapi non-commercial only | Karena Lembar rencananya produk komersial (walau closed beta belum jualan), lebih aman langsung pakai **Pro ($20/bulan)** — juga lebih pas untuk domain custom & traffic publik |
| **Database (Postgres)** | Neon Free = $0 | 100 CU-hours/bulan, 0.5GB storage per project — cukup untuk closed beta skala kecil (puluhan-ratusan user) |
| **Redis (rate limiting)** | Upstash Free = $0 | Free tier cukup generous untuk skala kecil |
| **Domain/subdomain** | $0 | Sudah punya `atnan.my.id`, tinggal pakai subdomain `lembar.atnan.my.id` |
| **Google Sheets API** | $0 | Gratis, quota per-project (300 request/menit per user) — jauh di atas kebutuhan closed beta |
| **Google OAuth verification** | $0, kecuali kena CASA security assessment | Tier rendah biasanya gratis/murah, tapi scope sensitif bisa kena biaya audit — perlu dicek saat submit verifikasi |

**Estimasi total per bulan:**
- Skenario realistis (free tier semua kecuali Vercel Pro): **~$20/bulan**
- Skenario benar-benar $0 (pakai Vercel Hobby): berisiko karena ToS Hobby non-commercial, sementara Lembar produk komersial (walau closed beta belum jualan)

**Yang perlu dipantau ke depan:**
- Neon Postgres bisa nembus batas 0.5GB kalau data (`ConnectedSheet`, `UsageLog`) makin banyak — masih jauh untuk closed beta skala puluhan user
- Vercel Pro dihitung per seat — biaya nambah $20/seat kalau ada kontributor/tim baru
- Function invocation/edge request Vercel bisa mulai memakan credit $20 bawaan Pro kalau closed beta ramai — perlu dipantau di dashboard Vercel

## 14. Model Monetisasi & Harga Paid Tier

**Model: Freemium — kuota per bulan, harga flat (bukan usage-based)**

Dipilih flat pricing (bukan pay-as-you-go seperti Neon/Vercel) karena target pasar awal (developer individu, organisasi non-teknis di Indonesia) lebih menyukai harga simpel dan predictable dibanding billing yang berubah-ubah.

| Tier | Harga | Kuota Request | Fitur |
|---|---|---|---|
| **Free** | Rp0 | 1.000/bulan | 1 spreadsheet, semua endpoint dasar, auto-create tab |
| **Starter** | Rp49rb/bulan (~$3) | 10.000/bulan | 3 spreadsheet, prioritas support |
| **Pro** | Rp99rb/bulan (~$6) | 50.000/bulan | Spreadsheet unlimited, webhook notifikasi, custom rate limit |
| **Organisasi** | Rp199rb/bulan (~$12) | 150.000/bulan | Multi-user per akun (role-based access), akses log lebih lengkap |

**Justifikasi harga:**
- Biaya operasional closed beta ~Rp320rb/bulan ($20) — sekitar 7-10 user Starter sudah menutup biaya server bulanan
- Harga di bawah SteinHQ (mulai $8/bulan) tapi tetap masuk akal untuk pasar Indonesia — psychological pricing "di bawah Rp100rb" untuk tier Starter/Pro
- Tier Organisasi cocok untuk HIMATIF sendiri atau UKM lain dengan kebutuhan kuota lebih besar tapi budget terbatas

**Hal yang masih perlu diputuskan:**
- Opsi pembayaran tahunan dengan diskon (~15-20%) untuk bantu cash flow
- Payment gateway: kandidat Midtrans atau Xendit (familiar untuk pasar Indonesia)

## 15. Skema Role — Tier Organisasi

**Konsep:** satu akun Lembar (tier Organisasi) dipakai bersama oleh beberapa orang dalam satu organisasi, bukan 1 akun Google = 1 pemilik sheet seperti tier Free/Starter/Pro.

**Perubahan struktur data:**
```
Organization → punya banyak Member (User) dengan Role (Owner/Admin/Member)
Organization → punya ConnectedSheet (bukan lagi milik 1 User individu)
```

**Role-based access:**
- **Owner** — pembuat organisasi pertama; bisa invite/hapus member, atur billing
- **Admin** — bisa connect sheet baru, generate API key; tidak bisa ubah billing
- **Member** — hanya bisa melihat dashboard/usage, tidak bisa ubah setting sensitif

**Invite flow:**
- Owner mengundang anggota lain via email, anggota login dengan akun Google masing-masing, otomatis bergabung ke organisasi tanpa perlu share password

**Untuk closed beta (opsi lebih sederhana):**
- Bisa dimulai dari versi "shared login" — semua anggota memakai 1 email organisasi untuk login, tanpa role terpisah
- Role-based access penuh baru diimplementasikan di fase publik jika memang dibutuhkan

## 16. Strategi Go-to-Market

**Fase 1 — Closed Beta (validasi & early adopter)**
- Rekrut peserta dari 3 segmen sekaligus (lihat bagian 11) lewat kanal berbeda: komunitas developer kampus/HIMATIF, jaringan organisasi/UKM di UMS, komunitas no-code
- Semua interaksi awal gratis (Free tier saja, tanpa paid tier aktif) untuk kumpulkan feedback dan validasi product-market fit
- Kumpulkan testimoni & use case nyata dari closed beta sebagai bahan promosi fase berikutnya

**Fase 2 — Soft Launch (buka paid tier terbatas)**
- Aktifkan tier Starter/Pro/Organisasi setelah closed beta menunjukkan sinyal permintaan (banyak user sering kehabisan kuota Free)
- Submit verifikasi OAuth Google (lihat bagian 8) supaya bisa menerima user di luar whitelist 100 akun testing
- Mulai promosi lebih luas: post di komunitas developer Indonesia (Discord/Telegram), Twitter/X, LinkedIn dengan studi kasus dari closed beta

**Fase 3 — Public Launch**
- Landing page lengkap dengan dokumentasi API interaktif dan playground
- Konten teknis (blog/tutorial) tentang cara pakai Lembar untuk use case spesifik (rekap absen organisasi, prototipe cepat, integrasi no-code)
- Manfaatkan jaringan kampus (UMS, HIMATIF, organisasi mahasiswa lain) sebagai early adopter yang bisa jadi word-of-mouth ke organisasi kampus lain

**Prinsip umum:**
- Tidak buru-buru monetisasi sebelum ada sinyal jelas dari closed beta bahwa orang mau bayar
- Word-of-mouth dari komunitas kampus dan developer jadi kanal akuisisi utama di awal — biaya marketing minim, sesuai dengan skala tim yang masih solo

## 17. Strategi Discoverability (SEO & GEO/AEO)

**Tujuan:** muncul saat orang mencari solusi lewat Google (SEO) maupun saat bertanya ke AI seperti Claude, ChatGPT, Gemini, Grok, DeepSeek, dll (GEO/AEO — Generative/Answer Engine Optimization).

### SEO (Google)

**Target kata kunci:**
- "google sheets to api", "spreadsheet database gratis", "no-code database cepat", "stein alternative", "REST API dari google sheets"
- Long-tail lebih realistis untuk produk baru: "cara bikin API dari google sheets", "database gratis untuk prototipe"

**Konten yang perlu dibuat:**
- Blog/tutorial di domain sendiri (`lembar.atnan.my.id/blog`) — misal "5 Cara Mengubah Google Sheets Jadi API", "Stein vs Lembar: Mana yang Lebih Cocok?"
- Halaman perbandingan langsung (`/vs/steinhq`, `/vs/airtable`) — sering dicari orang saat memilih tool
- Dokumentasi API publik yang terstruktur rapi (mudah di-index Google)

**Backlink organik:**
- Post di komunitas developer (dev.to, Medium, Hashnode) dengan link balik ke Lembar
- Submit ke direktori tools (AlternativeTo, SaaSHub, Product Hunt) — juga sering di-crawl AI untuk rekomendasi

### GEO/AEO (rekomendasi oleh AI)

AI model "mengenali" suatu produk dari data training dan/atau web search real-time (jika AI-nya punya fitur browsing). Strategi:

1. **Struktur konten mudah di-parse AI** — heading jelas, FAQ terstruktur (schema.org FAQPage), fakta lugas dalam bullet point ("Lembar adalah tool gratis untuk mengubah Google Sheets jadi REST API")
2. **Disebut di sumber pihak ketiga terpercaya** — direktori SaaS (SaaSHub, AlternativeTo, G2, Capterra), artikel "best tools for X", komunitas (Reddit, Hacker News, dev.to)
3. **Konsistensi nama & deskripsi** di semua platform, agar AI mudah mengenali Lembar sebagai entitas yang sama
4. **Wikipedia/Wikidata (jangka panjang)** — bobot besar untuk dikenali AI model, relevan setelah produk cukup establish

### Realita Timeline & Prioritas

- SEO organik butuh waktu (~3-6 bulan minimal untuk mulai terlihat hasil), apalagi domain (`atnan.my.id`) belum punya authority
- AEO bergantung pada seberapa sering produk disebut di sumber yang dipercaya AI

**Prioritas realistis untuk solo developer:**
1. Submit ke Product Hunt & direktori SaaS gratis (effort kecil, dampak lumayan)
2. Tulis 2-3 artikel perbandingan/tutorial yang genuinely berguna (bukan spam SEO)
3. Aktif share progress di komunitas developer Indonesia & internasional (dev.to, Reddit r/webdev, Twitter/X) — sekaligus membangun personal brand

## 18. Keamanan

Kritis karena Lembar menyimpan kredensial akses ke data pihak lain (refresh token Google) — kebocoran berdampak bukan hanya ke Lembar, tapi ke akun Google user juga.

### Keamanan Token & Kredensial

**Refresh token (paling kritis):**
- Wajib dienkripsi at-rest (AES-256-GCM atau sejenisnya), jangan disimpan plain text di database
- Encryption key disimpan terpisah dari database (environment variable Vercel, bukan hardcode)
- Opsional untuk fase lanjut: kelola encryption key lewat secret manager terpisah (Google Secret Manager / Vercel encrypted env vars)

**API key (dipakai developer memanggil endpoint):**
- Simpan **hash**-nya saja (mirip cara menyimpan password, misal SHA-256), bukan plain text
- Validasi request: hash API key yang dikirim, bandingkan dengan hash di database
- Beri prefix jelas (misal `lmbr_live_xxxxx`) agar mudah dikenali dan terdeteksi otomatis oleh tool seperti GitHub secret scanning jika tidak sengaja ter-commit

### Keamanan API Publik

- Rate limiting per API key (Upstash) — selain untuk kuota, juga mencegah abuse/DDoS ke satu sheet tertentu
- Validasi input ketat — mencegah formula injection ke Google Sheets (value yang diawali `=` bisa dieksekusi sebagai formula Sheets, celah nyata yang sering luput)
- CORS policy jelas — tentukan domain mana saja yang boleh memanggil API dari browser

### Keamanan OAuth Flow

- State parameter wajib ada di OAuth flow untuk mencegah CSRF attack saat proses consent Google
- Scope minimal — hanya minta scope `spreadsheets` yang benar-benar dibutuhkan, jangan minta scope lebih luas untuk "jaga-jaga fitur masa depan" (scope minimal juga mempermudah lolos verifikasi Google)
- Token refresh handling — jika refresh token expired/revoked (user mencabut akses dari sisi Google), sistem harus mendeteksi dan memberi tahu user untuk re-connect, bukan error diam-diam

### Keamanan Infrastruktur

- Semua secret (DB connection string, encryption key, Google OAuth client secret) disimpan di Vercel env vars, tidak pernah di-commit ke repo (`.env` masuk `.gitignore`)
- HTTPS only untuk semua endpoint (default Vercel)
- Audit log — simpan log siapa mengakses apa kapan (perluasan dari `UsageLog`), penting untuk investigasi insiden

### Kepatuhan & Kebijakan Data

- Data minimization — hanya simpan data yang benar-benar perlu (nama, email, refresh token); isi spreadsheet tetap di Google Sheets user, Lembar hanya menjadi jembatan real-time
- Kebijakan penghapusan data — saat user hapus akun/disconnect sheet, refresh token & data terkait harus benar-benar dihapus dari database (hard delete, bukan soft-delete)

### Prioritas untuk Closed Beta

Fokus ke yang paling kritis dulu (hindari overengineering di fase awal solo developer):
1. Enkripsi refresh token — non-negotiable
2. Hash API key
3. Rate limiting
4. Validasi input (cegah formula injection ke Sheets)

Item lain (audit log lengkap, secret manager terpisah) dapat menyusul saat mendekati fase publik.

## 19. Catatan untuk AI Coding Agent

Kalau dokumen ini dipakai sebagai prompt awal untuk AI coding agent (Antigravity, Claude Code, dll):
- Mulai dari **Fase 1 & 2** dulu — jangan langsung generate semua endpoint sekaligus
- Prioritaskan OAuth flow works dengan benar sebelum lanjut ke REST API publik, karena ini fondasi keamanan
- Test auto-create tab feature dengan Google Sheets API `batchUpdate` (`AddSheetRequest`) — ini bagian yang paling beda dari SteinHQ dan perlu ditest hati-hati (header row harus otomatis ke-inject setelah tab dibuat)
