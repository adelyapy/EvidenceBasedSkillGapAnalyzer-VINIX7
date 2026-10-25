# LOG PROMPT FRONTEND DEVELOPER 2 — BUKTIVA

## Dokumentasi Pekerjaan Frontend 22–25 Oktober 2026

**Proyek:** BUKTIVA — Evidence-Based Skill Gap Analyzer  
**Peran:** Frontend Developer 2  
**Periode dokumentasi:** Kamis, 22 Oktober 2026 sampai Minggu, 25 Oktober 2026  
**Branch saat dokumentasi dibuat:** `frontend2-dev`  
**Teknologi:** Next.js App Router, React, TypeScript, CSS responsif, Supabase sebagai sumber data yang sudah tersedia  
**AI Assistant:** OpenAI Codex

---

## 1. Tujuan Dokumentasi

Dokumen ini mencatat penggunaan prompt AI selama penyempurnaan frontend BUKTIVA. Fokus pekerjaan meliputi konsistensi desain neobrutalisme, responsivitas, aksesibilitas, loading/empty/error state, navigasi Workspace, autentikasi, Dashboard, Profile, alur Analisa Baru, Hasil Analisis, dan Riwayat Analisis.

Dokumen disusun berdasarkan:

- riwayat percakapan dan permintaan implementasi;
- commit Frontend Developer 2 pada 23–25 Oktober 2026;
- kondisi working tree pada 25 Oktober 2026;
- pemeriksaan file frontend yang benar-benar digunakan aplikasi.

Prompt di bawah merupakan rekonstruksi terstruktur dari instruksi kerja. Dokumen ini tidak mengklaim setiap kalimat sebagai kutipan verbatim percakapan. Status implementasi dibedakan antara pekerjaan yang sudah tercatat dalam commit dan pekerjaan lokal yang belum di-commit.

---

## 2. Pola Prompt Berdasarkan Ketentuan Pengerjaan

Ketentuan pada referensi diterapkan sebagai tiga aturan utama berikut.

### 2.1 Kunci Visualnya Dulu

Setiap prompt diawali dengan batasan visual agar perubahan fitur tidak merusak desain yang sudah stabil.

Contoh instruksi:

> Pertahankan seluruh class styling, palet warna, tipografi, border, hard shadow, layout, dan interaksi yang sudah berfungsi. Ubah hanya komponen yang disebutkan. Jangan melakukan redesign bebas dan jangan menyentuh backend atau AI.

Penerapan pada BUKTIVA:

- mempertahankan palet krem, biru, biru muda, kuning, dan navy;
- mempertahankan border tegas dan hard shadow neobrutalisme;
- tidak membuat Navbar, Sidebar, dialog, atau halaman duplikat;
- menjaga struktur Next.js App Router yang sudah tersedia;
- mengisolasi selector CSS per halaman agar perubahan tidak bocor ke halaman lain.

### 2.2 Kerjakan Bertahap

Perubahan dipecah berdasarkan satu masalah atau satu kelompok komponen yang saling berkaitan.

Urutan kerja yang digunakan:

1. audit file dan komponen aktif;
2. identifikasi penyebab masalah;
3. ubah komponen frontend yang paling kecil cakupannya;
4. perbaiki CSS yang terkait langsung;
5. jalankan ESLint, TypeScript, dan `git diff --check`;
6. lanjut ke kebutuhan berikutnya setelah hasil sebelumnya stabil.

Cara ini digunakan pada pekerjaan autentikasi, Navbar Workspace, toast, dialog, empty state Dashboard, skeleton, Profile, alur Analisa Baru, Hasil Analisis, dan Riwayat Analisis.

### 2.3 Cek Layar HP dan Responsivitas

Setiap komponen baru diarahkan untuk tetap terbaca pada desktop, tablet, dan mobile.

Checklist responsivitas:

- tidak terjadi horizontal overflow;
- tombol tetap memiliki area sentuh yang nyaman;
- heading dan nama pengguna tidak terpotong;
- Sidebar mobile, hamburger, dan profil Navbar tidak bertumpuk;
- grid kartu berubah menjadi dua atau satu kolom bila ruang tidak cukup;
- dialog dan error state tetap dapat digunakan pada layar sempit;
- animasi menghormati `prefers-reduced-motion`.

---

## 3. Batasan Pekerjaan

Seluruh prompt frontend menggunakan batasan berikut:

- tidak mengubah schema atau migration database;
- tidak mengubah API route;
- tidak mengubah pipeline, model, prompt, atau evaluasi AI;
- tidak mengubah environment variable;
- tidak menjalankan migration database;
- tidak mengubah kontrak data backend tanpa koordinasi;
- tidak melakukan staging, commit, push, merge, reset, atau pergantian branch secara otomatis;
- query frontend hanya membaca struktur data yang sudah tersedia bila dibutuhkan untuk menampilkan UI;
- status berhasil tidak diklaim tanpa pengujian yang benar-benar dijalankan.

---

# 4. Kronologi Prompt dan Hasil Implementasi

## Kamis, 22 Oktober 2026

### Prompt 01 — Audit Visual dan Struktur Landing Page

**Tujuan:** memahami komponen Landing aktif sebelum melakukan perubahan UI.

**Rekonstruksi prompt:**

> Audit `src/app/page.tsx`, komponen Landing, data Landing, CSS, dan aset yang digunakan. Pertahankan Navbar, navigasi, Scroll Spy, hamburger, route, serta identitas neobrutalisme. Identifikasi komponen yang dapat digunakan kembali dan jangan membuat duplikasi.

**Hasil:**

- struktur Hero, About, How It Works, Team, dan Footer diperiksa sebagai satu sistem Landing;
- perubahan diarahkan hanya ke komponen aktif dan CSS terkait;
- prinsip desain dikunci pada tipografi tebal, warna krem/biru/navy/kuning, border tegas, serta hard shadow;
- perubahan dekoratif yang tidak memiliki fungsi dihindari.

**Catatan bukti:** tidak ditemukan commit Frontend Developer 2 pada 22 Oktober 2026. Bagian ini mencatat tahap audit dan perencanaan dari percakapan, bukan commit tersendiri.

---

### Prompt 02 — Penyederhanaan Hero Landing

**Tujuan:** membersihkan Hero dari elemen yang tidak lagi diperlukan.

**Rekonstruksi prompt:**

> Pertahankan komposisi Hero dan Navbar yang sudah ada. Hapus indikator scroll, keterangan simulasi yang mengganggu komposisi, dan panel tiga langkah jika sudah tidak dibutuhkan. Jangan mengubah section Landing lain.

**Hasil:**

- elemen Hero yang diminta dihapus tanpa mengganti Hero menjadi desain baru;
- CTA dan struktur utama tetap dipertahankan;
- panel ringkasan tiga langkah pada Hero dihapus agar tidak menduplikasi Cara Kerja;
- perubahan visual dibatasi pada Hero dan CSS terkait.

---

### Prompt 03 — Konsistensi Section Landing

**Tujuan:** menyelaraskan About, Cara Kerja, Team, dan Footer dengan identitas BUKTIVA.

**Rekonstruksi prompt:**

> Pertahankan Z-pattern, ilustrasi asli, data anggota, navigasi, dan struktur section. Gunakan kartu neobrutalisme yang konsisten, animasi masuk ringan, hover yang tidak memberikan affordance palsu, responsivitas mobile, dan reduced motion. Jangan menambahkan konten generik atau tautan palsu.

**Hasil:**

- aturan visual dan interaksi Landing terdokumentasi sebagai acuan;
- penggunaan ilustrasi asli, HTML semantik, dan data terpusat diprioritaskan;
- tautan yang tidak mempunyai tujuan valid tidak dibuat;
- responsivitas dan aksesibilitas dimasukkan sebagai kriteria setiap section.

---

## Jumat, 23 Oktober 2026

### Prompt 04 — Perbaikan Login, Register, dan Reset Password

**Tujuan:** merapikan halaman autentikasi tanpa mengubah autentikasi backend.

**Rekonstruksi prompt:**

> Pertahankan fungsi form dan animasi yang sudah ada. Atur ulang jarak kartu agar seimbang, perbaiki responsivitas, gunakan warna teks tombol yang kontras, tambahkan tombol kembali ke Beranda, hapus ilustrasi yang tidak diperlukan, dan hilangkan pesan global yang redundan. Jangan mengubah Supabase Auth.

**Hasil:**

- spacing kartu Login dan Register dirapikan;
- tombol kembali ke Beranda dibuat dengan tema neobrutalisme;
- ilustrasi Login dan Register yang diminta dihapus;
- teks manfaat Register yang tidak diperlukan dihapus;
- pesan peringatan global yang redundan dihilangkan tanpa menghapus validasi field;
- halaman Reset Password diselaraskan dengan halaman autentikasi lain.

**Commit terkait:** `0b6db1c` — `Feat(ui) : perbaiki Halaman register, login, landing`.

---

### Prompt 05 — Fitur Tampilkan/Sembunyikan Kata Sandi

**Tujuan:** memenuhi pola form password yang umum dan mudah dikenali.

**Rekonstruksi prompt:**

> Tambahkan ikon mata pada field password Login, Register, konfirmasi password, dan form pembaruan password. Ikon harus berupa tombol yang dapat diakses keyboard, memiliki label aksesibilitas, dan tidak mengubah proses autentikasi.

**Hasil:**

- kontrol show/hide password ditambahkan pada field terkait;
- tipe input dapat berganti antara `password` dan `text`;
- fungsi hanya mengelola state presentasi frontend;
- area tombol dan fokus keyboard diperhatikan.

---

### Prompt 06 — Navbar dan Kontrol Sidebar Workspace

**Tujuan:** memindahkan kontrol minimize Sidebar ke Navbar dan memperbaiki animasinya.

**Rekonstruksi prompt:**

> Hapus ikon minimize yang menempel pada logo Sidebar. Pertahankan satu kontrol pada Navbar, pulihkan fungsi collapse/expand, dan buat transisi lebar Sidebar serta posisi Header lebih halus. Jangan mengubah halaman Workspace lain.

**Hasil:**

- kontrol collapse dipusatkan pada Workspace Header;
- ikon ganda di area logo dihapus;
- state collapse dikelola oleh Workspace Shell;
- perpindahan lebar Sidebar dan offset Header dibuat lebih halus.

**Commit terkait:** `c6c1bfc` — `feat(ui) : memperbaiki navbar dashboard`.

---

### Prompt 07 — Profil Navbar Dinamis dan Dropdown Neobrutalisme

**Tujuan:** membuat informasi pengguna dan menu profil konsisten dengan keadaan aplikasi.

**Rekonstruksi prompt:**

> Hapus ikon notifikasi yang tidak digunakan. Gunakan nama pengguna yang login, avatar default bila foto belum tersedia, dan desain dropdown profil dengan neobrutalisme BUKTIVA. Tampilkan hanya menu yang valid di proyek dan jangan membuat tautan palsu.

**Hasil:**

- ikon notifikasi dihapus;
- nama pengguna Navbar mengambil data profil yang tersedia;
- avatar memiliki fallback default;
- dropdown profil menggunakan border, warna, section divider, hover, dan focus-visible yang konsisten;
- menu disesuaikan dengan route yang benar-benar tersedia.

---

### Prompt 08 — Responsivitas Navbar Mobile

**Tujuan:** mencegah hamburger dan area profil bertumpuk pada layar HP.

**Rekonstruksi prompt:**

> Audit Header Workspace pada viewport mobile. Pisahkan posisi hamburger dan profil, batasi lebar nama pengguna, pertahankan dropdown, dan pastikan tidak ada overflow horizontal.

**Hasil:**

- susunan Header mobile diperbaiki;
- hamburger dan profil mempunyai ruang masing-masing;
- teks nama/role menyesuaikan ruang yang tersedia;
- interaksi Sidebar mobile tetap dipertahankan.

---

### Prompt 09 — Dialog Registrasi dan Loading Workspace

**Tujuan:** memberikan feedback yang jelas setelah pendaftaran dan saat Workspace disiapkan.

**Rekonstruksi prompt:**

> Setelah pendaftaran berhasil, tampilkan dialog yang meminta pengguna memeriksa email dan masuk melalui tautan verifikasi. Gunakan tema neobrutalisme, animasi masuk/keluar yang halus, fokus keyboard, dan reduced motion. Untuk loading Workspace, hilangkan card besar bila tampil terlalu berat dan pertahankan indikator sederhana.

**Hasil:**

- `RegistrationSuccessDialog` ditambahkan;
- pesan verifikasi email dibuat jelas dan tidak mengklaim verifikasi sebelum terjadi;
- tombol dialog mengikuti gaya neobrutalisme;
- transisi dialog dan loading diselaraskan;
- loading Workspace disederhanakan sesuai umpan balik visual.

**Commit terkait:** `f40818d` — `feat(frontend): tingkatkan alur autentikasi dan dialog neobrutalisme`.

---

## Sabtu, 24 Oktober 2026

### Prompt 10 — Animasi Toast dan Alert Dialog

**Tujuan:** menghilangkan kesan kaku ketika notifikasi atau dialog ditutup.

**Rekonstruksi prompt:**

> Audit seluruh toast notification dan alert dialog frontend. Pertahankan posisi, pesan, serta perilaku yang sudah ada, tetapi tambahkan fase closing agar opacity dan transform selesai sebelum komponen dilepas dari DOM. Gunakan reduced motion dan jangan menambah dependency animasi.

**Hasil:**

- hook animasi dismiss bersama digunakan untuk mengatur fase keluar;
- toast dan dialog tidak langsung menghilang dari DOM;
- durasi masuk dan keluar dibuat singkat serta konsisten;
- reduced motion dipertahankan;
- kartu dialog mengikuti neobrutalisme BUKTIVA.

---

### Prompt 11 — Panduan Dashboard dalam Dialog

**Tujuan:** mengganti navigasi “Lihat panduan” dengan bantuan kontekstual di Dashboard.

**Rekonstruksi prompt:**

> Saat tombol Lihat panduan diklik, jangan pindah ke Landing. Tampilkan dialog berisi alur penggunaan BUKTIVA, langkah yang dapat dilakukan pengguna, tombol tutup yang jelas, fokus keyboard, dan animasi halus. Terapkan 10 heuristik Nielsen secara relevan.

**Hasil:**

- `DashboardGuideDialog` dibuat;
- panduan menjelaskan alur tambah proyek, target role, validasi, hasil, dan riwayat;
- pengguna dapat menutup dialog melalui kontrol yang jelas;
- dialog menggunakan focus-visible, overlay, struktur heading, dan reduced motion.

---

### Prompt 12 — Empty State Dashboard dan Riwayat

**Tujuan:** menyamakan empty state agar tidak terlihat seperti teks biasa.

**Rekonstruksi prompt:**

> Gunakan satu pola empty state neobrutalisme untuk Ringkasan Analisis Terbaru, Rekomendasi Selanjutnya, dan Riwayat Analisis Terbaru. Sesuaikan ikon, judul, deskripsi, dan CTA dengan konteks masing-masing. Buat juga empty state halaman Riwayat Analisis dan pastikan CTA berwarna kontras.

**Hasil:**

- `DashboardEmptyState` dibuat sebagai komponen bersama;
- tiga panel Dashboard memakai pola border dashed, ikon, judul, deskripsi, dan CTA yang konsisten;
- teks serta ikon CTA dibuat putih pada tombol biru;
- halaman Riwayat Analisis memperoleh empty state sesuai konteks;
- tidak ada tombol yang dibuat jika tujuannya tidak valid.

---

### Prompt 13 — Skeleton Loading yang Konsisten

**Tujuan:** mengganti teks loading polos dengan skeleton yang mengikuti bentuk konten.

**Rekonstruksi prompt:**

> Gunakan skeleton hanya untuk loading nyata. Pertahankan layout Workspace, hindari delay buatan, gunakan pulse lembut, cegah layout shift, dan dukung reduced motion. Terapkan skeleton pada Dashboard, Profile, Riwayat, serta pertanyaan validasi pertama bila data masih menunggu.

**Hasil:**

- skeleton Dashboard, Profile, Riwayat, dan route Analisa Baru diselaraskan;
- `WorkspaceRouteSkeleton`, `ProfileSkeleton`, dan `ValidationQuestionSkeleton` digunakan sesuai konteks;
- ukuran skeleton mengikuti struktur konten tujuan;
- tidak ada `setTimeout` palsu untuk memaksa skeleton tampil;
- loading route tetap berada di dalam Workspace Layout.

---

### Prompt 14 — Profile Neobrutalisme dan Feedback Simpan

**Tujuan:** menyelaraskan halaman Profile dengan design system Workspace.

**Rekonstruksi prompt:**

> Identifikasi bagian Profile yang masih terlalu polos. Terapkan panel, badge, border, hard shadow, warna, tombol Edit, serta dialog simpan dengan neobrutalisme. Pertahankan data profil dan proses simpan yang sudah tersedia. Status sukses harus otomatis tertutup.

**Hasil:**

- header, kartu profil, detail akun, role badge, dan tombol Edit diselaraskan;
- tombol Batal dan Simpan Perubahan memperoleh hover/pressed state yang konsisten;
- feedback berhasil disimpan dapat tertutup otomatis;
- skeleton Profile menggantikan teks “Memuat profil...”;
- perubahan dibatasi pada frontend.

---

### Prompt 15 — Analisa Baru, Upload Proyek, dan Review Input

**Tujuan:** menyelaraskan halaman Analisa Baru dengan neobrutalisme dan heuristik Nielsen.

**Rekonstruksi prompt:**

> Audit komponen Upload Proyek, stepper, tab sumber proyek, form URL/PDF, empty state, tips, pemeriksaan kelengkapan, dan tombol navigasi. Pertahankan alur data yang ada. Gunakan skeleton/fade yang sama dengan Workspace, hapus hover kuning pada stepper, dan hilangkan keterangan redundan.

**Hasil:**

- kartu input dan empty state dipertegas;
- stepper tidak lagi memakai hover kuning yang membingungkan;
- kalimat bantuan yang redundan dihapus;
- feedback URL kosong dipindahkan menjadi toast yang dapat hilang otomatis;
- pemeriksaan kelengkapan membedakan proyek wajib dan target role yang sudah dipilih;
- notifikasi tidak lagi mengatakan target role belum dipilih ketika hanya proyek yang hilang.

---

### Prompt 16 — Audit Delay Navigasi Sidebar

**Tujuan:** mencari penyebab perpindahan halaman Workspace terasa tertunda.

**Rekonstruksi prompt:**

> Audit navigasi Sidebar tanpa mengubah backend/AI. Periksa penggunaan anchor, Link, prefetch, loading route, layout server, dan query halaman. Jelaskan sebab-akibat dahulu, lalu terapkan perbaikan frontend yang aman.

**Hasil:**

- navigasi menggunakan mekanisme App Router;
- indikator pending ditambahkan agar pengguna memperoleh visibility of system status;
- route tujuan diprefetch sesuai perilaku Link;
- skeleton route memberi feedback segera selama halaman dinamis menunggu server;
- Sidebar mobile menutup dengan benar setelah navigasi.

**Catatan commit:** pekerjaan Sabtu malam tercakup dalam commit dini hari 25 Oktober 2026.

---

## Minggu, 25 Oktober 2026

### Prompt 17 — Konsistensi Workspace dan State Antarmuka

**Tujuan:** menyatukan skeleton, empty state, toast, panduan, dan responsivitas Workspace.

**Rekonstruksi prompt:**

> Satukan pola loading, empty state, toast, dan dialog pada halaman Workspace. Pertahankan data serta route yang ada. Pastikan komponen muncul dengan fade ringan, keluar dengan halus, memiliki focus-visible, dan tetap terbaca di mobile.

**Hasil:**

- komponen state bersama digunakan pada Dashboard dan Workspace;
- Profile, Riwayat, Dashboard, serta alur Analisa Baru mempunyai loading yang lebih konsisten;
- animasi dan reduced motion diselaraskan;
- empty state memakai copy yang sesuai konteks fitur.

**Commit terkait:** `0ef99af` — `feat(frontend): tingkatkan konsistensi UI dan UX workspace`.

---

### Prompt 18 — Sinkronisasi Nama dan Avatar Navbar

**Tujuan:** memperbarui nama dan foto Navbar segera setelah Profile disimpan.

**Rekonstruksi prompt:**

> Setelah pengguna mengganti nama atau foto profil, perbarui informasi Navbar secara realtime pada sisi frontend. Gunakan data hasil simpan yang sudah tersedia, pertahankan avatar fallback, dan jangan mengubah endpoint maupun tabel backend.

**Hasil:**

- event pembaruan profil Workspace digunakan untuk menyampaikan nama dan avatar;
- `WorkspaceShell` menyimpan override presentasi terbaru;
- `WorkspaceHeader` menerima nama dan avatar terbaru tanpa menunggu reload penuh;
- avatar default tetap digunakan jika URL tidak tersedia.

---

### Prompt 19 — Ringkasan Analisis Terbaru dan Navigasi Hasil

**Tujuan:** memastikan tombol “Lihat hasil lengkap” membuka analisis yang benar.

**Rekonstruksi prompt:**

> Perbaiki tombol Lihat hasil lengkap agar membawa ID analisis terbaru ke halaman hasil. Jangan membuat data dummy atau mengubah API. Tampilkan error state yang jujur jika ID tidak valid atau data tidak dapat diakses.

**Hasil:**

- route hasil memperoleh parameter analisis yang dipilih;
- tombol Dashboard dan Riwayat membuka data yang sesuai;
- loading hasil analisis dibuat lebih representatif terhadap struktur halaman;
- error state tetap menyediakan jalan kembali ke Dashboard.

---

### Prompt 20 — Integrasi Data Ringkasan Dashboard

**Tujuan:** menampilkan kemampuan unggul dan area pengembangan berdasarkan hasil analisis terakhir.

**Rekonstruksi prompt:**

> Pada Ringkasan Analisis Terbaru, tampilkan kemampuan unggul dan area pengembangan sebagai poin-poin dari data hasil analisis yang sudah tersedia. Jangan menambah penjelasan buatan, jangan mengubah backend/AI, dan pertahankan empty state jika data belum ada.

**Hasil:**

- kemampuan unggul diturunkan dari skill yang memenuhi kebutuhan role;
- area pengembangan diturunkan dari skill gap yang masih tersedia;
- data ditampilkan sebagai poin ringkas;
- fallback tetap menjelaskan ketika data belum tersimpan.

---

### Prompt 21 — Rekomendasi Selanjutnya Berdasarkan Analisis Terbaru

**Tujuan:** menampilkan roadmap/rekomendasi yang terkait dengan analisis completed terbaru.

**Rekonstruksi prompt:**

> Ambil rekomendasi dari roadmap analisis completed terbaru milik pengguna. Pastikan komponen memperbarui tampilan ketika data baru tersedia, tidak memakai rekomendasi analisis lama, dan tetap mempunyai empty state yang jujur. Jangan mengubah generator roadmap atau backend.

**Hasil:**

- rekomendasi dikaitkan dengan analisis completed terbaru;
- sinkronisasi frontend memperbarui tampilan saat data terkait berubah;
- empty state membedakan belum ada analisis dengan roadmap yang belum tersimpan;
- baris `Status: not_started` dan badge “Belum Dimulai” dihapus dari presentasi;
- badge prioritas tetap ditampilkan.

---

### Prompt 22 — Skill Gap dan Roadmap pada Hasil Analisis

**Tujuan:** melengkapi halaman hasil dengan persentase kompetensi dan roadmap pengembangan.

**Rekonstruksi prompt:**

> Di bawah Kesenjangan Keterampilan, tampilkan persentase penguasaan skill dan roadmap pengembangan dari data analisis yang tersedia. Pertahankan desain neobrutalisme, gunakan progress bar yang aksesibel, urutkan roadmap, dan jangan mengubah AI atau backend.

**Hasil:**

- panel persentase skill ditambahkan;
- persentase dihitung untuk presentasi berdasarkan level saat ini dan level kebutuhan;
- roadmap menampilkan nomor langkah, judul, deskripsi, prioritas, dan sumber bila tersedia;
- label “Keyakinan AI” diganti menjadi “Hasil Persentase Kompetensi” sesuai kebutuhan UI;
- loading dan empty state dipertahankan bila data belum tersedia.

---

### Prompt 23 — Skill Gap dan Roadmap pada Detail Riwayat

**Tujuan:** memberikan detail yang sama ketika pengguna membuka riwayat analisis lama.

**Rekonstruksi prompt:**

> Di bawah Fokus Pengembangan pada detail Riwayat Analisis, tambahkan skill gap, persentase kompetensi, dan roadmap sesuai data analisis yang dipilih. Jangan mencampurkan data analisis lain dan jangan menyentuh backend/AI.

**Hasil:**

- tipe riwayat diperluas agar dapat membawa roadmap;
- data roadmap dipetakan per `analysis_id`;
- detail riwayat menampilkan progress skill dan langkah roadmap;
- empty state muncul jika analisis lama belum memiliki data tersebut;
- badge status roadmap yang tidak diperlukan dihapus agar kartu lebih ringkas.

---

### Prompt 24 — Status Riwayat Analisis

**Tujuan:** membedakan status gagal, draft, dan selesai secara visual.

**Rekonstruksi prompt:**

> Jangan gunakan warna hijau untuk seluruh status. Buat pemetaan status yang semantik: selesai, draft, gagal, atau status lain. Pertahankan kartu dan data yang ada serta pastikan label mudah dibaca.

**Hasil:**

- label status dipusatkan pada helper frontend;
- warna kartu dan ikon mengikuti arti status;
- status gagal tidak lagi terlihat seperti selesai;
- tampilan Dashboard dan Riwayat dibuat lebih konsisten.

---

### Prompt 25 — Menonaktifkan Halaman Dummy Skill Gap dan Roadmap

**Tujuan:** mencegah pengguna menganggap dua halaman dummy sebagai hasil aktual.

**Rekonstruksi prompt:**

> Route Skill Gap Report dan Roadmap lama berisi data dummy dan tidak dipakai. Pertahankan URL agar tidak 404, tetapi ganti isinya dengan error state neobrutalisme yang menjelaskan fitur belum tersedia serta tombol kembali ke Dashboard. Jangan mengubah backend/AI.

**Hasil:**

- kedua route tidak lagi menampilkan data dummy;
- komponen `UnavailableAnalysisFeature` digunakan bersama;
- error state mempunyai heading, penjelasan, notice, dan CTA Dashboard;
- metadata halaman diperbarui;
- tampilan responsif dan mendukung reduced motion.

---

### Prompt 26 — Penyempurnaan Copy dan Informasi UI

**Tujuan:** menghapus informasi teknis yang tidak diperlukan pengguna.

**Rekonstruksi prompt:**

> Hapus teks status internal seperti `Status: not_started` dan badge “Belum Dimulai”. Pertahankan prioritas roadmap. Ubah label “Keyakinan AI” menjadi “Hasil Persentase Kompetensi” pada hasil dan detail riwayat tanpa mengubah nilai datanya.

**Hasil:**

- status internal roadmap tidak lagi ditampilkan;
- kartu lebih ringkas dan fokus pada rekomendasi;
- label persentase diseragamkan pada Hasil Analisis dan Riwayat;
- data asli tidak dimodifikasi.

---

# 5. Penerapan 10 Heuristik Nielsen

Heuristik digunakan sebagai pedoman, bukan alasan untuk menambah fitur yang tidak diperlukan.

1. **Visibility of System Status** — skeleton, indikator pending Sidebar, toast, status tombol, dan progress analisis.
2. **Match Between System and the Real World** — istilah proyek, target role, skill gap, rekomendasi, dan riwayat menggunakan bahasa pengguna.
3. **User Control and Freedom** — tombol kembali, tombol tutup dialog, navigasi Dashboard, serta tidak memakai redirect otomatis pada error state.
4. **Consistency and Standards** — palet, border, hard shadow, tombol, dialog, toast, dan empty state menggunakan pola yang sama.
5. **Error Prevention** — validasi proyek wajib, target role, URL, tautan valid, serta halaman dummy tidak lagi ditampilkan sebagai data nyata.
6. **Recognition Rather Than Recall** — stepper, label field, ikon sumber proyek, ringkasan, dan kartu detail menampilkan konteks langsung.
7. **Flexibility and Efficiency of Use** — dukungan keyboard, mouse, touch, mobile, dan navigasi App Router.
8. **Aesthetic and Minimalist Design** — elemen redundan, ilustrasi yang tidak diperlukan, dan status internal dihapus.
9. **Help Users Recognize, Diagnose, and Recover from Errors** — toast serta error state menjelaskan kondisi dan menyediakan aksi pemulihan.
10. **Help and Documentation** — dialog Panduan Dashboard memberi petunjuk tanpa memaksa pengguna meninggalkan halaman.

---

# 6. Bukti Commit Frontend Developer 2

| Tanggal | Commit | Ringkasan |
|---|---|---|
| 23 Oktober 2026 | `0b6db1c` | Perbaikan Login, Register, Landing, field autentikasi, dan CSS terkait |
| 23 Oktober 2026 | `c6c1bfc` | Perbaikan Navbar Dashboard, Workspace Header, Shell, Sidebar, dan responsivitas |
| 23 Oktober 2026 | `f40818d` | Penyempurnaan autentikasi, dialog registrasi, update password, dan loading Workspace |
| 25 Oktober 2026 | `0ef99af` | Konsistensi UI/UX Workspace, skeleton, empty state, toast, Profile, Dashboard, Riwayat, dan Analisa Baru |

**Catatan:** perubahan setelah `0ef99af` masih berada pada working tree ketika dokumen ini dibuat. Dokumen tidak menyatakan perubahan lokal tersebut sudah di-commit.

---

# 7. Area Frontend yang Terdampak

## Landing dan Autentikasi

- Hero Landing;
- Login;
- Register;
- Reset Password dan Update Password;
- dialog verifikasi email;
- field password dan kontrol visibility.

## Workspace

- Workspace Header;
- Workspace Sidebar;
- dropdown profil;
- navigasi mobile;
- loading route dan skeleton bersama;
- sinkronisasi nama/avatar pada Navbar.

## Dashboard

- Hero dan dialog panduan;
- statistik dan skeleton;
- Ringkasan Analisis Terbaru;
- Rekomendasi Selanjutnya;
- Riwayat Analisis Terbaru;
- empty state bersama;
- navigasi ke hasil analisis yang tepat.

## Analisa Baru dan Hasil

- Upload Proyek;
- Upload CV;
- Review Input;
- stepper;
- toast validasi;
- skeleton Pertanyaan Validasi;
- loading Hasil Analisis;
- evaluasi kompetensi;
- skill gap dan persentase penguasaan;
- roadmap pengembangan;
- error state halaman dummy.

## Riwayat dan Profile

- filter dan daftar Riwayat;
- empty state Riwayat;
- detail hasil, skill gap, dan roadmap;
- pemetaan status analisis;
- skeleton Profile;
- desain Profile;
- dialog Edit Profile;
- sinkronisasi nama dan avatar.

---

# 8. Validasi yang Digunakan

Perintah yang digunakan sesuai cakupan perubahan:

```bash
npm run lint
npx eslint --no-cache <file-yang-diubah>
npx tsc --noEmit --incremental false
npm run build
git diff --check
```

Status yang dapat dinyatakan berdasarkan pemeriksaan terbaru:

- ESLint pada file terkait perubahan terakhir: lulus;
- TypeScript `--noEmit --incremental false`: lulus;
- `git diff --check`: lulus;
- pemeriksaan status path `src/app/api`, `src/lib`, dan `supabase`: tidak menunjukkan perubahan dari pekerjaan frontend terakhir;
- build penuh dan regresi browser seluruh route harus dijalankan ulang sebelum rilis atau merge karena working tree masih berubah;
- error dependency/provider AI, bila muncul saat build, harus dicatat terpisah dan tidak diperbaiki melalui perubahan frontend yang tidak terkait.

---

# 9. Checklist Sebelum Commit Berikutnya

- [ ] Tinjau seluruh perubahan lokal dan pisahkan perubahan milik anggota tim.
- [ ] Pastikan tidak ada file backend, AI, Supabase, atau `.env` yang ikut berubah.
- [ ] Jalankan ESLint pada seluruh file frontend yang diubah.
- [ ] Jalankan TypeScript tanpa emit.
- [ ] Jalankan build setelah dependency proyek lengkap.
- [ ] Uji Dashboard, Analisa Baru, Hasil Analisis, Riwayat, dan Profile pada desktop.
- [ ] Uji Navbar, Sidebar, dialog, toast, serta form pada mobile.
- [ ] Uji keyboard navigation dan focus-visible.
- [ ] Uji `prefers-reduced-motion`.
- [ ] Pastikan empty state dan error state memiliki jalan pemulihan yang valid.
- [ ] Pastikan tidak ada data dummy yang ditampilkan sebagai data pengguna nyata.
- [ ] Jalankan `git diff --check`.
- [ ] Jangan commit atau push sebelum review perubahan selesai.

---

# 10. Kesimpulan

Pekerjaan Frontend Developer 2 selama 22–25 Oktober 2026 berfokus pada konsistensi pengalaman pengguna BUKTIVA. Strategi prompting mengikuti tiga prinsip utama: mengunci desain yang sudah stabil, mengerjakan perubahan secara bertahap, dan memeriksa responsivitas. Hasil utama mencakup perbaikan autentikasi, Navbar dan Sidebar Workspace, animasi toast/dialog, loading skeleton, empty/error state, Dashboard, Profile, Analisa Baru, Hasil Analisis, serta Riwayat Analisis.

Seluruh implementasi diarahkan untuk tetap berada pada lapisan frontend. Integrasi data yang ditampilkan menggunakan sumber dan kontrak yang sudah tersedia, tanpa mengubah backend, database, atau pipeline AI.
