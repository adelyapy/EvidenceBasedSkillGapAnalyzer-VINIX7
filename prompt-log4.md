# Prompt Log — Modul 6 HTML5 BUKTIVA

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
