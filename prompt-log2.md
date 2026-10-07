# Prompt log — Modul 6

## Permintaan pengguna
Ubah proyek BUKTIVA menjadi HTML5 murni tanpa JavaScript dan CSS, pertahankan konten, lima pertanyaan, gambar, label, hierarki heading, serta jalur aset relatif. Hubungkan pertanyaan 1–5 ke hasil dengan formulir GET dan penanda konten.

## Perubahan
- Mengedit pertanyaan-validasi.html serta pertanyaan-validasi-2.html hingga pertanyaan-validasi-5.html langsung.
- Menghapus seluruh script inline, penyimpanan sessionStorage/window.name, penghitung karakter, validasi trim, status dinamis, dan pemulihan scroll. Tidak ditemukan file .js, stylesheet, framework visual, ataupun CSS pada proyek awal.
- Mempertahankan pertanyaan, tips, identitas BUKTIVA/Adelya, gambar dan alt, serta struktur header/main/aside/footer.
- Menggunakan form action="file-berikutnya.html#pertanyaan" method="get" dan button type="submit". Pertanyaan 5 menuju hasil-validasi.html#hasil.
- GET merupakan penyesuaian dari contoh form action="#" method="post" pada modul agar alur antarfile statis dapat berjalan tanpa backend.
- Kembali berupa tautan ke file sebelumnya dengan #pertanyaan; pertanyaan pertama tidak memiliki Kembali.
- Setiap textarea memiliki label for/id, name, required, dan maxlength="1000". Teks batas tetap “Maksimal 1.000 karakter”; progress bernilai tetap 1/5 hingga 5/5.
- Menambahkan hasil-validasi.html karena halaman hasil tidak tersedia pada proyek awal. Skor sementara 85 dari 100 merupakan asumsi contoh, bukan skor dari desain yang telah diverifikasi: desain/nama file/skor asli tidak tersedia dan klarifikasi belum diterima saat implementasi. Halaman menyatakan skor bukan perhitungan jawaban pengguna.
- Menambahkan petunjuk menu Cetak browser atau Ctrl+P lalu Simpan sebagai PDF.
- Mengganti tautan Dashboard, Analisa Baru, Riwayat Analisis, Profile, Notifikasi, Adelya, dan Keluar dengan tombol disabled beserta keterangan karena file tujuan belum tersedia. Gambar logo tidak lagi dibungkus tautan ke index.html yang tidak tersedia.
- Tidak memakai tabel untuk tata letak atau atribut presentasional usang. Tampilan memakai bawaan browser.

## Pemeriksaan pada 7 Oktober 2026
- Pemeriksaan sumber enam HTML lulus: tidak ada script, style, event handler, URL javascript:, stylesheet, atribut bgcolor/align, maupun tabel tata letak.
- Seluruh href/action dan target fragmen diperiksa terhadap file serta id tujuan: lulus.
- Uji Chrome headless pada file lokal lulus untuk 1 → 2 → 3 → 4 → 5 → hasil, termasuk #pertanyaan/#hasil.
- Browser memverifikasi jawaban kosong memicu validity.valueMissing dan menolak submit pada lima halaman. Label, name, maxlength, serta progress diperiksa.
- Browser memverifikasi Kembali tetap berjalan saat textarea kosong; pertanyaan pertama tidak memiliki tombol/tautan Kembali.
- Jawaban yang hanya berisi spasi diterima oleh required bawaan; tidak ada klaim bahwa spasi ditolak.
- Dua aset belum tersedia: ./assets/images/logo-buktiva.png dan ./assets/images/adelya.webp. Jalur dan alt asli dipertahankan; gambar pengganti tidak dibuat.
- Validasi resmi W3C belum dilakukan. Pemeriksaan lokal dan pengujian browser bukan bukti validasi W3C.

## Keterbatasan HTML murni
- Jawaban tidak disimpan atau dipulihkan oleh aplikasi ketika berpindah halaman. GET membawa jawaban halaman yang dikirim sebagai parameter URL; halaman tujuan tidak membaca atau menggabungkan parameter tersebut.
- Tidak ada backend, analisis AI, perhitungan skor/persentase, atau ringkasan jawaban dinamis.
- Penanda fragmen mengarahkan navigasi ke bagian konten; posisi scroll persis tidak dijamin.
- Fitur akun yang belum memiliki file tujuan tetap disabled.
- Kesesuaian skor hasil dengan desain asli dan keberadaan kedua gambar belum dapat dipenuhi tanpa materi asli.

Pengujian memakai skrip sementara di luar proyek. Keenam halaman tidak memuat JavaScript pengujian.