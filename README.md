# 🌱 Ruang Tumbuh Teknologi — AI Prompt & Media Studio

Aplikasi modern dan responsif untuk menyimpan, mengorganisir, dan mengelola prompt AI beserta hasil medianya (Gambar & Video) dengan identitas visual **Ruang Tumbuh Teknologi**:
- **Navy**: `#101C32` (Latar belakang utama / Dark surface)
- **Lime**: `#B7F36B` (Aksen utama, tombol aksi / CTA, highlight & badge aktif)
- **Putih**: `#FFFFFF` (Teks judul & kontras tinggi)
- **Abu-abu**: `#E8ECF1` (Teks sekunder & elemen border halus)
- **Tipografi**: Font Judul **Plus Jakarta Sans Bold**, Font Isi **Inter**
- **Logo**: Logo resmi Ruang Tumbuh Teknologi (Tunas & Sirkuit Teknologi Lime)

---

## 🌐 Struktur URL & Halaman

| URL | Halaman | Deskripsi | Akses |
|---|---|---|---|
| **`/`** | **Website Galeri Publik** | Etalase karya AI modern **tanpa dashboard/sidebar**. Pengunjung dapat mencari, memfilter, melihat media resolusi penuh di Lightbox, dan menyalin prompt (One-Click Copy). Bersih tanpa tombol login. | Publik (Semua Orang) |
| **`/login`** | **Portal Login Khusus** | Halaman login tersendiri untuk kreator dan superadmin. Setelah login berhasil, langsung diarahkan ke `/dashboard`. | Siapa saja yang mengetahui URL |
| **`/dashboard`** | **Dashboard Studio Pengelola** | Panel admin internal dengan **Sidebar Navigasi**, ringkasan statistik, simpan/edit prompt dengan sakelar Publish, dan Manajemen User & Hak Akses (Superadmin/Admin). | Wajib Login (Terkunci) |

---

## ✨ Fitur Utama

1. **🌐 Website Galeri Publik (`/`) — Tanpa Dashboard**
   - Tampilan berupa **Website Showcase AI modern** (layaknya Civitai / Lexica / Midjourney Showcase).
   - **Bebas dari elemen dashboard:** Tidak ada sidebar pengelola dan tidak ada tombol login.
   - Header atas memuat Logo, Search Bar instan, dan Filter Cepat.
   - Hero Section menarik dengan headline, ringkasan statistik karya publik, dan tag populer.
   - Grid kartu karya dengan preview video otomatis saat di-hover, foto profil kreator (`@username`), model AI, dan tombol **One-Click Copy Prompt**.
   - **Lightbox Resolusi Penuh:** Membuka gambar/video dalam ukuran besar, melihat negative prompt, parameter lengkap (Seed, Steps, Sampler, CFG), serta tombol unduh (download).

2. **🎛️ Dashboard Studio Pengelola (`/dashboard`) — URL Khusus**
   - Panel kerja lengkap khusus pengguna terdaftar dengan tata letak **Sidebar Pengelola**.
   - **Ringkasan Statistik:** Kartu counter total prompt, gambar, video, dan favorit.
   - **Studio Prompt Pribadi:** Kelola koleksi prompt, atur status publikasi (Publik vs Privat).
   - **Buka Galeri Publik di Tab Baru:** Terdapat tombol cepat di Header dan Sidebar untuk membuka website publik di tab browser baru (`target="_blank"`).
   - **Manajemen User (Khusus Superadmin/Admin):** Tambah user baru, tentukan role, ubah hak akses, reset password, dan hapus user.

3. **🔐 Halaman Login Eksklusif (`/login`)**
   - **URL Khusus:** Buka langsung di browser melalui **`http://localhost:5000/login`**
   - Form bersih & eksklusif: hanya meminta **Username/Email** dan **Password**.
   - **Kredensial Akun Bawaan:**
     - **Superadmin:** `superadmin` / `qwerty` (Hak akses penuh sistem & manajemen user)
     - **Demo Creator:** `demo_creator` / `demo123` (Hak akses kreator biasa)

3. **👥 Manajemen Pengguna & Hak Akses (Role-Based Access Control)**
   - Tersedia di Sidebar khusus untuk akun dengan role **Superadmin** dan **Admin**.
   - **Tingkatan Hak Akses (Roles):**
     - 👑 **Superadmin:** Hak akses tertinggi (dapat mengelola user, menambah/mengedit/menghapus user, mengubah role ke Admin/Superadmin, reset password, dan mengelola semua prompt).
     - 🛡️ **Admin:** Dapat mengelola user biasa dan melihat semua prompt.
     - 👤 **User Biasa:** Hanya dapat menambah, mengedit, dan menghapus prompt milik mereka sendiri di Studio Pribadi.
   - Tabel interaktif dengan informasi: Avatar, Username, Email, Role badge, Total prompt yang dibuat, tanggal pendaftaran, tombol Edit & Hapus.
   - Modal Tambah & Edit Pengguna dengan validasi keamanan.

2. **📂 Sidebar Navigasi & Filter Pintar**
   - Filter koleksi utama:
     - 🌟 **Semua Prompt**
     - 🖼️ **Gambar (Images)**
     - 🎬 **Video AI**
     - ⭐ **Favorit Saya**
   - Filter otomatis berdasarkan **Model AI** (Midjourney, Flux.1, Stable Diffusion XL, Kling AI, Runway, Sora, dll.)
   - Filter berdasarkan **Tags** populer dengan badge interaktif.
   - Indikator jumlah (*counter badges*) otomatis untuk setiap kategori.
   - Tombol Logout di bagian bawah sidebar.
   - Responsif untuk desktop dan mobile dengan drawer sidebar.

3. **🔍 Pencarian & Pengurutan Cepat**
   - Pencarian real-time berdasarkan judul, teks prompt, negative prompt, dan tag.
   - Pengurutan (*Sort*): Terbaru, Terlama, dan Judul (A-Z).

4. **⚡ One-Click Copy Prompt**
   - Tombol salin satu-klik langsung di setiap kartu (*card*) maupun di dalam modal Lightbox.
   - Indikator feedback visual instan (*"Tersalin!"* & checklist hijau).
   - Opsi salin terpisah untuk *Prompt Utama* dan *Negative Prompt*.

5. **🖼️ Lightbox & Media Viewer Resolusi Penuh**
   - Modal tampilan besar untuk melihat karya gambar dalam resolusi tinggi.
   - Pemutar video HTML5 responsif dengan tombol play/pause otomatis saat di-hover dan kontrol penuh di Lightbox.
   - Tombol **Unduh Langsung (Download)** file gambar/video.
   - Navigasi cepat ke prompt sebelumnya / berikutnya (*Previous/Next*) menggunakan panah keyboard atau tombol layar.
   - Panel detail metadata: Rasio Aspek, Seed, CFG Scale, Steps, Sampler, Tanggal dibuat, dan Tags.
   - Tombol Edit dan Hapus langsung dari Lightbox.

6. **➕ Tambah & Edit Prompt Interaktif (dengan Fitur Publish)**
   - **Fitur Publikasi (Publish Toggle):**
     - 🌐 **Publik (Aktif):** Prompt & hasil media otomatis tampil di Galeri Publik untuk semua orang.
     - 🔒 **Privat (Nonaktif):** Prompt hanya tersimpan di Studio Pribadi Anda (disembunyikan dari halaman publik).
     - Dapat diubah kapan saja saat membuat prompt baru, mengedit prompt, atau lewat tombol cepat di Lightbox.
   - **Dua opsi input media:**
     1. **Upload File Lokal**: Unggah file dari komputer (PNG, JPG, WEBP, MP4, WEBM hingga 100MB).
     2. **URL Media Online**: Masukkan tautan link media langsung.
   - Pemilihan Model AI (daftar pilihan populer + teks bebas).
   - Pemilihan Aspek Rasio (16:9, 9:16, 1:1, 4:5, 21:9, 3:2).
   - Accordion parameter lanjutan: Seed, CFG Scale, Steps, Sampler.
   - Tagging fleksibel dengan pemisah koma.

---

## 🛠️ Arsitektur & Teknologi

- **Frontend:**
  - React 19 + Vite
  - Tailwind CSS v4
  - Lucide React Icons
  - HTML5 Video Player & Image Zoom
- **Backend:**
  - Node.js Express.js
  - `node:sqlite` (SQLite database bawaan Node.js v24 — tanpa kompilasi native yang rumit, sangat cepat & andal)
  - Multer untuk upload gambar dan video ke folder `server/uploads/`
  - JWT & bcryptjs untuk otentikasi
- **Database:** SQLite (`server/data/database.sqlite`)

---

## 🚀 Cara Menjalankan Aplikasi

Pastikan Anda berada di direktori project: `d:\Node.js\appsaveprompt`

### 1. Mode Produksi (Satu Perintah Saja)
Client telah di-build ke dalam folder `client/dist`. Anda dapat langsung menjalankan server dan mengakses seluruh aplikasi:

```bash
npm run start:server
```
Buka browser Anda di: **`http://localhost:5000`**

---

### 2. Mode Pengembangan (Development)
Jika ingin memodifikasi kode dengan Hot Module Replacement (HMR):

**Terminal 1 — Jalankan Backend Server:**
```bash
npm run dev:server
```
*(Server berjalan di `http://localhost:5000`)*

**Terminal 2 — Jalankan Frontend Vite:**
```bash
npm run dev:client
```
*(Frontend berjalan di `http://localhost:3000` dengan proxy otomatis ke backend)*

---

## 📁 Struktur Direktori

```
appsaveprompt/
├── client/                     # Frontend Vite + React + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Sidebar, Header, PromptCard, LightboxModal, PromptModal, AuthModal
│   │   ├── context/            # AuthContext (state manajemen login & token)
│   │   ├── api.js              # Klien API fetch & JWT header
│   │   ├── App.jsx             # Komponen utama
│   │   ├── index.css           # Styling dasar Tailwind
│   │   └── main.jsx
│   ├── dist/                   # File hasil build produksi
│   └── vite.config.js          # Konfigurasi Vite & Proxy API
├── server/                     # Backend Express.js
│   ├── data/                   # File database SQLite (database.sqlite)
│   ├── uploads/                # Direktori penyimpanan file media yang diupload
│   └── src/
│       ├── db.js               # Inisialisasi SQLite & seeder contoh data awal
│       ├── index.js            # Server entrypoint & routing
│       ├── middleware/         # auth.js (JWT) & upload.js (Multer)
│       └── routes/             # auth.js, prompts.js, stats.js
├── package.json                # Root helper scripts
└── README.md                   # Dokumentasi
```
