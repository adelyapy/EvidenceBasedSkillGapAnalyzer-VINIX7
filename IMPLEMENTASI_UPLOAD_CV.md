# Implementasi F-11 — Upload CV BUKTIVA

Dibuat berdasarkan screenshot Figma yang diberikan dan struktur `index_uploadcv.html` serta `PRD_BUKTIVA_Bagian_1-9.md` (F-11, F-12, F-16; §8.2–8.3).

## Menjalankan

```bash
npm install
npm run dev
```

- **Next.js:** `http://localhost:3000/upload-cv`
- **Preview tampilan Figma dengan checklist terisi (data simulasi):** `http://localhost:3000/upload-cv?demo=1`
- **HTML statis:** buka `index_uploadcv.html` melalui server lokal (misalnya Live Server). URL `?demo=1` menampilkan preview yang sama.

`?demo=1` hanya pratinjau visual; status proyek dan target role yang dicentang dalam mode itu bukan hasil input riil.

## File penting

- `src/app/upload-cv/page.tsx`: route Next.js baru.
- `src/components/analysis/UploadCvPage.tsx`: komponen interaktif (sidebar, stepper, unggah CV, kelengkapan dan navigasi).
- `src/components/analysis/uploadCv.css`: CSS responsif, terisolasi dari halaman auth/landing.
- `index_uploadcv.html`, `assets/css/upload-cv.css`, `assets/js/upload-cv.js`: implementasi HTML statis sesuai desain yang sama.
- `assets/js/analysis-inputs.js`: menyimpan metadata dari form proyek dan target role HTML lama agar dapat dicek pada langkah CV serta dibaca di review.
- `public/*.html`, `public/assets`: salinan statis untuk menavigasi halaman HTML lama dari aplikasi Next.js sampai semua langkah dipindahkan ke Next.

## Perilaku dan batasan

- Klik atau drag-and-drop **satu PDF**, ekstensi `.pdf`, tipe MIME PDF bila tersedia, tidak kosong, ukuran **maksimal 3 MiB**.
- Kesalahan format/ukuran ditampilkan; file terpilih dapat diganti atau dihapus.
- CV **opsional**. Pengguna tetap dapat melanjutkan tanpa CV jika minimal satu proyek dan satu target role sudah tercatat.
- State disimpan di **`sessionStorage`** browser saat tab aktif: `buktiva.analysis.projects`, `buktiva.analysis.targetRole`, `buktiva.analysis.jobDescription`, `buktiva.analysis.cv`.
- **Hanya nama, ukuran, dan tipe CV yang disimpan.** Berkasnya tidak dikirim ke server, tidak diparsing AI, dan tidak dapat dipulihkan setelah reload. Untuk fase backend perlu implementasi upload terautentikasi.
- Deskripsi pekerjaan opsional sesuai PRD; ketiadaannya tidak menghalangi kelanjutan.
- Dari Next.js, tombol **Kembali** membuka `/target-role.html?next=1`, tombol **Lanjutkan** ke `/index_review_input.html?next=1`. Setelah langkah HTML lama di-porting ke Next, ubah tautan ini menjadi route baru.
- Pengujian manual: cek lebar desktop ~1080px dan smartphone; coba PDF valid, `.png`, PDF 4 MB, hapus CV, skip CV, unggah via drag-drop, tombol kembali/lanjut, tampilan tanpa prasyarat, dan `?demo=1`.

## Catatan untuk tim

UI ini tahap frontend sesuai PRD. Integrasi ke API, autentikasi, penyimpanan blob, parsing dokumen, dan AI bukan bagian dari implementasi ini. Komponen auth/landing tidak diubah.

## Hasil pemeriksaan

- `tsc --noEmit` dan ESLint pada komponen Upload CV: lolos.
- Browser pratinjau HTML/CSS: ukuran 1080 × 765 px dan 390 px, tanpa scroll horizontal pada mobile.
- Uji frontend unggah via pemilih file: valid PDF, format selain PDF, PDF lebih dari 3 MiB, dan penghapusan pilihan: lolos.
- Build server Next.js secara penuh **belum dijalankan** di lingkungan pemeriksaan karena arsip aslinya menyertakan dependensi SWC untuk Windows, sedangkan pengambilan paket Linux terkendala jaringan. Jalankan `npm install` lalu `npm run build` di perangkat pengembangan yang memiliki akses paket npm.
