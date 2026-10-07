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
