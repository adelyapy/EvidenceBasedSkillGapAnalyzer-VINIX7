# Prompt Log — Modul 6 HTML5 BUKTIVA

## Informasi Proyek

- **Proyek:** BUKTIVA — Evidence-Based Skill Gap Analyzer
- **Modul:** Modul 6 — Konversi Desain Figma ke HTML5
- **Tujuan:** Mengubah desain/prototype Figma menjadi struktur HTML5 yang semantik, mudah dibaca, aksesibel, dan mengikuti alur user flow.
- **Batasan utama:** HTML5 murni tanpa CSS eksternal, `<style>`, inline `style`, Tailwind, atau Bootstrap.
- **Folder aset:** `./assets/images/`
- **Penamaan aset:** huruf kecil dengan tanda strip (`kebab-case`).

Dokumentasi ini mencatat proses prompting AI, iterasi, audit manual, dan refaktorisasi hasil kode.

---

## 1. Prompt Awal — Struktur HTML Landing Page

### Tujuan
Membuat struktur HTML dari desain landing page BUKTIVA dengan mempertahankan alur informasi utama.

### Prompt
> Buatkan kode HTML5 untuk desain landing page BUKTIVA berdasarkan desain yang diberikan. Gunakan HTML5 semantik seperti `header`, `nav`, `main`, `section`, `article`, `figure`, dan elemen lain sesuai fungsi konten. Jangan gunakan CSS, `<style>`, inline `style`, Tailwind, atau Bootstrap. Gunakan browser default. Pertahankan teks, struktur informasi, CTA, navigasi, dan gambar dari desain. Gunakan atribut `alt` yang sesuai untuk gambar dan gunakan jalur relatif `./assets/images/`.

### Audit
Hasil awal diperiksa terhadap desain, struktur semantik, heading, jalur aset, teks alternatif, dan navigasi.

---

## 2. Prompt — Refaktor Semantik dan Pembersihan DOM

### Prompt
> Audit dan refaktor kode HTML ini. Pertahankan isi dan alur desain, tetapi bersihkan wrapper `div` yang tidak memiliki fungsi struktural. Gunakan `header`, `nav`, `main`, `section`, `article`, `figure`, `ul`, `ol`, dan elemen HTML5 semantik sesuai kebutuhan. Pastikan hanya ada satu `h1` utama dan heading berikutnya tersusun secara logis. Jangan menambahkan CSS atau JavaScript.

### Hasil Refaktor
- Wrapper yang tidak diperlukan dikurangi.
- Landmark utama diperjelas.
- Heading disusun dari `h1` → `h2` → `h3` sesuai struktur konten.
- Navigasi dikelompokkan di dalam `nav`.
- Konten mandiri menggunakan `article` ketika sesuai.
- Gambar informatif diberi `alt`.

---

## 3. Prompt — Navigasi dan User Flow

### Prompt
> Perbaiki navigasi HTML agar mengikuti user flow BUKTIVA. Menu BERANDA, TENTANG, CARA KERJA, dan TEAM KAMI harus mengarah ke bagian yang sesuai pada halaman beranda menggunakan anchor. CTA analisis harus mengarah ke halaman analisis. Tombol MASUK dan DAFTAR harus mengarah ke halaman autentikasi yang sesuai. Jangan gunakan JavaScript dan jangan gunakan CSS.

### Implementasi
- `BERANDA` → bagian hero.
- `TENTANG` → `#tentang`.
- `CARA KERJA` → `#cara-kerja`.
- `TEAM KAMI` → `#team-kami`.
- CTA → halaman analisis.
- `MASUK` → halaman login.
- `DAFTAR` → halaman registrasi.

---

## 4. Prompt — Halaman Login

### Prompt
> Buat halaman login BUKTIVA berdasarkan desain yang diberikan. Gunakan HTML5 semantik tanpa CSS. Buat form dengan label yang terhubung ke input menggunakan `for` dan `id`. Gunakan input email dan password dengan `autocomplete` yang sesuai serta `required`. Sediakan tombol submit dengan `button type="submit"`. Tambahkan tautan lupa kata sandi, daftar, dan kembali ke beranda. Gunakan gambar dari `./assets/images/` dengan `alt` yang sesuai.

### Audit
- Label terhubung dengan input.
- `type="email"` dan `type="password"` digunakan sesuai fungsi.
- Input diberi `required`.
- Tombol menggunakan `button`.
- Ikon dekoratif menggunakan `alt=""`.
- Ilustrasi utama memiliki deskripsi alternatif.

---

## 5. Prompt — Halaman Registrasi

### Prompt
> Buat halaman registrasi BUKTIVA dalam HTML5 murni tanpa CSS. Kelompokkan field menggunakan `fieldset` dan `legend`. Setiap label harus memiliki atribut `for` yang sesuai dengan `id` input. Gunakan input nama, email, password, dan konfirmasi password. Gunakan `required`, `autocomplete`, dan `minlength` jika relevan. Gunakan `button type="submit"`. Pertahankan tautan masuk dan kembali ke beranda.

### Audit
- Field dikelompokkan dengan `fieldset` dan `legend`.
- Semua label terikat dengan input.
- Validasi dasar HTML digunakan melalui tipe input dan atribut.
- Ikon dekoratif menggunakan `alt=""`.

---

## 6. Prompt — Halaman Reset Kata Sandi

### Prompt
> Buat halaman reset kata sandi BUKTIVA berdasarkan desain. Gunakan HTML5 semantik tanpa CSS. Sediakan satu form email dengan label yang terhubung ke input. Gunakan `type="email"`, `autocomplete="email"`, dan `required`. Gunakan `fieldset`, `legend`, dan `button type="submit"`. Tambahkan tautan kembali ke halaman masuk dan gunakan gambar dari `./assets/images/`.

### Audit
- Input email memiliki label yang terikat.
- Atribut validasi HTML digunakan.
- Tombol submit menggunakan `button`.
- Ilustrasi memiliki `alt`.
- Ikon dekoratif memiliki `alt=""`.

---

## 7. Prompt — Section Tentang Buktiva

### Prompt
> Tambahkan section Tentang Buktiva ke dalam `index_beranda.html`. Jangan membuat CSS baru. Gunakan `section` dengan `id="tentang"`, heading `h2`, dan beberapa `article` untuk menjelaskan apa itu Buktiva, tujuan Buktiva, serta manfaat yang diperoleh pengguna. Gunakan list untuk manfaat. Sediakan tautan kembali ke bagian beranda.

### Hasil
Section menggunakan `section`, `header`, `h2`, `article`, `h3`, `ul`, dan anchor.

---

## 8. Prompt — Section Cara Kerja

### Prompt
> Tambahkan section Cara Kerja ke `index_beranda.html` dengan `id="cara-kerja"`. Gunakan HTML5 semantik tanpa CSS. Karena prosesnya berurutan, gunakan `ol` untuk empat tahap: unggah proyek, analisis kompetensi dengan AI, temukan skill gap, dan dapatkan roadmap pembelajaran. Setiap tahap dapat menggunakan `article` dan heading yang sesuai. Tambahkan CTA untuk memulai analisis.

### Hasil
Empat proses direpresentasikan dengan `ol` sehingga urutan tetap bermakna tanpa CSS.

---

## 9. Prompt — Section Team Kami

### Prompt
> Tambahkan section Team Kami ke `index_beranda.html` dengan `id="team-kami"`. Gunakan HTML5 semantik tanpa CSS. Tampilkan pengenalan singkat tim dan lima peran: AI Engineer 1, AI Engineer 2, Frontend Developer 1, Frontend Developer 2, dan Backend Developer. Gunakan list dan article agar setiap peran terstruktur. Tambahkan tautan kembali ke bagian beranda.

### Hasil
Bagian Team Kami menggunakan `section`, `header`, `h2`, `h3`, `h4`, `ul`, dan `article`.

---

## 10. Prompt — Audit Aset dan Media

### Prompt
> Audit seluruh penggunaan gambar pada halaman HTML. Semua gambar harus menggunakan jalur relatif `./assets/images/`. Gunakan nama file huruf kecil dengan tanda strip. Gambar informatif harus mempunyai `alt` yang menjelaskan isi gambar, sedangkan ikon/dekorasi yang tidak menambah informasi harus menggunakan `alt=""`. Jangan menggunakan base64 atau jalur absolut.

### Hasil
Seluruh aset ditempatkan pada `assets/images/` dan nama file menggunakan format huruf kecil dengan tanda strip.

---

## 11. Strategi Iterasi

1. **Generate** — AI membuat struktur HTML awal berdasarkan desain.
2. **Audit** — kode diperiksa terhadap desain, user flow, semantik, dan aksesibilitas.
3. **Refaktor** — wrapper berlebih dan struktur yang tidak diperlukan dibersihkan.
4. **Aksesibilitas** — label, `for/id`, `alt`, heading, dan landmark diperbaiki.
5. **Media** — jalur gambar diseragamkan ke `./assets/images/`.
6. **Navigasi** — anchor dan tautan disesuaikan dengan prototype.
7. **Validasi** — HTML dipersiapkan untuk diuji menggunakan W3C Validator.

---

## 12. Perbandingan Sebelum dan Sesudah Refaktorisasi

### Sebelum — kode awal hasil AI
- Struktur awal mengikuti komponen visual dan perlu diaudit agar tidak berisi wrapper yang tidak diperlukan.
- Landmark semantik perlu ditentukan kembali.
- Hierarki heading perlu diperiksa.
- Relasi label dan input perlu diperiksa.
- Jalur aset perlu diseragamkan.

### Sesudah — hasil refaktorisasi
- Menggunakan `header`, `nav`, `main`, `section`, `article`, dan `figure` sesuai fungsi.
- Heading disusun secara hierarkis.
- Form menggunakan `label` + `for/id`, `fieldset`, `legend`, dan `button`.
- Gambar menggunakan `./assets/images/`.
- Gambar informatif diberi `alt`, sedangkan dekorasi diberi `alt=""`.
- Tidak menggunakan CSS, inline style, Tailwind, atau Bootstrap.
- Navigasi mengikuti alur prototype dan anchor section.

> **Catatan:** Kode mentah AI sebelum audit tidak disimpan sebagai file terpisah dalam paket proyek. Perbandingan ini mendokumentasikan perubahan struktural yang dilakukan selama proses audit dan refaktor.

---

## 13. Checklist Akhir Modul 6

- [x] HTML5 semantik.
- [x] Tanpa file CSS.
- [x] Tanpa `<style>`.
- [x] Tanpa inline `style`.
- [x] Tanpa Tailwind/Bootstrap.
- [x] Navigasi menggunakan anchor/link HTML.
- [x] Struktur heading diperiksa.
- [x] Form memiliki label yang terhubung dengan input.
- [x] Tombol submit menggunakan `<button type="submit">`.
- [x] Aset menggunakan jalur relatif `./assets/images/`.
- [x] Nama aset menggunakan huruf kecil dan tanda strip.
- [x] Gambar memiliki `alt` sesuai fungsinya.
- [ ] Pengujian akhir W3C dan screenshot `validation.png` dilakukan setelah seluruh halaman selesai.

---

## 14. Catatan Evaluasi

Prompt digunakan secara bertahap untuk menghasilkan dan memperbaiki kode. Keputusan akhir mengenai struktur DOM, atribut aksesibilitas, penamaan aset, dan navigasi diperiksa secara manual agar hasil tetap sesuai desain dan ketentuan Modul 6.
---

## 15. Klarifikasi Aset SVG dan Prompt

SVG bukan format khusus untuk prompt. SVG adalah **format file gambar vektor** yang dapat langsung digunakan oleh HTML melalui elemen `<img>`, misalnya:

```html
<img src="./assets/images/logo.svg" alt="Logo Buktiva">
```

Dalam Modul 6, SVG/WebP disebut pada tahap persiapan aset sebagai format hasil ekspor dari Figma, sedangkan prompt AI digunakan untuk menghasilkan/refaktor **kode HTML**. Keduanya adalah hal yang berbeda.

---

## 16. Refaktor Form Final

### Sebelum
Struktur form login/register sebelumnya memiliki tag yang rusak seperti:

```html
<fieldset <article>
```

dan pada reset password terdapat `fieldset` yang membungkus `article/form` dengan `legend` di posisi yang tidak tepat.

### Sesudah
Struktur diperbaiki menjadi:

```html
<article>
    <h2>...</h2>

    <form action="#" method="post">
        <fieldset>
            <legend>...</legend>

            <label for="...">...</label>
            <input id="..." name="..." required>

            <button type="submit">...</button>
        </fieldset>
    </form>
</article>
```

Perbaikan ini memastikan `fieldset` hanya mengelompokkan kontrol form, `legend` menjadi judul kelompok, dan setiap `label` terhubung dengan `input` melalui `for` dan `id`.


---

# Prompt Log Tambahan — Pengembangan Backend BUKTIVA (Modul 7–8 dan Integrasi)

> **Catatan penyusunan:** Bagian ini merangkum pekerjaan backend yang dibahas sejak pengembangan BUKTIVA sampai integrasi tim dan perbaikan data profil/dashboard pada 24 Oktober 2026. Prompt di bawah merupakan rekonstruksi dokumentasi dari pekerjaan dan keputusan teknis yang dibahas, bukan salinan verbatim seluruh pesan percakapan. Status yang belum dikonfirmasi melalui pengujian akhir ditandai sebagai tindak lanjut.

## 17. Peran dan Ruang Lingkup Pekerjaan Backend

### Tujuan
Mengembangkan dan mengintegrasikan backend BUKTIVA — *Evidence-Based Skill Gap Analyzer* — agar proses analisis kompetensi berbasis bukti, evaluasi jawaban validasi, penyimpanan hasil, dan pembuatan roadmap dapat berjalan dengan data pengguna yang benar.

### Konteks pengerjaan
- **Proyek:** BUKTIVA — Evidence-Based Skill Gap Analyzer.
- **Repositori lokal:** `C:\EvidenceBasedSkillGapAnalyzer-VINIX7`.
- **Branch backend:** `backend-dev`.
- **Branch utama:** `main`.
- **Peran:** Backend Developer, dengan pekerjaan yang bersinggungan dengan integrasi modul AI, Supabase, API, pengujian, dan integrasi perubahan tim.
- **Tujuan umum:** menjaga agar alur analisis, otorisasi, validasi data, penyimpanan hasil, dan integrasi frontend bekerja konsisten.

### Prompt kerja
> Bertindak sebagai pendamping Backend Developer untuk proyek BUKTIVA. Periksa struktur repositori dan implementasi yang sudah ada sebelum mengubah kode. Pertahankan kontrak API, autentikasi, otorisasi kepemilikan data, validasi input, dan aturan bisnis yang sudah berjalan. Jangan membuat ulang fitur yang sudah tersedia tanpa alasan. Lakukan perubahan secara bertahap, jalankan pengujian yang relevan, jelaskan file yang berubah, dan jangan melakukan commit atau push sebelum perubahan diperiksa dan saya memintanya.

### Catatan
Pengerjaan dilakukan pada repositori yang sudah ada, bukan membuat proyek baru dari nol. Perubahan backend perlu tetap kompatibel dengan frontend dan modul AI yang dikembangkan oleh anggota tim lain.

---

## 18. Prompt — Audit Struktur Backend dan Kontrak API

### Tujuan
Memahami struktur aplikasi sebelum melakukan perubahan, menentukan lokasi implementasi backend, dan menghindari konflik dengan pekerjaan frontend maupun AI Engineer.

### Prompt
> Audit struktur repositori BUKTIVA sebelum melakukan perubahan. Identifikasi route API, modul analisis, validasi, ingestion, scoring, roadmap, konfigurasi Supabase, tipe data, dan pengujian yang sudah tersedia. Jelaskan alur data dari permintaan pengguna sampai penyimpanan dan respons API. Pertahankan endpoint dan kontrak yang sudah digunakan frontend. Jangan menghapus atau mengganti route yang masih dipakai tanpa memeriksa dependensi dan pemanggilnya.

### Area yang ditinjau
- Route API dalam direktori `src/app/api/`.
- Alur evaluasi analisis dan pertanyaan validasi.
- Modul ingestion untuk sumber bukti proyek.
- Modul AI untuk ekstraksi/evaluasi skill.
- Modul scoring dan perhitungan kesiapan.
- Modul roadmap dan rekomendasi sumber belajar.
- Integrasi autentikasi Supabase.
- Tipe data, dokumentasi, skrip, dan pengujian otomatis.

### Catatan evaluasi
Audit diperlukan terutama saat perubahan dari beberapa branch akan digabungkan. Nama route, bentuk request/response, struktur tabel, dan aturan kepemilikan data harus diperiksa sebelum menyelesaikan konflik integrasi.

---

## 19. Prompt — Integrasi Gemini dan Modul AI

### Tujuan
Mengintegrasikan kemampuan AI ke alur analisis BUKTIVA dengan tetap menjaga pemisahan tanggung jawab antar modul.

### Prompt
> Tinjau integrasi Gemini pada backend BUKTIVA. Gunakan konfigurasi rahasia dari environment variable dan jangan menaruh API key langsung di kode. Pastikan pemanggilan model memiliki input dan output yang terstruktur, menangani respons gagal, dan tidak melewati validasi maupun otorisasi server. Integrasikan fungsi AI ke alur analisis yang sudah ada tanpa mengganti kontrak endpoint secara sembarangan. Pisahkan proses penyiapan bukti, ekstraksi skill, evaluasi jawaban, scoring, dan penyusunan roadmap agar mudah diuji.

### Cakupan modul yang dibahas
- Integrasi model Gemini.
- Penyiapan bukti (*evidence preparation*).
- Ekstraksi dan validasi skill.
- Evaluasi jawaban pada pertanyaan validasi.
- Pengelolaan input serta repository analisis.
- Pengolahan bukti dari GitHub dan berkas ZIP.
- Perhitungan skor kesiapan (*readiness score*) dan kesenjangan skill (*skill gaps*).
- Penyusunan roadmap pembelajaran dan rekomendasi sumber belajar.

### Catatan keamanan dan keandalan
- API key harus disimpan di environment variable dan tidak di-commit.
- Output model perlu diperlakukan sebagai data yang harus divalidasi, bukan otomatis dianggap benar.
- Kegagalan layanan model harus ditangani tanpa membuat server crash.
- Retry harus dibatasi dan digunakan secara hati-hati, terutama ketika layanan memberi respons sementara seperti HTTP 503.
- Hindari pemanggilan model berulang yang tidak diperlukan.

---

## 20. Prompt — Ingestion Bukti dari GitHub dan ZIP

### Tujuan
Menyiapkan bukti proyek yang diberikan pengguna untuk diproses dalam analisis skill gap.

### Prompt
> Audit modul ingestion BUKTIVA untuk sumber GitHub dan unggahan ZIP. Pastikan sumber bukti diproses melalui alur yang sesuai, kesalahan input atau kegagalan pengambilan data ditangani, dan hasilnya diteruskan ke tahap analisis tanpa melewati pemeriksaan keamanan. Pertahankan struktur modul serta tipe data yang digunakan proses scoring dan roadmap. Tambahkan atau perbarui pengujian untuk skenario sukses, input tidak valid, dan kegagalan sumber data.

### Cakupan yang tercatat
- Pengambilan/penyiapan bukti dari repositori GitHub.
- Pemrosesan bukti dari berkas ZIP.
- Penyiapan evidence sebelum dikirim ke tahap AI.
- Penanganan kegagalan ingestion dan validasi masukan.
- Hubungan data bukti dengan analisis dan pengguna.

### Catatan
Rincian implementasi seperti batas ukuran ZIP, daftar ekstensi yang diterima, dan aturan keamanan ekstraksi harus mengikuti kode serta konfigurasi aktual. Dokumentasi ini tidak menetapkan angka batas yang belum diverifikasi.

---

## 21. Prompt — Evaluasi Analisis dan Pertanyaan Validasi

### Tujuan
Menghubungkan hasil analisis awal dengan pertanyaan validasi agar penilaian skill memiliki bukti tambahan dari jawaban pengguna.

### Prompt
> Periksa alur evaluasi analisis BUKTIVA. Pertahankan endpoint yang telah digunakan frontend, termasuk `POST /api/ai/evaluate-analysis` dan alur `validation-questions`. Pastikan permintaan hanya dapat memproses analisis milik pengguna yang sedang terautentikasi. Validasi payload, tangani analisis yang tidak ditemukan atau bukan milik pengguna, simpan hasil evaluasi ke tabel yang sesuai, dan kembalikan respons yang konsisten. Jangan mempercayai `user_id` dari request sebagai bukti kepemilikan tanpa verifikasi server.

### Pekerjaan yang dibahas
- Pembuatan pertanyaan validasi dengan bantuan Gemini.
- Endpoint `POST /api/ai/evaluate-analysis`.
- Evaluasi jawaban validasi.
- Penyimpanan hasil skill, skor kesiapan, dan skill gap agar dapat digunakan kembali pada tampilan hasil.
- Penanganan respons model yang gagal atau sementara.
- Pemeriksaan agar endpoint tidak dapat digunakan untuk membaca atau memodifikasi analisis akun lain.

### Catatan
Kontrak API yang sudah dipakai frontend harus dipertahankan atau diperbarui bersama pemanggilnya. Perubahan nama endpoint atau bentuk payload tidak boleh dilakukan secara terpisah tanpa pengujian integrasi.

---

## 22. Prompt — Autentikasi, Kepemilikan Data, dan RLS Supabase

### Tujuan
Memastikan data analisis dan hasilnya hanya dapat diakses oleh pengguna yang berhak.

### Prompt
> Audit seluruh route backend yang membaca atau mengubah data analisis. Ambil identitas pengguna dari sesi Supabase yang tervalidasi di server. Pastikan setiap query dibatasi berdasarkan pengguna dan/atau relasi kepemilikan analisis. Periksa kebijakan Row Level Security (RLS) pada tabel yang digunakan. Untuk resource milik pengguna lain atau resource yang tidak dapat diakses, gunakan respons yang tidak membocorkan data. Tambahkan pengujian lintas akun yang membuktikan pengguna A tidak dapat membaca atau mengubah data pengguna B.

### Tabel yang ditinjau
- `analyses`
- `project_evidences`
- `validation_questions`
- `validation_answers`
- `analysis_skill_results`
- `skill_gaps`

### Hasil yang dibahas
- Pemeriksaan autentikasi Supabase pada endpoint terkait.
- Pemeriksaan kepemilikan analisis di sisi server.
- Pemeriksaan kebijakan RLS pada tabel yang digunakan.
- Pengujian akses lintas akun; skenario yang dibahas menghasilkan respons `404` untuk resource yang bukan milik pengguna.
- Penekanan bahwa menyembunyikan tombol di frontend bukan pengganti otorisasi server.

### Catatan keamanan
UUID atau ID yang sulit ditebak bukan pengganti pemeriksaan izin. Server tetap harus memverifikasi bahwa pengguna memiliki hak untuk mengakses setiap objek yang diminta.

---

## 23. Prompt — Penyimpanan dan Penggunaan Hasil Analisis

### Tujuan
Menjaga konsistensi data hasil analisis agar dapat ditampilkan kembali di frontend tanpa memakai nilai statis.

### Prompt
> Audit alur penyimpanan hasil analisis BUKTIVA. Pastikan hasil skill, readiness score, skill gaps, dan data yang dibutuhkan roadmap disimpan atau diambil dari sumber yang benar. Gunakan relasi analisis dan pengguna yang tervalidasi. Pastikan status analisis diperiksa sebelum hasil dipakai untuk statistik atau tampilan akhir. Hindari membuat data duplikat saat proses dicoba ulang dan tangani kondisi hasil yang belum tersedia.

### Entitas data yang dibahas
- `analyses` untuk catatan analisis dan statusnya.
- `project_evidences` untuk bukti yang terkait dengan analisis.
- `analysis_skill_results` untuk hasil skill.
- `skill_gaps` untuk kesenjangan kompetensi.
- `validation_questions` dan `validation_answers` untuk alur validasi jawaban.

### Catatan evaluasi
Relasi antartabel perlu dijaga saat mengambil data untuk hasil analisis maupun statistik. Jumlah baris bukti tidak selalu sama dengan jumlah proyek, dan hasil yang belum selesai tidak boleh otomatis diperlakukan sebagai hasil final.

---

## 24. Prompt — Scoring, Readiness, Skill Gap, dan Roadmap

### Tujuan
Menjaga alur dari hasil evaluasi skill ke penilaian kesiapan dan rekomendasi pengembangan kompetensi.

### Prompt
> Audit modul scoring dan roadmap BUKTIVA. Pastikan perhitungan readiness score dan skill gap menggunakan hasil skill yang tersedia serta aturan bisnis yang telah ditentukan. Pastikan roadmap dan rekomendasi sumber belajar berhubungan dengan gap yang ditemukan. Pisahkan logika perhitungan dari route API agar dapat diuji. Tambahkan pengujian untuk hasil lengkap, hasil kosong, nilai yang tidak valid, dan kondisi batas tanpa mengubah aturan bisnis yang sudah disepakati.

### Cakupan modul yang dibahas
- Perhitungan skor kesiapan.
- Identifikasi skill yang belum memenuhi kebutuhan target role.
- Penyusunan roadmap pengembangan kompetensi.
- Rekomendasi sumber belajar.
- Tipe data dan kontrak hasil antar modul.
- Pengujian unit untuk scoring dan roadmap.

### Catatan
Dokumentasi ini mencatat cakupan modul yang diintegrasikan, bukan mengklaim bahwa seluruh rumus atau rekomendasi sudah divalidasi secara akademik. Validitas hasil tetap bergantung pada aturan bisnis dan pengujian yang berlaku di kode.

---

## 25. Prompt — Pengujian Otomatis dan Penanganan Error

### Tujuan
Memeriksa agar perubahan backend tidak merusak alur analisis, validasi, ingestion, scoring, dan roadmap.

### Prompt
> Jalankan pengujian yang relevan setelah perubahan backend BUKTIVA. Periksa pengujian pada modul AI, analysis, ingestion, validation, scoring, dan roadmap. Tambahkan skenario untuk input tidak valid, data tidak ditemukan, akses tanpa autentikasi, akses lintas akun, dan kegagalan layanan Gemini. Perbaiki akar masalah tanpa menghapus pengujian yang gagal atau melemahkan pemeriksaan keamanan. Setelah itu jalankan pemeriksaan TypeScript.

### Pengujian yang tercatat dalam proses integrasi
- Suite `tests/ai`.
- Suite `tests/analysis`.
- Suite `tests/ingestion`.
- Suite `tests/validation`.
- Suite `tests/scoring`.
- Suite `tests/roadmap`.
- Pemeriksaan tipe menggunakan `npx tsc --noEmit`.
- Pengujian akses lintas akun untuk memastikan resource pengguna lain tidak dapat diakses.

### Hasil pada tahap integrasi 23 Oktober 2026
- Dilaporkan **330 pengujian lulus** pada suite terkait.
- `npx tsc --noEmit` dilaporkan berhasil.
- Pengujian Gemini live tidak dijalankan sebagai bagian dari hasil tersebut.
- Hasil ini adalah status pada tahap integrasi yang dibahas; perubahan berikutnya tetap perlu diuji ulang.

---

## 26. Prompt — Integrasi Branch Backend, AI, dan Frontend

### Tujuan
Menggabungkan pekerjaan beberapa anggota tim tanpa menghilangkan endpoint backend atau merusak fitur yang sudah berjalan.

### Prompt
> Bantu integrasikan perubahan dari branch backend, AI, dan frontend ke repositori BUKTIVA dengan aman. Periksa status Git, branch aktif, commit yang akan digabung, dan file konflik terlebih dahulu. Pertahankan endpoint backend yang sudah dipakai frontend, khususnya alur evaluasi analisis dan pertanyaan validasi. Saat menyelesaikan konflik, gabungkan perubahan berdasarkan fungsi masing-masing, bukan sekadar memilih satu versi seluruh file. Jangan menggunakan force push, jangan menghapus branch backup, dan jangan melakukan commit/push tanpa konfirmasi.

### Riwayat integrasi yang dibahas
- Repositori lokal: `C:\EvidenceBasedSkillGapAnalyzer-VINIX7`.
- Branch backend: `backend-dev`.
- Branch frontend yang disebut: `frontend1-dev` dan `frontend2-dev`.
- Commit AI Engineer yang dibahas: `a3ad93c`, mencakup modul AI, ingestion, scoring, roadmap, tipe data, skrip, dokumentasi, dan pengujian.
- Commit frontend yang dibahas: `7d6c8f8`, mencakup perubahan UI/CSS.
- File konflik yang disebut termasuk `package.json`, lockfile, dan `src/app/api/ai/test/route.ts`.
- Konflik route `/api/ai/test` perlu diselesaikan dengan mempertahankan tujuan route yang sesuai dan menghindari duplikasi; route backend yang sudah dipakai alur autentikasi tidak boleh diganti sembarangan.
- PR **#28** telah digabung ke `main`.
- Pada 23 Oktober 2026, `main` dan `backend-dev` dilaporkan sinkron di commit `9becdab`.
- Working tree dilaporkan bersih pada titik pemeriksaan integrasi tersebut.
- Branch backup yang disebut: `backup-backend-dev-before-frontend`, `backup-backend-dev-pr28`, dan `integration/main-into-backend`.

### Catatan
Status Git dapat berubah setelah titik pemeriksaan di atas. Selalu jalankan `git status` dan periksa log terbaru sebelum melanjutkan. Informasi sinkron pada 23 Oktober bukan jaminan bahwa branch tetap bersih pada waktu berikutnya.

---

## 27. Prompt — Mengganti Data Demo pada Halaman Profil

### Tujuan
Memastikan halaman profil memakai data pengguna yang sedang masuk, bukan objek demo yang ditulis langsung di frontend.

### Prompt
> Periksa halaman profil BUKTIVA. Ganti data demo dengan data Supabase untuk pengguna yang sedang terautentikasi. Gunakan `supabase.auth.getUser()` untuk mendapatkan pengguna, ambil `profiles` berdasarkan `id` UUID yang sama, dan pertahankan desain serta komponen UI. Simpan perubahan nama ke Supabase dan gunakan mekanisme autentikasi untuk pembaruan email. Tambahkan state loading/error dan jangan mengarang kolom yang tidak ada pada skema.

### Pemeriksaan skema dan implementasi
Tabel `profiles` yang diperiksa memiliki kolom:
- `id` (`uuid`)
- `full_name` (`text`)
- `avatar_url` (`text`)
- `created_at` (`timestamptz`)
- `updated_at` (`timestamptz`)

Email tidak terdaftar sebagai kolom pada skema `profiles` yang diperiksa, sehingga sumber email adalah data autentikasi Supabase. Tanggal pembuatan akun juga diambil dari data pengguna autentikasi jika tersedia.

### Hasil yang dilaporkan
- Pengguna melaporkan bahwa data profil sudah diperbarui.
- Komponen yang dibahas mencakup `ProfilePage.tsx`, `PersonalInformationCard.tsx`, dan `ProfileOverviewCard.tsx`.
- Role tidak boleh diklaim sebagai data dinamis dari database jika kolom atau sumber otoritatifnya belum tersedia.

---

## 28. Prompt — Memperbaiki Statistik Dashboard

### Tujuan
Mengganti statistik dashboard yang masih statis dengan data milik pengguna yang sedang masuk.

### Prompt
> Audit `src/components/dashboard/sections/DashboardStats.tsx`, `src/components/dashboard/sections/DashboardHero.tsx`, dan `src/data/dashboard.ts`. Gunakan Supabase untuk mengambil data pengguna aktif dan statistik yang benar-benar berasal dari data pengguna tersebut. Pertahankan tampilan, ikon, dan styling. Definisikan makna setiap statistik sebelum menghitungnya, tangani error dan data kosong, serta jangan menghitung bukti proyek ganda sebagai beberapa proyek. Pastikan nama dashboard konsisten dengan profil.

### Temuan yang dibahas
- `src/data/dashboard.ts` masih berisi nilai contoh, termasuk angka untuk Total Analisa, Total Proyek, Skill Dikuasai, dan Target Role.
- `DashboardStats.tsx` sebelumnya hanya mengambil jumlah analisis secara dinamis, sedangkan statistik lain masih statis.
- `DashboardHero.tsx` sudah memiliki alur untuk membaca `full_name` dari tabel `profiles` dan memakai metadata/email sebagai fallback.
- Tabel `project_evidences` dapat menyimpan beberapa bukti untuk satu analisis. Oleh sebab itu, menghitung semua baris bukti sebagai total proyek berisiko menghasilkan angka ganda.
- `analysis_skill_results` menyimpan hasil skill per analisis; kriteria “skill dikuasai” harus ditentukan secara konsisten.
- `analyses.target_role` dapat menjadi sumber target role, tetapi definisi apakah hanya analisis selesai yang dihitung perlu diselaraskan dengan aturan produk.

### Status
Pendekatan pengambilan statistik dari Supabase telah dibahas dan kode pengganti disiapkan. Angka akhir untuk Total Proyek, Skill Dikuasai, dan Target Role tetap perlu diverifikasi dengan definisi bisnis dan hasil pengujian aplikasi. Jangan menandai semua statistik selesai hanya karena query dapat dijalankan.

---

## 29. Prompt — Pemeriksaan Batas Gemini API

### Tujuan
Mendiagnosis kegagalan permintaan AI ketika penggunaan mencapai batas pada Google AI Studio.

### Prompt
> Bantu interpretasikan tampilan Rate Limits Gemini API tanpa meminta atau menampilkan API key. Jelaskan RPM, TPM, dan RPD serta dampaknya terhadap alur analisis BUKTIVA. Bedakan angka pada tampilan rate limits dengan status penggunaan terkini. Sarankan penanganan error dan retry yang aman di backend.

### Informasi yang terlihat pada tangkapan layar 24 Oktober 2026
- Model yang tertulis: **Gemini 3.8 Flash**.
- RPM: batas yang ditampilkan `5`.
- TPM: batas yang ditampilkan `250K`.
- RPD: tampilan `28 / 20`, dengan indikator merah.

### Catatan evaluasi
Tangkapan layar menunjukkan angka penggunaan RPD di atas batas yang ditampilkan. Hal ini dapat menjelaskan kegagalan permintaan akibat kuota, tetapi status terkini dan jadwal reset harus diperiksa kembali pada dashboard Google AI Studio. Jangan menaruh API key dalam log, dokumentasi, atau repositori publik.

---

## 30. Strategi Kerja Backend dari Awal hingga Integrasi

1. **Pahami repositori dan peran** — audit branch, route API, modul backend, skema database, serta kontrak frontend.
2. **Audit autentikasi dan kepemilikan** — pastikan identitas berasal dari sesi Supabase yang tervalidasi dan query dibatasi pada pengguna yang berhak.
3. **Siapkan evidence** — proses sumber GitHub/ZIP dan validasi masukan sebelum analisis.
4. **Jalankan analisis AI** — gunakan Gemini melalui modul yang terpisah, validasi hasilnya, dan tangani kegagalan layanan.
5. **Evaluasi dan validasi** — gunakan pertanyaan validasi dan evaluasi jawaban untuk memperkaya hasil analisis.
6. **Simpan hasil** — pertahankan relasi antara pengguna, analisis, bukti, hasil skill, dan skill gap.
7. **Hitung dan rekomendasikan** — jalankan scoring, readiness, skill gap, serta roadmap berdasarkan hasil yang tersedia.
8. **Uji backend** — jalankan suite pengujian relevan dan pemeriksaan TypeScript.
9. **Integrasikan branch** — tinjau konflik, pertahankan kontrak API, lalu integrasikan melalui PR.
10. **Sambungkan data profil/dashboard** — hilangkan penggunaan data demo dan gunakan sumber data aktual yang tepat.
11. **Pantau penggunaan AI** — periksa rate limit dan kendalikan retry/pemanggilan Gemini.
12. **Dokumentasikan hasil** — pisahkan pekerjaan selesai, hasil uji yang sudah terkonfirmasi, dan tindak lanjut yang belum diverifikasi.

---

## 31. Checklist Rekap Pekerjaan Backend

### Cakupan yang telah dibahas atau dikerjakan
- [x] Audit struktur backend dan kontrak API.
- [x] Integrasi modul Gemini/AI ke alur analisis.
- [x] Cakupan ingestion GitHub dan ZIP.
- [x] Cakupan evaluasi analisis dan pertanyaan validasi.
- [x] Pemeriksaan autentikasi dan kepemilikan data Supabase.
- [x] Pemeriksaan RLS pada tabel terkait analisis.
- [x] Cakupan scoring, readiness, skill gap, dan roadmap.
- [x] Pengujian modul backend serta pemeriksaan TypeScript pada tahap integrasi.
- [x] Integrasi branch dan PR #28 ke `main`.
- [x] Peninjauan data profil dan statistik dashboard yang masih demo.
- [x] Pemeriksaan tampilan rate limit Gemini API.

### Tindak lanjut yang perlu diverifikasi di repositori/aplikasi
- [ ] Jalankan ulang seluruh pengujian setelah perubahan terbaru pada profil/dashboard.
- [ ] Pastikan `npx tsc --noEmit` tetap lulus setelah perubahan terbaru.
- [ ] Uji perubahan profil, termasuk penyimpanan nama dan perilaku pembaruan email.
- [ ] Pastikan nama pada dashboard dan profil sama untuk akun yang sama.
- [ ] Tetapkan dan uji definisi statistik Total Proyek, Skill Dikuasai, dan Target Role.
- [ ] Uji state loading, error, data kosong, dan sesi tidak valid.
- [ ] Uji kembali akses lintas akun pada endpoint yang relevan.
- [ ] Pastikan environment variable dan API key tidak terunggah ke GitHub.
- [ ] Pastikan status branch dan working tree terbaru sebelum commit/push berikutnya.

---

## 32. Catatan Evaluasi Keseluruhan

Pekerjaan backend BUKTIVA tidak terbatas pada satu perubahan halaman. Cakupannya meliputi alur ingestion bukti, integrasi AI, validasi jawaban, scoring dan skill gap, roadmap, keamanan akses data Supabase, pengujian, serta integrasi dengan pekerjaan frontend dan AI Engineer. Setelah integrasi, pekerjaan berlanjut pada penyesuaian sumber data profil/dashboard dan pemeriksaan kuota Gemini API.

Dokumen ini menggabungkan prompt kerja yang direkonstruksi dengan catatan teknis dari percakapan. Untuk laporan akhir, status implementasi sebaiknya dicocokkan lagi dengan kode terbaru, hasil pengujian, dan riwayat Git. Jangan menyatakan fitur yang baru direncanakan atau baru disiapkan kodenya sebagai selesai tanpa verifikasi.
