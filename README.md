# BUKTIVA — Evidence-Based Skill Gap Analyzer

**Platform persiapan karier berbasis bukti proyek untuk membantu mahasiswa tingkat akhir dan _fresh graduate_ memahami kompetensi, kesenjangan keterampilan (_skill gap_), dan prioritas pengembangan diri.**

> [!IMPORTANT]
> **Status: pengembangan Modul 8 — integrasi frontend, backend, dan modul AI.** BUKTIVA adalah aplikasi web persiapan karier berbasis bukti proyek. Repository memuat alur ingestion bukti proyek, evaluasi jawaban validasi, scoring/readiness, perhitungan skill gap, penyimpanan data melalui Supabase, dan pembuatan roadmap. Integrasi model AI menggunakan SDK Gemini dan OpenAI tersedia dalam dependency; model/provider yang benar-benar dipakai pada suatu alur bergantung pada implementasi endpoint dan konfigurasi environment. Sebagian data atau halaman masih dapat menggunakan contoh/simulasi, sehingga status tiap fitur dijelaskan secara terpisah.
>
> README ini disusun dengan merujuk pada struktur repository GitHub, `package.json`, dokumentasi AI, PRD, serta prompt log backend yang tersedia. Branch `main` yang dapat dibaca publik dan pekerjaan lokal/branch pengembangan mungkin tidak selalu identik; periksa branch dan commit yang akan dikumpulkan sebelum menganggap seluruh status di bawah sebagai hasil audit pada commit tersebut.

## Daftar Isi

1. [Identitas dan Referensi Proyek](#1-identitas-dan-referensi-proyek)
2. [Latar Belakang dan Permasalahan](#2-latar-belakang-dan-permasalahan)
3. [Visi, Nilai Utama, dan Tujuan](#3-visi-nilai-utama-dan-tujuan)
4. [Target Pengguna](#4-target-pengguna)
5. [Ruang Lingkup dan Status Modul 8](#5-ruang-lingkup-dan-status-modul-8)
6. [Fitur dan Pemetaan Kebutuhan PRD](#6-fitur-dan-pemetaan-kebutuhan-prd)
7. [Alur Pengguna](#7-alur-pengguna)
8. [Tech Stack](#8-tech-stack)
9. [Sumber Data dan Layanan yang Digunakan](#9-sumber-data-dan-layanan-yang-digunakan)
10. [Instalasi dan Menjalankan Proyek](#9-instalasi-dan-menjalankan-proyek)
11. [Struktur Direktori](#10-struktur-direktori)
12. [Arsitektur Frontend dan Konvensi](#11-arsitektur-frontend-dan-konvensi)
13. [Daftar Route](#12-daftar-route)
14. [Data Demo dan Penyimpanan Sementara](#13-data-demo-dan-penyimpanan-sementara)
15. [Validasi, Interaksi, dan Penanganan Kesalahan](#14-validasi-interaksi-dan-penanganan-kesalahan)
16. [UI/UX, Responsivitas, dan Aksesibilitas](#15-uiux-responsivitas-dan-aksesibilitas)
17. [Kriteria Keberhasilan dan Evaluasi](#16-kriteria-keberhasilan-dan-evaluasi)
18. [Quality Assurance dan Pengujian](#17-quality-assurance-dan-pengujian)
19. [Status Implementasi dan Kesenjangan](#18-status-implementasi-dan-kesenjangan)
20. [Rencana Pengembangan](#19-rencana-pengembangan)
21. [Panduan Kontribusi](#20-panduan-kontribusi)
22. [Pemecahan Masalah](#21-pemecahan-masalah)
23. [Dokumentasi, Privasi, dan Lisensi](#22-dokumentasi-privasi-dan-lisensi)

---

## 1. Identitas dan Referensi Proyek

| Informasi                                       | Keterangan                                                                                                                                     |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Nama produk                                     | **BUKTIVA**                                                                                                                                    |
| Nama lengkap                                    | **Evidence-Based Skill Gap Analyzer**                                                                                                          |
| Bentuk produk                                   | Platform web untuk persiapan karier dan pemetaan kompetensi                                                                                    |
| Tim                                             | **Kelompok 3 — Web & UI/UX Developer, VINIX7**                                                                                                 |
| Tahap yang didokumentasikan                     | **Implementasi aplikasi Modul 8 (frontend, backend, dan AI)**                                                                                  |
| Dasar perancangan                               | Modul 1–6: ideasi, riset pengguna, persona, user flow, wireframe, UI prototype, dan HTML                                                       |
| PRD acuan                                       | `PRD_BUKTIVA_Bagian_1-9.md` (draf; Bagian 10–11 belum disusun)                                                                                 |
| Repository                                      | [EvidenceBasedSkillGapAnalyzer-VINIX7](https://github.com/adelyapy/EvidenceBasedSkillGapAnalyzer-VINIX7)                                       |
| Desain                                          | [Figma — VINIX7 DESIGN UI, Modul 5](https://www.figma.com/design/UVAFASV8FI30S6IFXKWUQU/VINIX7-DESIGN-UI?node-id=207-101&t=4u0zQ0JJCLAXJXPG-1) |
| Branch frontend yang digunakan dalam pengerjaan | `frontend2-dev` (pastikan kebijakan branch terbaru sebelum berkontribusi)                                                                      |

**Posisi README:** panduan pengenalan dan pengembangan repository. **Posisi PRD:** sumber kebutuhan produk, user stories, dan kriteria penerimaan. Jika terdapat perbedaan antara kebutuhan PRD dan perilaku aplikasi saat ini, tandai sebagai _gap_ implementasi; jangan menyamakan fitur yang masih direncanakan dengan fitur yang sudah berfungsi.

## 2. Latar Belakang dan Permasalahan

Mahasiswa tingkat akhir dan _fresh graduate_ sering menghadapi kesulitan saat menilai kesiapan diri untuk melamar magang atau pekerjaan _entry-level_. Daftar skill pada CV tidak selalu menjelaskan kedalaman pengalaman, sementara persyaratan pekerjaan bisa sangat luas dan berubah.

Dari proses riset dan perancangan Modul 1–4 yang dirangkum dalam PRD, kebutuhan utamanya mencakup:

- Menghubungkan **pengalaman proyek yang benar-benar dikerjakan** dengan keterampilan yang relevan.
- Memahami perbedaan antara **pernah memakai teknologi** dan **mampu menjelaskan penerapannya**.
- Membandingkan gambaran kompetensi dengan kebutuhan posisi yang dituju.
- Menentukan **keterampilan prioritas** dan arah belajar yang lebih terstruktur.

**Rumusan masalah:** bagaimana membantu calon pekerja awal karier memahami kompetensi mereka berdasarkan bukti proyek, kemudian mengidentifikasi skill gap dan langkah pengembangan yang relevan dalam satu alur yang mudah diikuti?

## 3. Visi, Nilai Utama, dan Tujuan

### Visi Produk

Mewujudkan pengalaman persiapan karier yang menghubungkan **bukti proyek → validasi pemahaman → gambaran kompetensi → skill gap → roadmap pembelajaran**.

### Nilai Pembeda: _Evidence-first_

BUKTIVA menempatkan bukti proyek sebagai **konteks utama**, bukan sekadar menerima klaim keterampilan pada CV. Dalam visi produk akhir, bukti dan jawaban validasi dapat digunakan untuk mendukung analisis yang lebih kontekstual. **Kemampuan ini belum boleh dianggap sebagai analisis otomatis yang telah tersedia pada prototipe Modul 7.**

### Tujuan Pengalaman Pengguna

1. Pengunjung memahami fungsi dan manfaat BUKTIVA sebelum memulai.
2. Pengguna mengetahui informasi yang perlu disiapkan: proyek, target role, dan CV bila tersedia.
3. Pengguna bisa menelusuri langkah analisis dengan jelas serta kembali memperbaiki masukan.
4. Pengguna memahami contoh ringkasan kompetensi, kekuatan, skill gap, dan rekomendasi.
5. Website tetap nyaman digunakan pada desktop, tablet, dan mobile.

## 4. Target Pengguna

| Aspek          | Keterangan sesuai PRD                                                                        |
| -------------- | -------------------------------------------------------------------------------------------- |
| Pengguna utama | Mahasiswa tingkat akhir dan _fresh graduate_ di Indonesia                                    |
| Situasi        | Mempersiapkan lamaran kerja/magang atau transisi ke posisi _entry-level_                     |
| Bukti awal     | Setidaknya satu proyek, repository, portofolio, deployment, laporan, atau pengalaman relevan |
| Kebutuhan      | Mengidentifikasi kompetensi, gap, prioritas, dan rencana belajar                             |
| Perangkat      | Browser desktop dan perangkat mobile                                                         |

PRD menggunakan **persona representatif hasil sintesis riset**, bukan identitas seorang narasumber tertentu. Fokus desain harus mendukung pengguna yang belum yakin sejauh mana pengalamannya memenuhi tuntutan karier yang diincar.

## 5. Ruang Lingkup dan Status Modul 8

### Cakupan yang telah dikembangkan dalam repository

- Antarmuka publik dan Workspace yang diturunkan dari rancangan Figma serta HTML awal.
- API Next.js untuk ingestion bukti, pertanyaan/evaluasi validasi, dan proses analisis.
- Penyiapan bukti proyek dari repository GitHub dan berkas ZIP, dengan validasi input dan penanganan kegagalan sumber.
- Modul AI untuk ekstraksi/evaluasi skill, normalisasi input, validasi output terstruktur, dan penanganan error model.
- Modul scoring untuk readiness score dan skill gap, serta formatter respons untuk konsumsi frontend.
- Supabase untuk autentikasi sesi dan penyimpanan data aplikasi sesuai tabel/policy yang digunakan.
- Roadmap pembelajaran yang dibentuk dari gap dan hasil skill, serta integrasi item roadmap dengan Dashboard.
- Halaman profil dan penyimpanan foto profil menggunakan Supabase Storage.
- Unit test untuk ingestion, analysis, AI, validation, scoring, dan roadmap.

### Batasan yang Tetap Perlu Diperiksa

- Pemanggilan AI memerlukan API key dan konfigurasi environment yang benar; respons model dapat gagal, timeout, atau terkena pembatasan layanan.
- Integrasi AI tidak otomatis berarti seluruh keluaran selalu benar. Input dan output model divalidasi, tetapi relevansi hasil tetap bergantung pada bukti, aturan scoring, dataset evaluasi, dan pengujian.
- Dukungan Google OAuth, reset password melalui email, serta pemrosesan dokumen perlu diverifikasi pada environment yang digunakan untuk demo/deployment.
- Dokumentasi repository mencatat ingestion GitHub dan ZIP. Jangan menyatakan dukungan GitLab atau semua format PDF setara tanpa memeriksa kode aktual.
- Data di `sessionStorage` tetap bersifat sementara; data yang tersimpan di Supabase memiliki perilaku berbeda dan bergantung pada tabel, RLS, serta endpoint terkait.
- Angka pengujian yang disebut di dokumen pendukung adalah hasil pada tahap integrasi yang dicatat di dokumen itu, bukan jaminan bahwa commit terbaru belum mengalami regresi.

Fitur diberi status **terintegrasi**, **simulasi**, atau **perlu verifikasi** berdasarkan kode dan pengujian yang sesuai.

## 6. Fitur dan Pemetaan Kebutuhan PRD

Tabel berikut menghubungkan kebutuhan fungsional **F-01 s.d. F-16** dari PRD dengan implementasi frontend yang telah **dilaporkan**. Istilah _tersedia_ menunjukkan adanya halaman atau interaksi frontend, **bukan** hasil audit penerimaan menyeluruh.

| ID   | Fitur sesuai PRD            | Yang harus didukung                                                            | Status yang terdokumentasi                                                             |
| ---- | --------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| F-01 | Landing Page                | Nilai utama, CTA, navigasi ke Tentang, Cara Kerja, Login, Register             | Halaman tersedia; perilaku scroll spy perlu verifikasi                                 |
| F-02 | Tentang BUKTIVA             | Konsep _evidence-based_, visi AI, manfaat, sasaran pengguna                    | Section frontend tersedia                                                              |
| F-03 | Cara Kerja                  | Empat langkah: proyek, validasi, skill gap, roadmap                            | Section frontend tersedia                                                              |
| F-04 | Team Kami & Footer          | Lima anggota, peran, tautan yang tersedia, footer, bantuan/kontak              | Bagian landing tersedia menurut pengembangan; detail perlu pemeriksaan repository      |
| F-05 | Login                       | Email, password, navigasi reset/register, Google sebagai UI/simulasi           | Frontend tersedia; autentikasi nyata belum diverifikasi                                |
| F-06 | Register                    | Nama, email, password dan konfirmasi, validasi dasar                           | Frontend tersedia; validasi akhir perlu diuji                                          |
| F-07 | Reset Password              | Form email dan feedback simulasi                                               | UI termasuk ruang lingkup; perilaku terakhir perlu diverifikasi                        |
| F-08 | Dashboard                   | Ringkasan aktivitas, skill, gap, rekomendasi, roadmap, riwayat terbaru         | Frontend demo tersedia                                                                 |
| F-09 | Analisa Baru / Input Proyek | GitHub/GitLab, portofolio, deployment atau PDF; status input                   | Validasi URL dan UI PDF tersedia; dukungan GitLab/PDF-only belum sepenuhnya setara PRD |
| F-10 | Target Role                 | Enam role, deskripsi pekerjaan opsional                                        | Form dan penyimpanan sesi tersedia                                                     |
| F-11 | Upload CV Opsional          | Area unggah dan status; boleh dilewati                                         | Langkah frontend tersedia; kelulusan jalur tanpa CV perlu diuji                        |
| F-12 | Review Input                | Ringkasan proyek, role, deskripsi, CV opsional dan tombol kembali              | Frontend tersedia                                                                      |
| F-13 | Pertanyaan Validasi         | Lima pertanyaan terkait proyek, kontribusi, kendala, solusi; jawaban sementara | Alur 1–5 tersedia; adaptasi berbasis proyek belum merupakan AI nyata                   |
| F-14 | Hasil Analisis              | Skor/skill/gap/bukti/rekomendasi simulasi, unduh bila tersedia                 | Demo hasil dan cetak browser tersedia                                                  |
| F-15 | Riwayat Analisis            | Daftar contoh, role, teknologi, tanggal, skor, status, cari/filter/urut        | Empat entri demo; pencarian, filter, sort dan detail dilaporkan berfungsi              |
| F-16 | Navigasi Alur               | Kembali/lanjut, penanganan input tidak lengkap, pemeliharaan state             | Alur sudah tersambung; verifikasi regresi tetap diperlukan                             |

### Halaman Pendukung dari Prototipe yang Sudah Dikembangkan

- **Skill Gap Report:** tujuh perbandingan skill contoh Frontend Developer.
- **Road Map Pengembangan Skill:** empat tahapan belajar contoh; opsi simpan ke Dashboard untuk sesi browser.
- **Profile:** desain dan paket implementasi telah disiapkan; keberadaan route pada checkout terbaru perlu dikonfirmasi.
- **Proses Analisis:** tampilan progress simulasi, bukan backend analisis.

Bagian ini memperinci hasil implementasi di luar tabel F-01–F-16. Dalam revisi PRD berikutnya, halaman pendukung dapat diberikan requirement dan acceptance criteria tersendiri jika disetujui tim.

## 7. Alur Pengguna

### Pengunjung

```text
Landing / Beranda
    ├── Tentang BUKTIVA
    ├── Cara Kerja
    └── Team Kami
          ↓
       Masuk / Daftar
```

### Alur Analisis Frontend

```text
Dashboard
   ↓
Analisa Baru — Upload Project
   ↓
Target Role (+ deskripsi pekerjaan opsional)
   ↓
Upload CV (opsional)
   ↓
Review Input (dapat kembali memperbaiki)
   ↓
Proses Analisis (simulasi antarmuka)
   ↓
5 Pertanyaan Validasi
   ↓
Hasil Analisis (data contoh)
   ↓
Skill Gap Report (data contoh)
   ↓
Road Map Pengembangan Skill (data contoh)
   ↓
Simpan ke Dashboard (sementara dalam sesi browser)
```

### Skenario Alternatif Penting

| Kondisi                           | Perilaku yang diharapkan berdasarkan PRD                                      |
| --------------------------------- | ----------------------------------------------------------------------------- |
| Bukti proyek wajib belum tersedia | Tidak melanjutkan; tampilkan pesan yang menjelaskan kebutuhan input           |
| URL tidak sesuai format           | Pesan validasi spesifik; tidak perlu mengecek repository secara nyata         |
| Target role belum dipilih         | Ingatkan pengguna sebelum review/lanjut                                       |
| Pengguna melewati CV              | Tetap boleh lanjut karena CV **opsional**                                     |
| Jawaban validasi belum lengkap    | Tampilkan status yang menjelaskan langkah perbaikan                           |
| Pengguna kembali                  | Pertahankan masukan sementara sejauh mekanisme frontend mendukung             |
| Hasil memakai data contoh         | Beri label **demo/simulasi**, bukan skor AI pengguna                          |
| Layar lebih kecil                 | Konten tetap dapat diakses tanpa terpotong atau scroll horizontal tidak perlu |

Penyimpanan riwayat per pengguna belum merupakan persyaratan backend pada fase ini. Riwayat dapat disajikan menggunakan **data dummy**.

## 8. Tech Stack

PRD **tidak mengunci framework tertentu**. Tim memilih stack berikut untuk implementasi repository frontend:

| Kebutuhan      | Teknologi / pendekatan                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| Framework      | **Next.js 16.4.0**, App Router (berdasarkan catatan implementasi; cek `package.json` untuk versi terkini) |
| UI             | **React 19**                                                                                              |
| Bahasa         | **TypeScript**                                                                                            |
| Styling        | **Tailwind CSS v4** dan CSS terstruktur per halaman                                                       |
| Runtime        | **Node.js** dan **npm**                                                                                   |
| Routing/Layout | Next.js App Router, layout bersama Workspace                                                              |
| Aset           | `public/images/`                                                                                          |
| Data sementara | State React dan `sessionStorage`                                                                          |
| Acuan desain   | Figma Modul 5                                                                                             |
| Backend / data | Next.js Route Handlers, Supabase Auth, PostgreSQL, dan Supabase Storage sesuai modul yang terintegrasi    |
| AI / validasi  | `@google/genai`, `openai`, Zod, modul formatter dan evaluator; provider aktif bergantung pada endpoint    |
| Pengujian      | Node.js Test Runner, `tsx`, TypeScript, ESLint, dan suite di `tests/`                                     |

Versi dependensi dan skrip paling otoritatif adalah **`package.json` dan lockfile** pada checkout yang digunakan, bukan tabel dokumentasi ini.

## 9. Sumber Data dan Layanan yang Digunakan

Bagian ini menjelaskan sumber data dan layanan eksternal berdasarkan file konfigurasi, dependency, serta dokumentasi teknis yang ada di repository. Integrasi yang benar-benar digunakan pada setiap jalur tetap perlu dicocokkan dengan endpoint dan environment yang aktif.

| Sumber/layanan                        | Peran                                                                          | Data/proses terkait                                                                                                                                                                 | Batasan dan catatan                                                                                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Supabase Auth**                     | Mengelola identitas dan sesi pengguna untuk route yang menggunakan autentikasi | Sesi pengguna dan identitas yang diverifikasi di sisi server                                                                                                                        | Endpoint harus mengambil identitas dari sesi tervalidasi; `user_id` yang dikirim klien bukan bukti kepemilikan.                                                             |
| **Supabase Database (PostgreSQL)**    | Menyimpan data inti aplikasi                                                   | `analyses`, `project_evidences`, `validation_questions`, `validation_answers`, `analysis_skill_results`, `skill_gaps`, `roadmap_items`, dan data profil sesuai skema yang digunakan | Akses harus mengikuti kepemilikan analisis dan kebijakan Row Level Security (RLS). Tidak setiap bagian UI harus diasumsikan membaca database; periksa implementasi halaman. |
| **Supabase Storage**                  | Menyimpan file yang diunggah, termasuk foto profil                             | Objek foto profil pada bucket `avatars` dan URL yang digunakan oleh profil                                                                                                          | Pastikan bucket, kebijakan upload, dan akses objek sesuai konfigurasi. Jangan pernah mengekspos service-role key ke browser.                                                |
| **Google Gemini**                     | Provider AI yang digunakan/dibahas dalam alur ekstraksi atau evaluasi tertentu | Ekstraksi skill dari bukti dan/atau evaluasi jawaban sesuai endpoint yang memanggilnya                                                                                              | SDK `@google/genai` tersedia. Pemanggilan live memerlukan konfigurasi rahasia; layanan bisa mengalami timeout, HTTP 503, atau batas penggunaan.                             |
| **OpenAI SDK**                        | Dependency provider AI yang tersedia dalam project                             | Pemakaian hanya pada jalur yang secara eksplisit menginisialisasi dan memanggilnya                                                                                                  | Dependency saja tidak membuktikan bahwa semua alur memakai OpenAI. Periksa kode endpoint dan environment sebelum menyatakan fitur OpenAI aktif.                             |
| **GitHub repository**                 | Sumber bukti proyek yang dapat diproses                                        | Berkas dan metadata repository yang diambil oleh modul ingestion                                                                                                                    | Kegagalan jaringan, repository tidak tersedia, atau input yang tidak valid perlu ditangani. Jangan mengklaim dukungan provider lain tanpa verifikasi.                       |
| **Berkas ZIP**                        | Sumber alternatif bukti proyek                                                 | File proyek yang diekstrak/ditelaah oleh modul ingestion                                                                                                                            | Pemrosesan harus menerapkan validasi dan batas keamanan sesuai kode aktual; batas ukuran dan ekstensi harus merujuk implementasi, bukan perkiraan.                          |
| **React state dan `sessionStorage`**  | Menyimpan state sementara pada alur UI tertentu                                | Input sementara, status langkah, atau fitur yang memang menggunakan penyimpanan browser                                                                                             | Bukan database permanen dan tidak otomatis tersinkron antarperangkat.                                                                                                       |
| **Data statis atau dataset evaluasi** | Mendukung tampilan contoh dan pengujian kualitas AI                            | Contoh konten UI dan `golden-dataset.json` untuk membandingkan output model dengan ground truth                                                                                     | Dataset evaluasi adalah alat pengujian, bukan benchmark industri tervalidasi. Data demo harus dibedakan dari hasil personal pengguna.                                       |

### Alur data aplikasi

```text
Pengguna
   │
   ├── Sesi dan identitas ──────────────────> Supabase Auth
   │
   ├── Bukti proyek ───────────────────────> Modul ingestion
   │                                         ├── GitHub repository
   │                                         └── Berkas ZIP
   │
   ├── Jawaban validasi ───────────────────> Validasi input dan sesi analisis
   │
   └── Analisis ───────────────────────────> Endpoint server / modul AI
                                             ├── Normalisasi input
                                             ├── Ekstraksi atau evaluasi AI
                                             ├── Validasi output terstruktur
                                             ├── Scoring dan readiness
                                             ├── Skill gap
                                             └── Roadmap
                                                   │
                                                   ▼
                                           Supabase Database
                                                   │
                                                   ▼
                                      Hasil, riwayat, dan Dashboard
```

Diagram di atas menggambarkan alur logis modul yang didokumentasikan, bukan jaminan bahwa semua halaman telah tersambung ke satu jalur data tanpa fallback atau data contoh.

### Validasi, scoring, dan kualitas output AI

- `src/lib/ai/input-processor.ts` menormalisasi masukan, menangani teks bukti, dan memvalidasi jumlah jawaban validasi sesuai aturan alur.
- `src/lib/ai/validation/ai-output-validator.ts` menggunakan Zod untuk memvalidasi bentuk output AI, termasuk rentang level/confidence dan identitas skill.
- `src/lib/ai/error-handler.ts` menangani kegagalan API, timeout, dan respons JSON yang tidak valid agar proses dapat mengembalikan status gagal secara terkontrol.
- `src/lib/ai/ai-result-formatter.ts` menyiapkan struktur respons hasil yang dikonsumsi frontend, termasuk skill, persentase, skill gap, dan roadmap.
- Modul scoring menggunakan fungsi perhitungan skill gap bersama agar aturan perhitungan tidak berbeda antara tampilan dan backend.
- `src/data/evaluation/golden-dataset.json` digunakan sebagai dataset evaluasi awal. Hasil pengujian otomatis tidak boleh disamakan dengan validasi kebutuhan industri atau jaminan akurasi untuk semua repository.

### Keamanan konfigurasi

- Simpan konfigurasi lokal dalam `.env.local` dan jangan commit file tersebut.
- Gunakan variabel publik hanya untuk nilai yang memang aman dipakai di browser.
- **Jangan pernah mengekspos `SUPABASE_SERVICE_ROLE_KEY`, API key Gemini/OpenAI, token akses, atau rahasia lain di komponen client maupun dokumentasi.**
- Nama variabel yang benar harus dicocokkan dengan kode konfigurasi Supabase dan modul AI; jangan menebak nama atau mencantumkan nilai rahasia.
- Uji input tidak valid, analisis tidak ditemukan, sesi tidak cocok, akses tanpa autentikasi, akses lintas akun, dan kegagalan provider AI.
- Penggunaan UUID atau identifier yang sulit ditebak tidak menggantikan pemeriksaan autentikasi, otorisasi objek, dan RLS di server.

## 10. Instalasi dan Menjalankan Proyek

### Prasyarat

- Git.
- Node.js yang kompatibel dengan versi Next.js dalam repository (untuk Next.js 16, gunakan **Node.js 20.9+**).
- npm.
- Editor, misalnya Visual Studio Code.

### Instalasi

```bash
git clone https://github.com/adelyapy/EvidenceBasedSkillGapAnalyzer-VINIX7.git
cd EvidenceBasedSkillGapAnalyzer-VINIX7

# Opsional: pindah ke branch pengembangan frontend
# Pastikan branch ini masih dipakai tim sebelum menjalankan perintah.
git switch frontend2-dev

npm install
```

Jika repository sudah ada di komputer, **jangan clone ulang**. Buka direktori project, periksa status Git, kemudian instal dependency bila diperlukan.

### Development Server

```bash
npm run dev
```

Buka `http://localhost:3000` (atau alamat yang dilaporkan Next.js jika port berubah).

### Quality Checks

```bash
npm run lint -- --no-cache
npx tsc --noEmit --incremental false
npm run build
git diff --check
```

Jika tersedia skrip `start` pada `package.json`, hasil build dapat dijalankan dengan `npm run start` setelah `npm run build`.

### Environment Variables

Frontend simulasi dapat berjalan tanpa layanan backend tertentu. **Jangan menyalin kredensial ke source code atau meng-commit `.env.local`.** Bila integrasi Supabase/AI nanti diimplementasikan, dokumentasikan nama variabel yang **benar-benar digunakan kode** pada saat itu; saat ini README sengaja tidak mengarang daftar environment variables.

## 11. Struktur Direktori

Struktur berikut adalah gambaran arsitektur dan halaman yang terdokumentasi, **bukan hasil `tree` langsung dari repository terbaru**:

```text
EvidenceBasedSkillGapAnalyzer-VINIX7/
├── public/
│   └── images/                    # Aset aplikasi Next.js
├── legacy-html/                   # Arsip 21 halaman HTML prototipe awal
├── assets/
│   └── images/                    # Aset referensi untuk HTML legacy
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Layout HTML/body global
│   │   ├── ...                    # Landing + halaman Auth
│   │   └── workspace/             # Folder biasa, URL /workspace/*
│   │       ├── layout.tsx         # Menggunakan WorkspaceShell
│   │       ├── dashboard/
│   │       ├── analisa-baru/
│   │       │   ├── page.tsx       # Input proyek
│   │       │   ├── target-role/
│   │       │   ├── upload-cv/
│   │       │   ├── review-input/
│   │       │   ├── proses-analisis/
│   │       │   ├── pertanyaan/[nomor]/
│   │       │   ├── hasil-analisis/
│   │       │   ├── skill-gap-report/
│   │       │   └── roadmap/
│   │       ├── riwayat-analisis/
│   │       └── profile/           # Verifikasi status pemasangan
│   ├── components/
│   │   ├── workspace/             # Shell, Sidebar, Header, Icon
│   │   ├── dashboard/             # Bagian ringkasan Dashboard
│   │   ├── analysis/              # Input, alur, hasil, gap, roadmap
│   │   ├── history/               # Pencarian/filter/riwayat
│   │   └── profile/               # Jika sudah dipasang
│   ├── data/                      # Mock, daftar role, dan konfigurasi route
│   ├── types/                     # Kontrak TypeScript
│   ├── styles/                    # CSS terorganisir menurut halaman
│   └── lib/                       # Utilitas/integrasi jika diperlukan
├── package.json
└── README.md
```

**Ketentuan struktur tim:** pertahankan `src/app/workspace/` tanpa tanda kurung; jangan membuat `src/features/` atau `(workspace)` sebagai pengganti struktur yang telah disepakati. File di `legacy-html/` dipertahankan sebagai referensi. Gambar Next.js diakses melalui `/images/...` dari `public/images/`.

## 12. Arsitektur Frontend dan Konvensi

### Layout Bersama

```text
RootLayout
└── WorkspaceLayout
    └── WorkspaceShell
        ├── WorkspaceSidebar  ← satu komponen navigasi samping
        ├── WorkspaceHeader   ← satu komponen navbar atas
        └── Konten route aktif
```

- **Landing dan Auth** menggunakan tata letak masing-masing, bukan Sidebar Workspace.
- **Dashboard, Analisa Baru, Riwayat Analisis, dan Profile** (ketika terpasang) mewarisi layout Workspace.
- **Jangan membuat Header/Sidebar baru di setiap halaman.** Menu dan status aktif mengikuti konfigurasi navigasi bersama pada `src/data/workspace.ts` (`activePrefix`).

### Tanggung Jawab Folder

| Folder            | Tanggung jawab                             |
| ----------------- | ------------------------------------------ |
| `src/app/`        | Route dan layout Next.js; metadata halaman |
| `src/components/` | Komponen presentasi dan interaksi React    |
| `src/data/`       | Data demo, opsi role, route/config         |
| `src/types/`      | TypeScript interfaces/type aliases         |
| `src/styles/`     | CSS halaman dan Workspace                  |
| `src/lib/`        | Helper/integrasi saat memang diperlukan    |
| `public/images/`  | Ilustrasi/gambar aplikasi                  |
| `legacy-html/`    | HTML awal sebagai referensi historis       |

### Prinsip Kolaborasi

Gunakan komponen bersama dan penamaan CSS yang terisolasi untuk mencegah efek samping. Hindari perubahan kontrak route atau key penyimpanan tanpa koordinasi tim. Perbaikan UI harus mempertahankan fungsi yang sudah diuji.

## 13. Daftar Route

### Workspace

| Route                                         | Tujuan                                          |
| --------------------------------------------- | ----------------------------------------------- |
| `/workspace/dashboard`                        | Ringkasan Dashboard (contoh)                    |
| `/workspace/analisa-baru`                     | Input bukti proyek                              |
| `/workspace/analisa-baru/target-role`         | Pemilihan role dan deskripsi pekerjaan opsional |
| `/workspace/analisa-baru/upload-cv`           | CV opsional                                     |
| `/workspace/analisa-baru/review-input`        | Meninjau input                                  |
| `/workspace/analisa-baru/proses-analisis`     | Status/progress simulasi                        |
| `/workspace/analisa-baru/pertanyaan/1` … `/5` | Lima pertanyaan validasi                        |
| `/workspace/analisa-baru/hasil-analisis`      | Hasil contoh                                    |
| `/workspace/analisa-baru/skill-gap-report`    | Perbandingan keterampilan contoh                |
| `/workspace/analisa-baru/roadmap`             | Roadmap pembelajaran contoh                     |
| `/workspace/riwayat-analisis`                 | Riwayat contoh dengan search/filter/detail      |
| `/workspace/profile`                          | Profil; **verifikasi implementasi aktual**      |

**Landing:** route publik utama berada di `/`. Route pasti Login, Register, dan Reset Password mengikuti struktur `src/app/` di repository; README tidak mengarang URL yang belum diperiksa. Beberapa URL legacy mungkin masih memiliki redirect kompatibilitas menuju route Workspace.

## 14. Data Demo dan Penyimpanan Sementara

### Data yang Terlihat Bukan Penilaian Personal

| Area           | Contoh dalam implementasi                                                      | Keterangan                                                              |
| -------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Dashboard      | Statistik contoh seperti **12** analisis                                       | Tidak otomatis berasal dari empat entri riwayat                         |
| Hasil Analisis | Skor contoh **78%**                                                            | Bukan hasil penilaian terhadap input pengguna                           |
| Skill Gap      | Tujuh skill; misalnya TypeScript **50/80**, Testing **40/70**, CI/CD **30/60** | Bukan perbandingan hasil pengguna dengan benchmark industri tervalidasi |
| Roadmap        | TypeScript, Testing, CI/CD, Proyek Lanjutan                                    | Contoh khusus Frontend Developer                                        |
| Riwayat        | Empat entri proyek; rerata **70%**                                             | Bukan histori database akun                                             |
| Profile        | Informasi identitas contoh                                                     | Belum boleh dianggap bersumber dari sistem Auth nyata                   |

**Perhatian:** role pengguna yang dipilih tidak otomatis mengubah semua hasil contoh. UI harus tetap menyatakan saat konten Frontend Developer masih dipakai sebagai ilustrasi, termasuk jika pengguna sebelumnya memilih role berbeda.

### Mekanisme Penyimpanan State

Bagian frontend yang telah dilaporkan menggunakan `sessionStorage`:

| Key                               | Fungsi                                    |
| --------------------------------- | ----------------------------------------- |
| `buktiva:upload-project:links:v1` | Bukti URL proyek                          |
| `buktiva:target-role:v1`          | Target karier dan isi form                |
| `buktiva.analysis.targetRole`     | Adapter pilihan role bagi langkah lain    |
| `buktiva.analysis.jobDescription` | Adapter deskripsi pekerjaan               |
| `buktiva.analysis.projects`       | Adapter proyek untuk alur selanjutnya     |
| `buktiva:roadmap:saved:v1`        | Roadmap contoh yang disimpan ke Dashboard |

Beberapa key alur lainnya didefinisikan oleh implementasi aktual di `src/data/analysis.ts`. Data `sessionStorage` bersifat **per sesi tab browser**, bukan database permanen. Jangan mengganti key atau bentuk payload tanpa memperbaiki semua pembaca/penulisnya.

### Batasan Simulasi yang Perlu Dipahami

- Pada implementasi Upload Project yang terdokumentasi, **PDF hanya berada di memori browser**, sehingga **PDF-only belum bisa digunakan untuk melanjutkan** alur seperti bukti URL. Ini merupakan kesenjangan yang harus diperbaiki bila ingin memenuhi opsi input dokumen pada PRD secara lebih penuh.
- Validasi repository pada frontend pernah dibatasi pada **GitHub**, sedangkan F-09 juga menyebut **GitLab**. Perlakukan GitLab sebagai item verifikasi/perbaikan, bukan klaim sudah didukung.
- Tahap Proses Analisis sekitar **12 detik** merupakan simulasi progress.
- Cetak laporan melalui `window.print()` menggunakan browser; **bukan** generator laporan PDF backend.
- Tombol materi Roadmap belum memiliki halaman tujuan dan dinonaktifkan dengan penjelasan.
- Roadmap yang dibuat oleh endpoint evaluasi dapat disimpan ke tabel `roadmap_items`; verifikasi lagi bahwa item yang tampil di Dashboard berasal dari analisis terbaru dan tidak terduplikasi.

## 15. Validasi, Interaksi, dan Penanganan Kesalahan

Berdasarkan F-09–F-16, US-03–US-07, dan Bagian 8 PRD, prototipe harus memberikan perilaku berikut:

1. **Label jelas:** input wajib diberi label yang dapat dibaca, bukan placeholder saja.
2. **Pencegahan kesalahan:** URL/email serta konfirmasi password divalidasi secara wajar di frontend; tidak perlu mengklaim verifikasi backend.
3. **Pesan bermanfaat:** sebutkan input mana yang salah atau belum lengkap dan apa yang harus diperbaiki.
4. **Kontrol pengguna:** Kembali/Lanjutkan, Reset, serta penutupan dialog harus menjalankan aksi sesuai labelnya.
5. **State alur:** masukan sebelumnya tetap tersedia saat kembali sejauh dukungan penyimpanan frontend memungkinkan.
6. **CV opsional:** tidak boleh memblokir pengguna hanya karena CV dilewati.
7. **Pertanyaan validasi:** lima tahap dapat diikuti dengan indikator progres; jawaban yang belum lengkap diberi feedback.
8. **Simulasi transparan:** pesan seperti “contoh hasil” atau “simulasi berhasil” digunakan bila sistem tidak melakukan proses sesungguhnya.
9. **Fitur belum tersedia:** tombol harus disabled dengan alasan atau tidak ditampilkan; jangan diarahkan ke link palsu.

Implementasi tertentu dapat masih membutuhkan perbaikan. Daftar ini adalah **persyaratan perilaku dan sasaran QA**, bukan klaim semuanya sudah lolos audit.

## 16. UI/UX, Responsivitas, dan Aksesibilitas

### Konsistensi Desain

- Figma Modul 5 menjadi referensi utama visual: hierarki konten, warna, tipografi, ilustrasi, spacing, dan komponen.
- Pertahankan bahasa Indonesia yang mudah dipahami pengguna sasaran.
- Gunakan Navbar dan Sidebar bersama pada seluruh route Workspace.
- CSS halaman dikelompokkan dengan class yang tidak saling berbenturan, misalnya `bkd-` (Dashboard), `bkp-` (Input Proyek), `bktr-` (Target Role), `bkr-` (Hasil), `bks-` (Skill Gap), `bkrm-` (Roadmap), `bkh-` (Riwayat), dan `bkpfl-` (Profile bila ada).

### Responsivitas dan Aksesibilitas

- Konten utama tidak terpotong pada desktop, tablet, dan mobile.
- Tidak ada horizontal overflow yang tidak diperlukan.
- Heading berurutan dan semantik HTML tepat; label form terhubung ke input.
- Gambar bermakna memiliki teks alternatif; ikon dekoratif tidak menambah informasi keliru.
- Keyboard focus terlihat; dialog dapat ditutup dan memiliki pengelolaan fokus yang baik.
- Kontras warna dan ukuran teks/tombol memadai.
- Kesalahan **tidak hanya ditunjukkan melalui warna**.
- Hormati `prefers-reduced-motion` jika ada animasi.

### 10 _Usability Heuristics_ Nielsen

Prinsip ini digunakan sebagai **kerangka audit perbaikan**, bukan pengganti pengujian pengguna:

| Prinsip                            | Contoh penerapan di BUKTIVA                                          |
| ---------------------------------- | -------------------------------------------------------------------- |
| 1. Visibility of system status     | Stepper, status loading/simulasi, status simpan, active section/menu |
| 2. Match with real world           | Istilah karier/skill yang mudah dipahami, label data contoh          |
| 3. User control and freedom        | Kembali, batal, reset, tutup dialog                                  |
| 4. Consistency and standards       | Tombol, input, heading, Sidebar, Navbar konsisten                    |
| 5. Error prevention                | Validasi proyek, role, dan jawaban sebelum lanjut                    |
| 6. Recognition rather than recall  | Ringkasan input pada Review Input                                    |
| 7. Flexibility and efficiency      | Pencarian/filter riwayat, navigasi keyboard, mobile drawer           |
| 8. Aesthetic and minimalist design | Hierarki visual, whitespace, CTA utama                               |
| 9. Error recognition and recovery  | Pesan validasi spesifik dan petunjuk perbaikan                       |
| 10. Help and documentation         | Panduan input, batasan demo, informasi fitur belum tersedia          |

Audit heuristik menyeluruh dan kepatuhan WCAG **belum boleh dinyatakan lulus** tanpa pemeriksaan khusus.

## 17. Kriteria Keberhasilan dan Evaluasi

PRD Bagian 4.2 menetapkan **target evaluasi**, bukan hasil yang sudah dicapai:

| Indikator                       | Target PRD                                                                                          | Cara pembuktian                                       |
| ------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Penyelesaian tugas pengguna uji | **≥ 80%**                                                                                           | Observasi skenario input proyek sampai hasil simulasi |
| Pemahaman hasil                 | **≥ 80%**                                                                                           | Pertanyaan setelah pengguna membaca hasil             |
| Relevansi pertanyaan validasi   | **≥ 80%**                                                                                           | Penilaian pengguna setelah menyelesaikan pertanyaan   |
| _System Usability Scale_ (SUS)  | **≥ 70**                                                                                            | Kuesioner SUS apabila usability test dilakukan        |
| Kualitas frontend               | **Tidak ada runtime error yang menghentikan alur**, minimal **2 aksi interaktif dinamis berfungsi** | Pengujian browser dan interaksi                       |
| Kesesuaian desain               | Halaman prioritas sesuai **Figma Modul 5**                                                          | Pembandingan visual berdampingan                      |

**Belum ada hasil usability study yang diverifikasi di README ini.** Tidak menyimpulkan nilai SUS atau persentase keberhasilan hanya dari lint/build atau screenshot.

### Skenario Uji Berbasis User Stories

Tabel berikut merangkum **kriteria penerimaan US-01 sampai US-10** dari PRD sebagai panduan evaluasi, **bukan hasil tes yang otomatis telah lulus**.

| ID        | Kebutuhan pengguna                       | Pemeriksaan penerimaan frontend                                                                |
| --------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **US-01** | Memahami BUKTIVA sebelum memakai layanan | Informasi inti dan CTA tampil; menu Tentang, Cara Kerja, Login, Register berfungsi             |
| **US-02** | Mengetahui tahapan kerja                 | Empat tahapan ditampilkan berurutan dan dapat diakses dengan navigasi/scroll                   |
| **US-03** | Memasukkan bukti proyek                  | Input URL dan/atau unggahan tersedia; input invalid/kosong memperoleh feedback                 |
| **US-04** | Menentukan target role                   | Role dapat dipilih, deskripsi pekerjaan opsional, pilihan terbaca saat Review                  |
| **US-05** | Memeriksa dan memperbaiki input          | Review menampilkan data pokok dan pengguna dapat kembali memperbaiki                           |
| **US-06** | Menjawab validasi pemahaman proyek       | Lima pertanyaan dapat diisi; progres dan Kembali/Lanjutkan bekerja                             |
| **US-07** | Memahami kekuatan dan skill gap          | Hasil memuat ringkasan, bukti/gap/rekomendasi, dengan label simulasi jika belum ada AI         |
| **US-08** | Meninjau riwayat                         | Riwayat dummy tampil; pencarian/filter yang ditawarkan benar-benar bekerja                     |
| **US-09** | Menggunakan desktop maupun mobile        | Konten utama tidak terpotong; tidak ada scroll horizontal yang tidak perlu                     |
| **US-10** | Berpindah antarhalaman akun              | Login, Register, dan Reset Password terhubung; proses simulasi tidak disebut autentikasi nyata |

## 18. Quality Assurance dan Pengujian

### Pemeriksaan Teknis

```bash
npm run lint
npx tsc --noEmit
npm run test:ingestion
npm run test:analysis
npm run test:ai
npm run test:validation
npm run test:scoring
npm run test:roadmap
npm run build
git diff --check
```

Skrip `test:ai:live` dan `test:validation:live` menjalankan pengujian yang memerlukan konfigurasi environment/provider live. Jalankan hanya setelah environment tersedia dan pahami bahwa hasil live dapat dipengaruhi ketersediaan layanan eksternal.

### Browser / Interaksi Manual

Ukuran referensi yang digunakan dalam pengujian pengembangan:

| Perangkat     | Viewport       |
| ------------- | -------------- |
| Desktop       | **1440 × 900** |
| Laptop        | **1066 × 756** |
| Tablet        | **820 × 900**  |
| Mobile        | **390 × 844**  |
| Mobile sempit | **320 × 700**  |

Skenario regresi minimum:

1. Navigasi Landing: Beranda → Tentang → Cara Kerja → Team Kami; indikator aktif mengikuti scroll/klik bila fitur scroll spy telah diterapkan.
2. Navigasi Login/Register/Reset Password di frontend.
3. Dashboard → Input Proyek → Target Role → CV opsional → Review → simulasi proses → lima pertanyaan → Hasil → Skill Gap → Roadmap.
4. Roadmap → Simpan Ke Dashboard → periksa perubahan nyata pada panel Roadmap Dashboard.
5. Dashboard → Riwayat → pencarian/filter/sort/reset → dialog detail → kembali.
6. Sidebar expanded/collapsed, mobile drawer, dropdown profil, tautan Profile dan Keluar ketika fitur terpasang.
7. Validasi input kosong/tidak sah, empty state, indikator fokus, serta ketiadaan console/hydration/runtime error dan horizontal overflow.

Pada laporan implementasi sebelumnya, sejumlah halaman telah lulus lint, type-check, build, dan browser test. **Uji ulang perlu dilakukan setelah perubahan berikutnya; hasil pengujian lama tidak otomatis berlaku bagi commit terbaru.**

## 19. Status Implementasi dan Kesenjangan

| Area                                 | Status berdasarkan laporan pengembangan, bukan audit terbaru                                                |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Landing dan Auth                     | Halaman frontend tersedia; scroll spy/logout/auth sungguhan memerlukan verifikasi sesuai perubahan terakhir |
| Dashboard & Workspace bersama        | Terimplementasi                                                                                             |
| Upload Project → Pertanyaan Validasi | Frontend tersedia; alur utama harus diuji ulang, terutama CV opsional dan PDF-only                          |
| Hasil Analisis                       | Demo UI terimplementasi; bukan skor AI dinamis                                                              |
| Skill Gap                            | Demo tujuh skill Frontend Developer terintegrasi                                                            |
| Roadmap                              | Generator/persistensi database telah dikembangkan; verifikasi hasil deduplikasi dan tampilan Dashboard      |
| Riwayat Analisis                     | Demo empat data, search/filter/sort/dialog terimplementasi                                                  |
| Profile                              | Route profil dan foto melalui Supabase telah dikembangkan; uji simpan, refresh, dan modal Edit Profil       |
| Logout Sidebar dan dropdown          | Prompt perbaikan telah disiapkan; hasil terakhir belum terkonfirmasi                                        |
| Navbar Landing mengikuti scroll      | Prompt scroll spy telah disiapkan; hasil terakhir belum terkonfirmasi                                       |
| Sinkronisasi data Dashboard–Riwayat  | Periksa tiap komponen apakah sudah memakai query database atau masih memakai data demo                      |
| Supabase/Auth/AI                     | Modul integrasi tersedia; konfigurasi environment dan alur tiap fitur tetap harus diuji                     |

### Kesenjangan yang Layak Diprioritaskan

1. **F-09:** dukungan GitLab dan pengalaman PDF-only perlu dibandingkan dengan ketentuan input proyek di PRD.
2. **F-11 / US-05:** pastikan CV dapat dilewati dan data review tetap akurat.
3. **F-05–F-07:** UI Auth harus mengkomunikasikan simulasi dengan benar; periksa navigasi tautannya.
4. **F-13 / US-06:** pastikan progres/jawaban konsisten, tanpa mengklaim pertanyaan sudah dihasilkan AI dari proyek.
5. **F-14 / US-07:** tetap bedakan hasil contoh Frontend Developer dari input/role pengguna.
6. **F-15:** jangan menyamakan empat entri Riwayat dengan total statistik demo Dashboard yang berbeda.
7. **Kebutuhan nonfungsional:** selesaikan audit aksesibilitas, konsistensi visual Figma, dan regresi mobile.

## 20. Rencana Pengembangan

### Fokus Penyelesaian dan Penilaian Modul 8

- Verifikasi seluruh F-01–F-16 dan US-01–US-10 terhadap antarmuka aktual.
- Selesaikan gap prioritas pada form, CV opsional, navigasi, dan penanganan error.
- Pastikan Profile, navigasi keluar, dan scroll spy benar-benar berfungsi jika termasuk build final.
- Audit UI terhadap Figma dan 10 heuristik Nielsen; perbaiki secara bertahap tanpa merusak alur.
- Uji responsivitas, keyboard, dan hasil simulasi; lakukan usability test jika memungkinkan.
- Lengkapi dokumentasi keputusan tim dan bukti pengujian.

### Pengembangan Lanjutan

- Supabase Auth, otorisasi, dan manajemen akun.
- Database yang menghubungkan bukti proyek, target role, CV, jawaban, hasil, dan riwayat kepada pengguna.
- Penyimpanan/validasi dokumen secara aman.
- Integrasi layanan AI untuk analisis evidence dan penyusunan pertanyaan serta rekomendasi yang terukur.
- Dasar referensi kebutuhan role/skill yang memiliki sumber, periode pembaruan, dan batasan penggunaan.
- Roadmap personal, materi yang valid, sinkronisasi lintas sesi/perangkat, dan ekspor laporan.
- Unit test, integration test, end-to-end test, monitoring, dan persiapan deployment.

**Rencana tersebut bukan daftar fitur yang telah selesai.**

## 21. Panduan Kontribusi

Repository merupakan pekerjaan kolaboratif. Sebelum mengubah kode:

1. Periksa branch dan `git status`; jangan menimpa perubahan anggota tim.
2. Gunakan `frontend2-dev` bila masih menjadi branch kerja yang disepakati.
3. Kerjakan perubahan yang terfokus; hindari refactor besar tanpa kesepakatan.
4. Pertahankan `WorkspaceSidebar`/`WorkspaceHeader` sebagai komponen bersama, tanpa duplikasi.
5. Pertahankan route, konfigurasi, kontrak TypeScript, aset, dan key `sessionStorage` kecuali perubahan telah disepakati.
6. Jangan menyunting `legacy-html/` hanya untuk menyelesaikan tugas Next.js.
7. Jalankan quality checks dan uji browser sesuai lingkup perubahan.
8. Periksa file yang masuk staging sebelum commit; jangan commit `.env.local`, token API, maupun data sensitif.
9. Gunakan commit yang spesifik dan jangan melakukan _force push_ pada branch bersama.

Contoh perintah:

```bash
git branch --show-current
git status --short
git diff --check

# Setelah meninjau perubahan yang relevan:
git add -A -- src/
git diff --cached --name-status
git diff --cached --check
```

**Catatan:** perintah `git add` di atas adalah contoh. Jika perubahan mencakup `README.md`, dokumentasi, atau aset lain, lakukan staging secara selektif dan tinjau lagi sebelum commit.

Contoh pesan commit: `feat: implement profile page`, `fix: landing navigation scroll spy`, `docs: align README with PRD`.

## 22. Pemecahan Masalah

| Masalah                                  | Pemeriksaan awal                                                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `npm run dev` gagal                      | Periksa versi Node.js, dependency, dan pesan terminal                                                  |
| Port 3000 terpakai                       | Gunakan alamat/port alternatif yang ditampilkan oleh Next.js                                           |
| Aset tidak muncul                        | Pastikan gambar di `public/images/` dan path `/images/...` benar                                       |
| Route 404                                | Periksa struktur `src/app/` dan konfigurasi di `src/data/analysis.ts`/`workspace.ts`                   |
| Sidebar/Header tampil dua kali           | Jangan render navigasi lagi di halaman anak Workspace                                                  |
| Data roadmap hilang di tab/sesi lain     | `sessionStorage` bukan penyimpanan permanen                                                            |
| Data Dashboard tidak sama dengan Riwayat | Data demo berasal dari sumber contoh berbeda                                                           |
| Skor tetap walau masukan berubah         | Hasil belum terhubung ke analisis AI produksi                                                          |
| PDF-only tidak bisa lanjut               | Keterbatasan state/upload frontend yang perlu ditangani sebagai gap implementasi                       |
| `os error 112` pada Windows              | Periksa ruang disk sistem dan folder temp; jangan menghapus `.git` atau konfigurasi secara sembarangan |

## 23. Dokumentasi, Privasi, dan Lisensi

### Referensi Dokumen

- **PRD:** `PRD.md` — dokumen kebutuhan produk yang tersedia di root repository.
- **AI QA:** `AI-testing-and-evaluation.md` — ringkasan pengujian, modul AI, dataset evaluasi, dan kontrak output.
- **Prompt log backend:** `prompt-log-backend.md` — catatan pekerjaan ingestion, AI, evaluasi, Supabase, scoring, roadmap, dan integrasi.
- **Prompt log ai engineer 1:** `prompt-log-ai-engineer1.md`
- **Prompt log frontend developer 1:** `Log_Prompt_Frontend-1.md`
- **Prompt log frontend developer 2:** `Log_Prompt_Frontend-2.md`
- **Desain:** [Figma Modul 5](https://www.figma.com/design/UVAFASV8FI30S6IFXKWUQU/VINIX7-DESIGN-UI?node-id=207-101&t=4u0zQ0JJCLAXJXPG-1).
- **Repository:** [GitHub BUKTIVA](https://github.com/adelyapy/EvidenceBasedSkillGapAnalyzer-VINIX7).
- **HTML awal:** `legacy-html/` (beserta referensi aset `assets/images/`).
- **Kode frontend:** `src/` untuk route, komponen, data, types, dan styles.

### Privasi pada Prototipe

- Jangan memasukkan password asli, API key, atau data pribadi sensitif untuk kebutuhan demonstrasi.
- Field password harus menggunakan input yang sesuai dan tidak menampilkan kata sandi secara terbuka.
- Data contoh, simulasi, dan state browser harus diperlakukan transparan; jangan mengklaim keamanan/penyimpanan akun yang belum diimplementasikan.
- Jangan mengunggah `.env.local`, kredensial, atau dokumen pribadi pengguna ke repository.

### Kontributor dan Lisensi

Proyek dikembangkan oleh **Kelompok 3 — Web & UI/UX Developer, VINIX7**. PRD menyebut lima anggota tim pada tampilan Team Kami, tetapi README tidak mengarang identitas atau peran individual; lengkapi dari daftar tim resmi.

---

**BUKTIVA - Evidence-Based Skill Gap Analyzer**

**Catatan:** README menjelaskan arsitektur dan batasan berdasarkan implementasi yang diketahui. Hasil uji terakhir pada branch pengumpulan tetap menjadi bukti utama untuk menyatakan fitur lulus.
