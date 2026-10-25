# LOG PROMPT FRONTEND DEVELOPER — BUKTIVA
## Dokumentasi Terpadu Modul 6 dan Modul 8

**Proyek:** BUKTIVA — Evidence-Based Skill Gap Analyzer  
**Peran:** Frontend Developer  1
**Dokumentasi:** Penggunaan prompt AI untuk konversi desain HTML5 dan pengembangan antarmuka frontend

## Pengantar Dokumen Terpadu

Dokumen ini menggabungkan dua log prompt pengembangan frontend BUKTIVA, yaitu **Modul 6 — Konversi Desain Figma ke HTML5** dan **Modul 8 — Pengembangan serta penyempurnaan antarmuka frontend**. Keduanya disatukan dalam satu dokumen agar alur pekerjaan dapat dibaca secara berurutan.

Kedua modul memiliki fokus dan batasan yang berbeda:
- **Modul 6:** berfokus pada pembentukan struktur HTML5 semantik dari desain Figma. Pada tahap ini, HTML dibuat tanpa CSS, inline style, framework visual, atau JavaScript sesuai batasan tugas modul.
- **Modul 8:** mendokumentasikan tahap pengembangan frontend yang lebih lanjut, termasuk styling dan konsistensi visual, responsivitas, interaksi UI, loading/empty/error states, komponen bersama, serta pemeriksaan TypeScript dan ESLint.

Dengan demikian, ketentuan **tanpa CSS** pada Modul 6 berlaku khusus untuk tahap konversi HTML5 dan bukan berarti keseluruhan aplikasi BUKTIVA tidak menggunakan CSS. Pada tahap frontend berikutnya, styling diterapkan mengikuti teknologi dan struktur proyek yang digunakan.

Prompt di dalam dokumen ini dipertahankan berdasarkan kedua dokumen sumber. Bagian Modul 8 menyatakan bahwa prompt merupakan rekonstruksi dari catatan implementasi, sehingga tidak diklaim sebagai kutipan verbatim seluruh riwayat percakapan AI. Status implementasi dan hasil validasi tetap perlu dicocokkan dengan kode terbaru sebelum dokumen diserahkan.

---

# BAGIAN I — MODUL 6: KONVERSI DESAIN FIGMA KE HTML5

## Informasi Proyek

- **Proyek:** BUKTIVA — Evidence-Based Skill Gap Analyzer
- **Modul:** Modul 6 — Konversi Desain Figma ke HTML5
- **Tujuan:** Mengubah desain Figma menjadi halaman HTML5 murni yang semantik, valid standar W3C, mudah dibaca, dan mempertahankan user flow.
- **Batasan utama:** Tidak menggunakan CSS, tag `<style>`, inline style, framework visual, Tailwind, atau Bootstrap.
- **Struktur file:** Satu file HTML untuk satu halaman desain UI.
- **Aset:** Menggunakan jalur relatif `./assets/images/`.

Dokumentasi ini mencatat proses generate kode HTML, audit manual, perbaikan syntax, dan validasi.

---

## 1. Prompt Awal — Konversi Desain UI Figma ke HTML

### Tujuan
Membuat struktur HTML berdasarkan desain UI BUKTIVA yang telah dibuat pada Figma.

### Prompt

> Konversikan desain UI Figma BUKTIVA menjadi HTML5 murni. Gunakan struktur HTML semantik seperti `header`, `nav`, `main`, `section`, `article`, dan elemen lain sesuai fungsi konten. Jangan gunakan CSS, `<style>`, inline style, Tailwind, Bootstrap, maupun JavaScript. Pertahankan urutan informasi, teks, navigasi, gambar, form, tabel, dan user flow sesuai prototype. Gunakan aset melalui `./assets/images/` serta tambahkan atribut `alt` pada gambar.

### Audit

Kode awal diperiksa terhadap:
- Struktur halaman.
- Kesesuaian alur prototype.
- Penggunaan elemen HTML5.
- Penggunaan gambar dan atribut alt.
- Kelengkapan form dan tabel.

---

## 2. Prompt — Refaktor Struktur HTML

### Prompt

> Audit kode HTML berikut. Jangan mengubah desain atau urutan informasi. Bersihkan syntax yang tidak valid, hapus atribut HTML usang, perbaiki tag yang tidak tertutup, dan pertahankan struktur halaman. Pastikan HTML mengikuti standar HTML5 serta dapat lolos W3C Validator tanpa error.

### Hasil Refaktor

- Atribut HTML lama yang tidak sesuai standar dihapus.
- Tag yang tidak berpasangan diperbaiki.
- Struktur heading dan landmark tetap dipertahankan.
- Struktur halaman tetap satu file HTML untuk satu desain UI.

---

## 3. Prompt — Audit Form dan Input

### Prompt

> Periksa seluruh elemen form pada halaman HTML. Pastikan setiap input memiliki hubungan dengan label menggunakan `for` dan `id`. Gunakan elemen HTML form standar seperti `form`, `fieldset`, `legend`, `label`, `input`, dan `button` apabila diperlukan. Jangan menambahkan CSS.

### Hasil

- Relasi label dan input diperiksa.
- Input file menggunakan label yang sesuai.
- Struktur form tetap mengikuti desain Figma.

---

## 4. Prompt — Audit Media dan Aset

### Prompt

> Periksa seluruh penggunaan gambar pada HTML. Pastikan semua gambar menggunakan jalur relatif `./assets/images/`. Tambahkan teks alternatif yang menjelaskan fungsi gambar. Jangan gunakan base64 atau jalur absolut.

### Hasil

- Seluruh gambar menggunakan path relatif.
- Gambar informatif memiliki atribut `alt`.
- Nama aset dipertahankan sesuai folder proyek.

---

## 5. Prompt — Validasi W3C

### Prompt

> Periksa kode HTML ini agar dapat lolos HTML Validator W3C. Temukan error syntax, atribut yang tidak sesuai standar, tag yang tidak tertutup, serta struktur HTML yang salah. Perbaiki hanya bagian yang menyebabkan error tanpa mengubah struktur desain.

### Hasil Validasi

Perbaikan dilakukan pada:
- Penghapusan atribut usang.
- Perbaikan penutupan tag.
- Pembersihan syntax HTML.
- Pemeriksaan struktur dokumen.

Target akhir:
- HTML valid standar W3C.
- Tidak menggunakan CSS.
- Struktur tetap sesuai prototype.

---

## 6. Strategi Iterasi

1. Generate — membuat HTML awal dari desain Figma.
2. Audit — mengecek struktur, aset, form, dan user flow.
3. Refaktor — memperbaiki syntax dan membersihkan kode.
4. Validasi — memastikan HTML sesuai standar W3C.

---

## 7. Checklist Akhir Modul 6

- [x] HTML5 murni.
- [x] Tidak menggunakan file CSS.
- [x] Tidak menggunakan tag style.
- [x] Tidak menggunakan inline style.
- [x] Struktur halaman mengikuti desain Figma.
- [x] Gambar menggunakan atribut alt.
- [x] Form menggunakan struktur HTML yang sesuai.
- [x] Syntax diperiksa untuk W3C Validator.

---

# BAGIAN II — MODUL 8: PENGEMBANGAN DAN PENYEMPURNAAN FRONTEND

**Periode:** Oktober 2026  
**Posisi:** Frontend Developer 1 
**Proyek:** BUKTIVA — Evidence-Based Skill Gap Analyzer  
**AI Assistant:** ChatGPT dan OpenAI Codex  
**Teknologi yang tercatat:** Next.js, TypeScript, komponen UI frontend, browser APIs, `sessionStorage`, ESLint, dan TypeScript checks

---

## A. Pendahuluan

Log prompt ini mendokumentasikan penggunaan AI Assistant sebagai alat bantu selama pengembangan dan penyempurnaan antarmuka frontend proyek BUKTIVA. Dokumentasi berfokus pada halaman yang dikerjakan, kebutuhan UI/UX, interaksi browser, status tampilan, responsivitas, serta konsistensi desain.

BUKTIVA merupakan aplikasi *Evidence-Based Skill Gap Analyzer* yang membantu pengguna menyiapkan bukti proyek, menjawab lima pertanyaan validasi, dan melihat hasil analisis kompetensi serta kesenjangan keterampilan. Dalam proyek ini, pekerjaan frontend mencakup tampilan dan alur pengguna dari landing page hingga halaman analisis dan review input.

Ruang lingkup pekerjaan saya adalah frontend. Perubahan pada backend, Supabase, struktur database, schema, endpoint, dan AI engine bukan bagian dari implementasi frontend yang didokumentasikan di sini. Jika suatu fitur masih menggunakan penyimpanan lokal atau hanya menampilkan metadata, keterbatasan tersebut dicatat agar tidak dianggap sebagai integrasi backend yang sudah selesai.

Prompt pada dokumen ini merupakan rekonstruksi dokumentasi berdasarkan catatan implementasi frontend yang tersedia, bukan kutipan verbatim seluruh riwayat percakapan dengan AI Assistant. Status implementasi tetap perlu dicocokkan dengan kode terbaru sebelum laporan diserahkan.

---

## B. Dokumentasi Penggunaan Prompt AI

### Prompt 01 — Audit Awal dan Penetapan Ruang Lingkup Frontend

#### Tujuan
Memahami batas pekerjaan frontend dan menjaga agar perubahan UI tidak mengubah sistem backend maupun AI.

#### Instruksi prompt
> Tinjau struktur dan kebutuhan frontend BUKTIVA sebelum melakukan perubahan. Fokus pada tampilan, alur pengguna, responsivitas, interaksi browser, dan konsistensi komponen. Pertahankan integrasi yang sudah ada. Jangan mengubah backend, Supabase, schema database, endpoint, atau AI engine. Jelaskan perubahan frontend yang diperlukan dan lakukan secara bertahap.

#### Hasil penggunaan AI
- Ruang lingkup pekerjaan ditetapkan pada UI/UX dan interaksi frontend.
- Perubahan tampilan diarahkan agar tetap konsisten dengan gaya neobrutalisme aplikasi.
- Kebutuhan untuk memeriksa loading, empty state, error state, dan responsivitas dicatat.
- Batas antara tampilan frontend dan integrasi permanen backend diperjelas.

#### Evaluasi
Penetapan batas ini membantu mencegah perubahan antarmuka mengganggu kontrak API atau data yang menjadi tanggung jawab bagian backend dan AI Engineer.

**Status:** Menjadi acuan pekerjaan frontend.

---

### Prompt 02 — Penyempurnaan Landing Page

#### Tujuan
Menjaga landing page BUKTIVA agar memiliki hierarki informasi, navigasi, dan ajakan tindakan yang mudah dipahami pengguna.

#### Instruksi prompt
> Periksa landing page BUKTIVA dan rapikan hierarki visual serta susunan kontennya. Pertahankan identitas visual yang sudah ada, pastikan bagian navigasi dan CTA mudah ditemukan, dan jaga konsistensi gaya dengan halaman lain. Pastikan layout tetap responsif pada desktop maupun perangkat kecil. Jangan mengubah alur backend.

#### Hasil penggunaan AI
- Landing page menjadi bagian dari cakupan antarmuka yang diselaraskan dengan tampilan aplikasi.
- Struktur informasi dan navigasi diperlakukan sebagai pintu masuk menuju alur penggunaan BUKTIVA.
- Konsistensi visual dengan halaman autentikasi dan workspace dijadikan pertimbangan.

#### Evaluasi
Landing page berfungsi sebagai titik awal perjalanan pengguna. Validasi akhir tetap perlu dilakukan melalui browser pada ukuran layar yang berbeda.

**Status:** Dicatat sebagai bagian pekerjaan frontend; hasil akhir mengikuti kode terbaru.

---

### Prompt 03 — Halaman Register

#### Tujuan
Merapikan tampilan halaman pendaftaran agar konsisten dengan desain aplikasi dan nyaman digunakan.

#### Instruksi prompt
> Sesuaikan halaman Register BUKTIVA dengan gaya neobrutalisme aplikasi. Rapikan panel, formulir, input, tombol, badge/keterangan, ilustrasi, dan jarak antarelemen. Pertahankan fungsi form dan integrasi yang sudah tersedia. Buat tampilan responsif untuk desktop dan layar kecil tanpa mengubah backend atau aturan autentikasi.

#### Hasil penggunaan AI
- Badge dan keterangan halaman autentikasi diselaraskan dengan gaya neobrutalisme.
- Ukuran panel, kartu formulir, ilustrasi, input, dan jarak elemen dipadatkan agar lebih nyaman ditampilkan.
- Tampilan Register diselaraskan dengan Login dan Reset Password.

#### Evaluasi
Perubahan berfokus pada tampilan dan kenyamanan penggunaan. Keberhasilan pendaftaran tetap bergantung pada integrasi autentikasi yang tersedia, bukan semata-mata perubahan UI.

**Status:** Penyempurnaan tampilan tercatat; pengujian alur autentikasi mengikuti sistem yang tersedia.

---

### Prompt 04 — Halaman Reset Password

#### Tujuan
Menyelaraskan halaman Reset Password dengan halaman autentikasi lain dan membuat formulir lebih nyaman digunakan.

#### Instruksi prompt
> Rapikan halaman Reset Password BUKTIVA tanpa mengubah mekanisme autentikasi. Samakan gaya badge, panel, input, tombol, ilustrasi, dan jarak elemen dengan halaman Login serta Register. Pastikan tampilan responsif dan pesan yang tersedia mudah dipahami.

#### Hasil penggunaan AI
- Tampilan Reset Password diselaraskan dengan Login dan Register.
- Ukuran panel, kartu formulir, ilustrasi, input, dan jarak elemen dipadatkan.
- Gaya visual neobrutalisme dipertahankan pada halaman autentikasi.

#### Evaluasi
Pekerjaan ini meningkatkan konsistensi antarmuka. Pengiriman email reset dan pemrosesan kata sandi tidak diklaim sebagai pekerjaan frontend karena bergantung pada layanan autentikasi.

**Status:** Penyempurnaan UI tercatat.

---

### Prompt 05 — Responsivitas Halaman Autentikasi

#### Tujuan
Meningkatkan kenyamanan penggunaan Login, Register, dan Reset Password pada ukuran layar yang berbeda.

#### Instruksi prompt
> Audit responsivitas halaman Login, Register, dan Reset Password. Sesuaikan ukuran panel, kartu, ilustrasi, input, dan spacing agar tidak memakan ruang berlebihan di desktop serta tetap mudah digunakan pada perangkat kecil. Pertahankan fungsi form, gaya visual, dan hierarki informasi yang sudah ada.

#### Hasil penggunaan AI
- Ukuran panel dan kartu formulir dipadatkan.
- Ilustrasi, input, serta jarak antarelemen disesuaikan.
- Tampilan diarahkan agar lebih nyaman pada layar desktop dan tetap responsif pada layar kecil.

#### Evaluasi
Responsivitas perlu diperiksa pada beberapa lebar layar untuk memastikan tidak terjadi elemen terpotong, overflow, atau tombol yang sulit dijangkau.

**Status:** Perubahan responsivitas tercatat; pengujian lintas perangkat perlu mengikuti kode terbaru.

---

### Prompt 06 — Halaman Upload CV dan Bukti Proyek

#### Tujuan
Merapikan tampilan unggah bukti proyek dan menjaga agar informasi dokumen tetap terbaca ketika pengguna berpindah ke halaman review.

#### Instruksi prompt
> Rapikan halaman Upload Proyek/CV BUKTIVA agar pemilihan bukti proyek mudah dipahami. Pertahankan alur unggah yang tersedia, tampilkan metadata dokumen dengan jelas, dan pastikan pengguna dapat kembali untuk mengedit bukti tanpa kehilangan informasi yang sudah dimasukkan pada sesi. Jangan mengklaim isi dokumen telah dianalisis jika hanya metadata yang tersedia.

#### Hasil penggunaan AI
- Pesan hijau dan keterangan duplikat setelah memilih PDF dihapus agar antarmuka lebih ringkas.
- Metadata PDF berupa nama dan ukuran file diteruskan ke halaman Review Input.
- Metadata PDF yang tersimpan di sesi dipulihkan ketika pengguna kembali ke Upload Proyek melalui tombol Edit.
- LinkedIn URL ditambahkan sebagai bukti proyek opsional untuk pengalaman profesional, organisasi, sertifikat, atau portofolio nonteknis.
- Ikon sumber bukti dibuat sebagai komponen bersama untuk GitHub, portfolio, deployment, LinkedIn, dan PDF.
- Validasi serta tampilan URL dilakukan pada sisi frontend.

#### Evaluasi
Frontend menampilkan informasi dan metadata yang tersedia. Isi PDF belum dikirim ke server atau AI melalui pekerjaan UI yang tercatat, sedangkan pengambilan konten URL memerlukan layanan backend/AI.

**Status:** UI dan alur metadata frontend tercatat; pemrosesan isi dokumen/URL bukan klaim implementasi frontend.

---

### Prompt 07 — Halaman Pertanyaan Validasi 1–5

#### Tujuan
Membuat halaman pertanyaan validasi mudah dibaca dan menjaga alur pengguna dari pertanyaan pertama sampai pertanyaan kelima.

#### Instruksi prompt
> Rapikan halaman pertanyaan validasi BUKTIVA 1–5. Bedakan pertanyaan utama dari konteks bukti dan tips menjawab. Seimbangkan ukuran teks pertanyaan, pertahankan konsistensi komponen, dan pastikan tombol Selanjutnya serta Kembali memberikan umpan balik yang jelas. Jangan mengubah logika evaluasi AI atau kontrak backend.

#### Hasil penggunaan AI
- Area pertanyaan dan konteks bukti diperjelas agar mudah dibedakan.
- Ukuran teks pertanyaan diseimbangkan agar tetap menonjol dan konsisten.
- Visual ikon konteks bukti diperbaiki dan tips menjawab dijaga agar mudah dibaca.
- Loading BUKTIVA ditampilkan saat berpindah pertanyaan, lalu disederhanakan menjadi satu overlay yang konsisten.
- Teks loading dibedakan sesuai arah navigasi:
  - Selanjutnya: “Membuka pertanyaan selanjutnya”.
  - Kembali: “Membuka pertanyaan sebelumnya”.
- Stepper diperkecil dan langkah berikutnya dikunci sampai langkah sebelumnya selesai.
- Penanda aktif biru, latar biru, border, dan hard shadow kotak besar pada stepper dihapus agar sesuai template.

#### Evaluasi
Perubahan bertujuan membantu pengguna memahami posisi dan tindakan berikutnya. Validasi jawaban serta penilaian kompetensi tetap menjadi tanggung jawab logika aplikasi/backend/AI yang tersedia.

**Status:** Penyempurnaan UI dan UX pertanyaan tercatat.

---

### Prompt 08 — Loading Setelah Jawaban Terakhir

#### Tujuan
Memberi umpan balik ketika pengguna menyelesaikan pertanyaan terakhir dan aplikasi berpindah menuju hasil analisis.

#### Instruksi prompt
> Tambahkan status loading yang konsisten ketika jawaban terakhir disimpan dan pengguna diarahkan ke hasil analisis. Hindari layar kosong atau perpindahan mendadak. Gunakan skeleton atau overlay yang sesuai dengan desain BUKTIVA, dan jangan menampilkan status sukses sebelum proses yang mendasarinya memberikan respons.

#### Hasil penggunaan AI
- Skeleton dan loading ditambahkan ketika jawaban terakhir disimpan sebelum pengguna masuk ke hasil analisis.
- Pengalaman loading diselaraskan dengan indikator loading pada navigasi pertanyaan.

#### Evaluasi
Loading merupakan umpan balik visual, bukan bukti bahwa proses analisis AI atau penyimpanan backend selalu berhasil. Kegagalan proses tetap perlu ditangani melalui error state yang sesuai.

**Status:** UX loading tercatat.

---

### Prompt 09 — Halaman Proses Analisis

#### Tujuan
Menyederhanakan halaman proses analisis agar pengguna fokus pada status pemrosesan.

#### Instruksi prompt
> Tinjau halaman Proses Analisis BUKTIVA. Hilangkan elemen langkah yang tidak diperlukan pada tahap pemrosesan, pertahankan indikator status yang relevan, dan samakan tampilannya dengan desain aplikasi. Pastikan pengguna mendapatkan umpan balik yang jelas tanpa mengubah proses analisis pada backend atau AI engine.

#### Hasil penggunaan AI
- Alur langkah 1–4 dihapus dari halaman proses analisis karena tidak diperlukan pada tahap tersebut.
- Loading dan skeleton digunakan untuk memberi umpan balik selama perpindahan menuju hasil.
- Komponen dibuat konsisten dengan gaya visual aplikasi.

#### Evaluasi
Penyederhanaan membantu mengurangi elemen yang tidak relevan selama pemrosesan. Status proses yang sebenarnya tetap mengikuti respons sistem yang tersedia.

**Status:** Penyempurnaan tampilan proses analisis tercatat.

---

### Prompt 10 — Halaman Review Input

#### Tujuan
Memudahkan pengguna memeriksa kembali informasi proyek, target role, dan bukti sebelum memulai analisis.

#### Instruksi prompt
> Redesain halaman Review Input BUKTIVA agar informasi proyek, target role, dan bukti yang telah dipilih mudah diperiksa. Rapikan tabel, panel, warna, dan tombol tanpa mengubah sumber data atau kontrak backend. Tambahkan status loading, empty state, serta notifikasi yang jelas untuk aksi penting.

#### Hasil penggunaan AI
- Tabel Informasi Project didesain ulang agar lebih mudah dipahami.
- Panel Role Target, Upload CV, dan tombol diselaraskan dengan desain aplikasi.
- Palet warna Role Target dan CV disederhanakan agar tidak terlalu ramai tetapi tetap mudah dibedakan.
- Skeleton ditambahkan ketika data proyek sedang dimuat.
- Empty state ditampilkan saat bukti proyek belum tersedia.
- Toast sukses/gagal ditambahkan pada aksi penting di halaman review.
- Metadata PDF berupa nama dan ukuran file ditampilkan bersama bukti URL.
- Modal konfirmasi menggantikan checkbox persetujuan saat tombol Mulai Analisis ditekan. Analisis berlanjut setelah pengguna memilih “Ya, mulai analisis”.
- Target role diubah menjadi kolom teks bebas agar pengguna dapat mengisi pekerjaan dari berbagai bidang.
- Data referensi role lintas bidang diperluas untuk mendukung kebutuhan antarmuka, termasuk teknologi, bisnis, keuangan, marketing, SDM, kreatif, teknik, kesehatan, pendidikan, dan hukum.

#### Evaluasi
Halaman review menjadi titik pemeriksaan sebelum analisis dimulai. Informasi yang ditampilkan harus tetap sesuai dengan data yang tersedia; metadata file tidak boleh dianggap sebagai isi PDF yang sudah diproses AI.

**Status:** Penyempurnaan UI/UX review input tercatat.

---

### Prompt 11 — Dashboard dan Ringkasan Analisis

#### Tujuan
Menyusun informasi dashboard agar pengguna dapat memahami ringkasan dan aktivitas analisis dengan lebih cepat.

#### Instruksi prompt
> Rapikan dashboard BUKTIVA menggunakan gaya neobrutalisme yang konsisten. Susun hierarki informasi, ringkas teks yang terlalu panjang, dan buat ringkasan, rekomendasi, serta riwayat terbaru mudah dipindai. Gunakan data yang sudah tersedia secara read-only dan jangan membuat klaim bahwa data demo merupakan data nyata.

#### Hasil penggunaan AI
- Tampilan neobrutalisme diterapkan dengan warna terkontrol, border tegas, hard shadow, dan hierarki informasi yang jelas.
- Panel disusun vertikal: Ringkasan Analisis Terbaru, Rekomendasi Selanjutnya, lalu Riwayat Analisis Terbaru.
- Teks analisis yang panjang diringkas dan dilengkapi label, metadata, tombol hasil lengkap, serta panel kemampuan yang mudah dipindai.
- Panel riwayat terbaru membaca data yang sama secara read-only dan menampilkan maksimal dua analisis terbaru.
- Indikator skor berbentuk lingkaran beranimasi ditambahkan; angka berada di dalam lingkaran dan label di bawahnya.
- Navbar dan sidebar workspace dirapikan agar konten lebih lapang dan tetap responsif.

#### Evaluasi
Perubahan berfokus pada penyajian data. Panel riwayat dashboard membaca data yang tersedia tanpa mengubah data tersebut.

**Status:** Penyempurnaan dashboard tercatat.

---

### Prompt 12 — Halaman Hasil Analisis dan Skor Kesiapan

#### Tujuan
Menyajikan hasil analisis dalam struktur yang lebih mudah dibaca dan dipahami pengguna.

#### Instruksi prompt
> Redesain halaman hasil analisis BUKTIVA menjadi bagian-bagian yang jelas, termasuk ringkasan, bukti proyek, kompetensi, skill gap, dan aksi navigasi. Tampilkan skor kesiapan dengan indikator yang mudah dipahami. Pertahankan sumber data yang tersedia dan jangan mengarang hasil analisis ketika data tidak tersedia.

#### Hasil penggunaan AI
- Halaman hasil analisis disusun menjadi kartu terstruktur: ringkasan, bukti proyek, kompetensi, skill gap, dan aksi navigasi.
- Skor kesiapan diubah menjadi indikator lingkaran dengan animasi progres sesuai persentase.
- Label “Selesai” diganti dengan tombol “Cetak laporan PDF” yang menggunakan dialog cetak browser.
- Pengguna dapat memilih **Save as PDF** melalui dialog cetak browser tanpa memerlukan pembuatan PDF di server.

#### Evaluasi
Perubahan memperjelas struktur hasil. Tombol cetak memanfaatkan fitur browser dan tidak berarti laporan PDF dibuat oleh layanan backend.

**Status:** Penyempurnaan tampilan hasil analisis tercatat.

---

### Prompt 13 — Detail Riwayat Analisis

#### Tujuan
Menyamakan detail riwayat dengan informasi penting yang tersedia pada halaman hasil analisis.

#### Instruksi prompt
> Perbaiki modal detail riwayat analisis agar berada di tengah layar dan mengikuti gaya visual BUKTIVA. Tampilkan informasi penting yang relevan dengan hasil analisis, seperti ringkasan, bukti, kompetensi, skill gap, dan catatan evaluasi. Pastikan modal tetap nyaman digunakan pada ukuran layar berbeda.

#### Hasil penggunaan AI
- Pop-up detail riwayat dipusatkan dan gaya visualnya diselaraskan dengan neobrutalisme.
- Modal “Lihat Detail” diperluas agar menampilkan informasi setara halaman hasil analisis.
- Halaman riwayat didesain ulang dengan kartu, filter, daftar, warna pembeda, empty state, dan animasi masuk yang konsisten.
- Animasi kartu ringkasan dan daftar riwayat menghormati preferensi `prefers-reduced-motion`.

#### Evaluasi
Detail riwayat mempermudah pengguna membaca kembali hasil sebelumnya. Informasi yang muncul bergantung pada data riwayat yang tersedia.

**Status:** Penyempurnaan UI riwayat tercatat.

---

### Prompt 14 — Komponen Ikon Bukti Proyek

#### Tujuan
Menjaga konsistensi ikon sumber bukti di berbagai bagian aplikasi.

#### Instruksi prompt
> Buat komponen frontend bersama untuk menampilkan ikon sumber bukti proyek. Dukung jenis bukti yang digunakan pada antarmuka, termasuk GitHub, portfolio, deployment, LinkedIn, dan PDF. Pertahankan konsistensi ukuran dan tampilan, serta jangan mengubah cara backend mengambil atau menganalisis bukti.

#### Hasil penggunaan AI
- Komponen ikon sumber bukti dibuat agar dapat digunakan bersama.
- Sumber bukti GitHub, portfolio, deployment, LinkedIn, dan PDF ditampilkan secara konsisten.

#### Evaluasi
Komponen bersama mengurangi perbedaan visual antarhalaman dan mempermudah pemeliharaan UI.

**Status:** Komponen UI bersama tercatat.

---

### Prompt 15 — Foto Profil dan Edit Profil

#### Tujuan
Menyediakan antarmuka untuk melihat dan mengubah informasi profil sesuai batas kemampuan frontend yang tersedia.

#### Instruksi prompt
> Tambahkan interaksi Edit Profil dengan modal terpusat untuk mengubah informasi yang ditampilkan. Untuk unggah foto, validasi format JPG, PNG, dan WebP serta tampilkan pratinjau lokal. Jangan mengklaim perubahan tersimpan permanen jika hanya disimpan pada sesi browser, dan jangan mengubah database atau integrasi backend.

#### Hasil penggunaan AI
- Tombol Unggah Foto ditambahkan dengan validasi JPG/PNG/WebP dan pratinjau lokal.
- Modal Edit Profil ditambahkan untuk mengubah nama, email, dan peran secara lokal pada sesi browser.
- Informasi yang diedit dan pratinjau foto tidak diklaim sebagai penyimpanan permanen ke Supabase.

#### Evaluasi
Antarmuka profil tersedia untuk kebutuhan prototipe. Penyimpanan file, URL avatar, sinkronisasi akun, serta pembaruan data permanen membutuhkan integrasi backend/autentikasi.

**Status:** UI dan pratinjau lokal tercatat; sinkronisasi permanen berada di luar cakupan frontend yang didokumentasikan.

---

### Prompt 16 — Loading, Empty State, Error State, dan Toast

#### Tujuan
Memberi umpan balik yang jelas pada kondisi aplikasi saat memuat data, tidak menemukan data, atau mengalami kegagalan.

#### Instruksi prompt
> Audit UX states pada halaman frontend BUKTIVA. Tambahkan skeleton atau loading saat data sedang dimuat, empty state ketika data belum tersedia, pesan error yang mudah dipahami ketika proses gagal, serta toast untuk aksi penting. Hindari notifikasi browser yang mengganggu dan pastikan status UI tidak menyatakan berhasil sebelum proses terkait berhasil.

#### Hasil penggunaan AI
- Loading, skeleton, dan overlay digunakan pada perpindahan pertanyaan serta pemrosesan hasil analisis.
- Empty state dan error state ditambahkan pada bagian yang relevan.
- Toast sukses/gagal ditambahkan untuk aksi penting pada Review Input.
- Modal konfirmasi digunakan sebelum memulai analisis.
- Tombol dan label antarmuka disusun agar status tindakan lebih jelas.

#### Evaluasi
UX states membantu pengguna memahami apa yang sedang terjadi. Status visual harus tetap mencerminkan hasil proses sebenarnya dan tidak menggantikan penanganan error pada layanan yang dipanggil.

**Status:** Pola UX states tercatat pada beberapa alur frontend.

---

### Prompt 17 — Animasi dan Aksesibilitas Gerak

#### Tujuan
Menambahkan animasi antarmuka tanpa mengabaikan preferensi aksesibilitas pengguna.

#### Instruksi prompt
> Periksa animasi kartu dan indikator skor pada BUKTIVA. Pertahankan gerakan yang membantu pengguna memahami perubahan, tetapi hormati preferensi `prefers-reduced-motion`. Hindari animasi berlebihan dan pastikan informasi penting tetap terbaca ketika animasi dikurangi.

#### Hasil penggunaan AI
- Animasi kartu ringkasan dan daftar riwayat ditambahkan.
- Indikator skor menggunakan animasi progres.
- Preferensi `reduced motion` diperhatikan untuk aksesibilitas.

#### Evaluasi
Animasi digunakan sebagai umpan balik tambahan, bukan sebagai satu-satunya cara menyampaikan status atau informasi.

**Status:** Penyesuaian animasi dan aksesibilitas tercatat.

---

### Prompt 18 — Responsivitas Navbar, Sidebar, dan Workspace

#### Tujuan
Membuat layout workspace lebih lapang dan menjaga konsistensi navigasi pada halaman-halaman internal.

#### Instruksi prompt
> Audit navbar, sidebar, header, dan menu profil pada seluruh halaman workspace. Padatkan elemen yang memakan ruang berlebihan, pertahankan hierarki navigasi, dan pastikan konten tetap responsif. Jangan mengubah kontrak data atau endpoint yang digunakan halaman.

#### Hasil penggunaan AI
- Lebar sidebar dipadatkan.
- Tinggi header dikurangi.
- Menu profil diselaraskan.
- Area konten dibuat lebih lapang dan tetap responsif.

#### Evaluasi
Perubahan layout membantu memberi ruang lebih besar pada konten utama. Pemeriksaan akhir perlu memastikan navigasi tetap jelas pada desktop dan perangkat kecil.

**Status:** Penyempurnaan layout workspace tercatat.

---

### Prompt 19 — Validasi Frontend dan Pemeriksaan Kualitas Kode

#### Tujuan
Memeriksa perubahan frontend agar tidak menimbulkan masalah tipe atau pelanggaran aturan lint.

#### Instruksi prompt
> Setelah perubahan frontend yang relevan, jalankan pemeriksaan TypeScript dan ESLint. Tinjau error yang muncul, perbaiki masalah yang berkaitan dengan perubahan, dan pertahankan kode serta integrasi yang tidak terkait. Laporkan hasil pemeriksaan secara akurat dan jangan mengklaim lulus jika perintah belum dijalankan.

#### Hasil penggunaan AI
- Pemeriksaan TypeScript dan ESLint dijadikan bagian dari validasi perubahan frontend yang relevan.
- Perubahan dilakukan dengan mempertimbangkan konsistensi komponen dan integrasi yang sudah ada.

#### Evaluasi
Pemeriksaan statis membantu menemukan sebagian masalah kode, tetapi tidak menggantikan pengujian manual di browser atau pengujian integrasi.

**Status:** Validasi TypeScript dan ESLint tercatat sebagai bagian alur kerja; status terbaru harus dicocokkan dengan hasil perintah aktual.

---

## C. Ringkasan Capaian Pekerjaan Frontend

| Area | Capaian utama | Catatan |
|---|---|---|
| Landing page | Penyempurnaan struktur informasi dan konsistensi visual | Validasi akhir mengikuti kode terbaru |
| Register | Penyesuaian UI autentikasi dan responsivitas | Tidak mengubah mekanisme autentikasi |
| Reset Password | Konsistensi tampilan dengan halaman autentikasi | Proses reset tetap bergantung pada layanan autentikasi |
| Upload CV/bukti proyek | Penyajian metadata PDF, URL bukti, dan pemulihan metadata saat edit | Isi PDF tidak diklaim telah dikirim ke AI |
| Pertanyaan 1–5 | Perbaikan konteks bukti, ukuran teks, stepper, navigasi, dan loading | Tidak mengubah logika evaluasi AI |
| Proses analisis | Penyederhanaan langkah dan penambahan umpan balik loading | Status proses mengikuti sistem yang tersedia |
| Review Input | Perbaikan tabel, panel role/CV, empty state, skeleton, toast, dan modal konfirmasi | Metadata ditampilkan sesuai data yang tersedia |
| Dashboard | Penataan ringkasan, rekomendasi, dan riwayat terbaru | Data riwayat dibaca secara read-only |
| Hasil analisis | Kartu ringkasan, bukti, kompetensi, skill gap, indikator skor, dan cetak browser | Cetak PDF menggunakan dialog browser |
| Riwayat analisis | Modal detail, filter, kartu, empty state, dan animasi | Isi bergantung pada data riwayat |
| Profil | Edit profil lokal dan pratinjau foto | Belum menjadi penyimpanan permanen |
| Kualitas kode | Pemeriksaan TypeScript dan ESLint | Harus diverifikasi kembali pada kode terbaru |

---

## D. Pembelajaran dari Penggunaan AI Assistant

**1. Prompt yang spesifik membantu menjaga konsistensi UI.**  
Menyebutkan halaman, komponen, dan perubahan yang diinginkan membantu proses penyempurnaan dilakukan secara terarah tanpa merombak seluruh antarmuka.

**2. Perubahan UI harus mempertahankan alur pengguna.**  
Landing page, autentikasi, Upload CV, pertanyaan 1–5, proses analisis, Review Input, dan hasil analisis merupakan bagian dari perjalanan pengguna. Perubahan pada satu halaman perlu mempertimbangkan hubungan dengan halaman berikutnya.

**3. UX states merupakan bagian dari fungsi antarmuka.**  
Loading, skeleton, empty state, error state, toast, dan modal konfirmasi membantu pengguna memahami status aplikasi, bukan hanya memperindah tampilan.

**4. Tampilan tidak sama dengan integrasi backend.**  
Pratinjau foto lokal, metadata PDF, serta perubahan profil pada sesi browser tidak boleh disebut sebagai penyimpanan permanen. Demikian juga, indikator loading tidak membuktikan analisis AI berhasil.

**5. Pengujian perlu dilakukan setelah perubahan.**  
Pemeriksaan TypeScript dan ESLint membantu menjaga kualitas kode, sementara pengujian browser dibutuhkan untuk memeriksa responsivitas, navigasi, dan perilaku interaksi.

**6. Batas tanggung jawab antarperan perlu dijaga.**  
Pekerjaan frontend berfokus pada presentasi data dan interaksi pengguna. Perubahan backend, Supabase, schema, endpoint, serta AI engine perlu dikoordinasikan dengan anggota tim yang bertanggung jawab pada bagian tersebut.

---

## E. Kesimpulan

Selama pengembangan BUKTIVA, AI Assistant digunakan sebagai alat bantu untuk merapikan dan menyempurnakan halaman frontend, mulai dari landing page dan autentikasi hingga Upload CV, pertanyaan validasi 1–5, proses analisis, Review Input, dashboard, hasil analisis, riwayat, dan profil.

Fokus utama pekerjaan adalah konsistensi desain neobrutalisme, kejelasan alur pengguna, responsivitas, komponen UI bersama, serta UX states seperti loading, skeleton, empty state, error state, toast, dan modal konfirmasi. Pekerjaan juga mencakup penyajian metadata bukti, indikator skor, detail riwayat, serta fitur cetak melalui dialog browser.

Pekerjaan frontend ini tidak dimaksudkan sebagai klaim bahwa backend, Supabase, atau AI engine diubah. Beberapa fungsi, seperti pratinjau foto, edit profil lokal, dan metadata PDF, masih memiliki batasan sesuai implementasi yang tercatat. Integrasi permanen harus mengikuti layanan dan kontrak sistem yang tersedia.

Dokumentasi ini menunjukkan penggunaan AI Assistant sebagai pendamping proses pengembangan frontend secara bertahap. Hasil kode tetap perlu ditinjau dan diuji oleh pengembang, serta status akhir harus dicocokkan dengan implementasi terbaru sebelum dokumen diserahkan.

---

**Status dokumen:** Draft Log Prompt Frontend Developer — Modul 8  
**Catatan dokumentasi:** Prompt merupakan rekonstruksi berdasarkan catatan implementasi frontend yang tersedia. Dokumen tidak mengklaim sebagai salinan verbatim seluruh percakapan prompt dan tidak menyatakan pengujian yang belum diverifikasi sebagai lulus.
