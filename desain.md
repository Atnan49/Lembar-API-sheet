# Design System: Elegant Minimalist (Wireframe-Inspired)

Dokumen ini berisi panduan sistem desain yang digunakan dalam proyek ini. Tujuan dokumen ini adalah memberikan referensi kepada AI atau *developer* lain agar dapat mempertahankan konsistensi gaya visual saat menambahkan komponen atau halaman baru di masa depan.

## Filosofi Desain
Gaya yang diusung adalah **"Minimalis yang Elegan"**, yang mengambil inspirasi dari *Neo-Brutalism* dan rancangan dasar kerangka (*Wireframe*). Desain ini mengutamakan keterbacaan tinggi, kontras warna mutlak, bentuk kaku yang tegas, dan penghapusan total elemen-elemen dekoratif yang berat (seperti gradasi warna, efek blur, atau bayangan halus).

## 1. Palet Warna (Neo-Brutalism Monokrom & Aksen Tegas)
- **Background Utama**: Putih murni (`#ffffff` atau `bg-white`).
- **Elemen / Kontainer Sekunder**: Putih murni, atau Abu-abu sangat muda jika butuh separasi minimal (`bg-zinc-50`).
- **Teks Utama**: Hitam solid (`#000000` atau `text-black`).
- **Teks Sekunder**: Abu-abu gelap (`text-zinc-600` atau `text-zinc-700`).
- **Aksen Kuning (Cyber / Electric Yellow - `#ffe600` / `#facc15`)**: Digunakan untuk highlight aktif, tombol tindakan utama (seperti "+ Daftarkan"), badge perhatian/kartu baru, kartu total/persentase kehadiran, dan logo accent.
- **Aksen Merah (Bold Red / Crimson - `#ff3b30` / `#ef4444`)**: Digunakan untuk status kritis, data belum hadir (Alpha), tombol destruktif (Hapus), badge unknown counter, status offline IoT, dan error alerts.

## 2. Garis dan Bentuk (Borders & Shapes)
- **Border Radius**: **DILARANG** menggunakan sudut melengkung. Semuanya harus bersudut kaku dan tajam. Gunakan `rounded-none` pada kelas Tailwind atau `border-radius: 0px`.
- **Borders**: Setiap komponen (kartu, input teks, tombol, panel) wajib memiliki garis tepi hitam tegas. Gunakan `border-2 border-black` atau `border-3 border-black`.

## 3. Efek dan Kedalaman (Shadows & Depth)
- **DILARANG** menggunakan efek kaca transparan (*Glassmorphism*, `backdrop-blur`), *glow effect*, atau bayangan memudar.
- **Shadow**: Untuk memberikan dimensi (kedalaman) saat elemen di-hover atau ditekankan, gunakan efek bayangan solid asimetris, bukan bayangan kabur.
  - *Contoh CSS*: `box-shadow: 4px 4px 0px rgba(0,0,0,1);`
  - Saat tombol/kartu ditekan (*active/hover*), translasikan elemen mendekati bayangannya (`transform: translate(2px, 2px)`) lalu kurangi jarak bayangannya menjadi `2px 2px 0px` untuk memberikan efek fisik "ditekan".

## 4. Tipografi
- **Headings (Judul)**: Gunakan *font-weight* tebal (`font-bold` atau `font-extrabold`), sering kali dipadukan dengan huruf kapital semua (`uppercase`) dan spasi antar huruf yang lebar (`tracking-wider` atau `tracking-widest`).
- **Detail Teknis**: Untuk label seperti status server, ukuran file, resolusi video, atau tag, gunakan *Font Monospace* (`font-mono`) agar memberikan kesan teknikal dan mentah.
- **Warna Teks**: Harus solid. Teks hitam tebal di atas latar kuning/putih, teks putih tebal di atas latar hitam/merah.

## 5. Implementasi Komponen Khas

**A. Tombol Aksi Kuning (Action CTA Button)**
```jsx
<button className="bg-[#ffe600] text-black font-extrabold border-2 border-black rounded-none px-4 py-2 hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_black]">
  DAFTARKAN
</button>
```

**B. Tombol Bahaya / Hapus (Danger Button)**
```jsx
<button className="bg-[#ff3b30] text-white font-extrabold border-2 border-black rounded-none px-4 py-2 hover:bg-[#dc2626] transition-all shadow-[2px_2px_0px_black]">
  HAPUS
</button>
```

**C. Tombol Sekunder / Standar (Secondary Button)**
```jsx
<button className="bg-white text-black font-bold border-2 border-black rounded-none px-4 py-2 hover:bg-zinc-100 transition-all shadow-[2px_2px_0px_black]">
  SEKUNDER
</button>
```

**D. Kartu Statistik Beraksen (Accent Stat Card)**
```jsx
<!-- Kartu Belum Hadir (Merah) -->
<div className="bg-white border-2 border-black border-t-[5px] border-t-[#ff3b30] rounded-none p-4 shadow-[4px_4px_0px_black]">
  ...
</div>

<!-- Kartu Persentase / Target (Kuning) -->
<div className="bg-white border-2 border-black border-t-[5px] border-t-[#ffe600] rounded-none p-4 shadow-[4px_4px_0px_black]">
  ...
</div>
```

## Ringkasan Aturan Emas
Jika ragu saat mendesain fitur baru, ingat 4 aturan ini:
1. **Palet Kontras Tinggi**: Hitam & Putih sebagai pondasi, Kuning (`#ffe600`) untuk aksi/highlight, Merah (`#ff3b30`) untuk bahaya/alpha.
2. **Kaku dan Tajam (Tanpa Lengkungan / 0px Radius)**.
3. **Garis Tepi Hitam Tebal (`border-2 border-black`) pada semua elemen**.
4. **Bayangan Solid Tanpa Blur (`box-shadow: 4px 4px 0px #000`)**.
