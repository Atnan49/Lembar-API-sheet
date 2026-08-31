# Lembar (Google Sheets to REST API)

> Platform pengubah spreadsheet Google Sheets menjadi REST API instan dengan onboarding OAuth Google single-consent dan fitur **auto-create tab + header row** via API.

---

## Fitur Utama

- **Auto-create Tab & Header:** Buat tab baru dan inisialisasi baris kolom header secara otomatis melalui endpoint `POST /api/v1/:apiKey/:sheetName/create`.
- **Single OAuth Consent:** Login dashboard sekaligus meminta izin akses `spreadsheets` dalam satu kali consent.
- **REST Endpoints Cepat:**
  - `POST /api/v1/:apiKey/:sheetName` (Append baris)
  - `GET /api/v1/:apiKey/:sheetName` (Baca seluruh baris sebagai JSON)
  - `PUT /api/v1/:apiKey/:sheetName/:rowId` (Update baris tertentu)
  - `DELETE /api/v1/:apiKey/:sheetName/:rowId` (Hapus baris tertentu)
- **Keamanan:** Enkripsi token OAuth at-rest (AES-256-GCM), hashing API key (SHA-256), dan sanitasi otomatis dari serangan Google Sheets Formula Injection.
- **Sistem Desain:** Neo-Brutalism & Wireframe-inspired (0px border radius, garis tepi hitam tegas, high-contrast, dan WCAG AA accessibility).

---

## Petunjuk Menjalankan Aplikasi

### 1. Konfigurasi Lingkungan (`.env`)

Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Isi variabel lingkungan berikut:
- `NEXTAUTH_URL`: `http://localhost:3000` (atau domain produksi)
- `NEXTAUTH_SECRET`: String rahasia NextAuth
- `DATABASE_URL`: Connection string PostgreSQL (Neon / Supabase / Postgres lokal)
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Kredensial OAuth dari Google Cloud Console
- `ENCRYPTION_KEY`: 32-byte hex string (e.g. hasil `openssl rand -hex 32`)
- `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`: Kredensial Upstash Redis (opsional untuk lokal, ada fallback in-memory)

### 2. Setup Database Prisma

Jalankan perintah push skema Prisma ke database:

```bash
npx prisma db push
npx prisma generate
```

### 3. Menjalankan Server Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.
