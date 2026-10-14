# PRODUCT REQUIREMENTS DOCUMENT (PRD)

# BUKTIVA

*Evidence-Based Skill Gap Analyzer*

## Informasi Dokumen

| Informasi | Keterangan |
|---|---|
| Nama produk | BUKTIVA — Evidence-Based Skill Gap Analyzer |
| Jenis dokumen | Product Requirements Document (PRD), bagian 1–9 |
| Tim | Kelompok 3 — Web & UI/UX Developer, VINIX7 |
| Dasar penyusunan | Hasil perancangan Modul 1–6: ideasi, riset pengguna, persona, user flow, wireframe, UI prototype, dan implementasi struktur HTML |
| Status | Draf kerja untuk implementasi frontend Modul 7; bagian 10–11 akan dilengkapi kemudian |
| Tautan Figma Modul 5 | https://www.figma.com/design/UVAFASV8FI30S6IFXKWUQU/VINIX7-DESIGN-UI?node-id=207-101&t=4u0zQ0JJCLAXJXPG-1 |
| Repositori GitHub | https://github.com/adelyapy/EvidenceBasedSkillGapAnalyzer-VINIX7 |


# 1. Ringkasan Produk

BUKTIVA adalah rancangan platform web Evidence-Based Skill Gap Analyzer yang membantu mahasiswa tingkat akhir dan fresh graduate memahami kesiapan kompetensi mereka terhadap posisi pekerjaan yang dituju. Berbeda dari pendekatan yang hanya mengandalkan klaim keterampilan pada CV, BUKTIVA menempatkan bukti proyek sebagai konteks utama untuk menggambarkan pengalaman dan kompetensi pengguna.

Alur produk yang dirancang dimulai dari memasukkan bukti proyek (misalnya repository GitHub/GitLab, portofolio, tautan deployment, atau laporan PDF), menentukan target role atau menambahkan deskripsi pekerjaan, meninjau informasi yang dimasukkan, menjawab pertanyaan validasi yang dirancang berdasarkan proyek, lalu melihat ringkasan kompetensi, skill gap, prioritas peningkatan, dan roadmap pembelajaran.

Untuk pelaksanaan Modul 7, fokus pengembangan adalah mengubah rancangan Figma menjadi website frontend yang responsif dan memiliki interaksi yang dapat diuji. PRD ini tidak menganggap bahwa backend, database, autentikasi sungguhan, atau integrasi model AI wajib selesai pada tahap ini. Data dan hasil analisis yang belum memiliki layanan pendukung dapat ditampilkan sebagai data dummy/simulasi yang diberi penanda secara jelas.


## 1.1 Tujuan Produk

- Membantu pengguna menghubungkan bukti proyek yang pernah dikerjakan dengan kompetensi yang relevan.
- Memberi gambaran awal mengenai perbedaan antara kompetensi yang ditunjukkan dan kebutuhan target pekerjaan.
- Menyediakan arah pengembangan keterampilan melalui rekomendasi dan roadmap belajar yang mudah dipahami.
- Menyajikan alur penggunaan yang jelas, mulai dari pengenalan produk hingga tampilan hasil analisis.

## 1.2 Nilai Utama Produk

Nilai utama BUKTIVA adalah pendekatan evidence-first: proyek dan penjelasan pengguna menjadi konteks penilaian, bukan sekadar daftar skill pada CV. Hasil yang dituju adalah pemahaman kompetensi yang lebih terstruktur, identifikasi gap yang lebih kontekstual, dan rekomendasi belajar yang berhubungan dengan target karier.


# 2. Latar Belakang dan Konteks Masalah

Berdasarkan proses riset dan perancangan pada Modul 1–4, mahasiswa tingkat akhir dan fresh graduate kerap menghadapi kesulitan ketika menilai apakah kemampuan yang dimiliki sudah sesuai dengan kebutuhan pekerjaan entry-level. Persyaratan lowongan dapat berisi banyak keterampilan, sedangkan pengguna belum selalu memiliki tolok ukur yang jelas untuk membedakan antara pernah menggunakan teknologi dan benar-benar memahami penerapannya.

Temuan riset pengguna juga menunjukkan pola kebutuhan berupa kejelasan kompetensi, pemahaman tentang keterampilan yang masih kurang, serta arahan untuk menentukan prioritas belajar. Pengguna saat ini dapat memeriksa CV, sertifikat, portofolio, mencari lowongan melalui media sosial atau platform profesional, mengikuti tutorial, dan meminta pendapat orang lain. Namun, proses tersebut belum tentu menyatukan bukti proyek, kebutuhan posisi, validasi pemahaman, dan rencana belajar ke dalam satu alur.


## 2.1 Pernyataan Masalah

Mahasiswa tingkat akhir dan fresh graduate yang sedang mempersiapkan lamaran kerja membutuhkan cara yang lebih terarah untuk memahami kompetensi aktual mereka berdasarkan proyek yang pernah dikerjakan, membandingkannya dengan kebutuhan role yang dituju, dan menentukan keterampilan yang perlu dikembangkan.


## 2.2 Peluang Solusi

BUKTIVA dirancang untuk menghubungkan evidence proyek, validasi pemahaman, profil kompetensi, perbandingan kebutuhan role, dan roadmap pengembangan dalam satu pengalaman web. Pada tahap frontend Modul 7, alur dan antarmuka tersebut perlu dapat ditelusuri serta diuji meskipun beberapa proses masih menggunakan simulasi.


# 3. Target Pengguna dan Persona


## 3.1 Target Pengguna Utama

| Aspek | Deskripsi |
| --- | --- |
| Segmen | Mahasiswa tingkat akhir dan fresh graduate di Indonesia. |
| Kondisi | Sedang mempersiapkan lamaran kerja, magang, atau transisi menuju pekerjaan entry-level. |
| Modal awal | Memiliki setidaknya satu proyek, repository, portofolio, deployment, laporan proyek, atau bukti pengalaman relevan. |
| Kebutuhan | Menilai kompetensi secara lebih terstruktur, mengetahui skill gap, menentukan prioritas, dan memperoleh arahan belajar. |
| Perangkat | Mengakses platform melalui browser desktop maupun perangkat mobile; tampilan perlu menyesuaikan ukuran layar. |


## 3.2 Persona Representatif

| Elemen Persona | Rangkuman |
| --- | --- |
| Tujuan | Memahami kesiapan diri untuk posisi tertentu dan mempersiapkan diri sebelum melamar. |
| Perilaku | Mencari lowongan, membaca persyaratan, memeriksa CV/portofolio, mengikuti tutorial, serta membandingkan kemampuan secara mandiri. |
| Kesulitan | Tidak yakin terhadap tingkat penguasaan skill; sulit menghubungkan proyek dengan persyaratan lowongan; bingung menentukan prioritas belajar. |
| Kebutuhan fungsional | Input bukti proyek, memilih target role, meninjau data, menjawab pertanyaan, dan melihat ringkasan hasil serta roadmap. |
| Hasil yang diharapkan | Gambaran kompetensi yang lebih jelas, daftar gap yang dapat diprioritaskan, dan langkah belajar yang realistis. |

Persona utama PRD ini mewakili mahasiswa tingkat akhir atau fresh graduate yang telah mengerjakan satu atau beberapa proyek tetapi belum yakin apakah pengalaman tersebut cukup untuk memenuhi kualifikasi pekerjaan yang diincar.

Catatan: persona di atas merupakan persona representatif yang disintesis dari hasil riset pengguna pada Modul 3, bukan identitas satu narasumber tertentu. Ragam latar belakang pendidikan narasumber tidak mengubah fokus produk pada kebutuhan umum mahasiswa tingkat akhir dan fresh graduate.


# 4. Tujuan, Manfaat, dan Indikator Keberhasilan


## 4.1 Tujuan Pengalaman Pengguna

- Pengguna dapat memahami fungsi BUKTIVA tanpa harus mencoba seluruh fitur terlebih dahulu.
- Pengguna dapat menemukan alur analisis dan memahami informasi yang perlu disiapkan.
- Pengguna dapat mengikuti alur prototipe dari input proyek menuju target role, review input, pertanyaan validasi, dan hasil.
- Pengguna dapat memahami perbedaan antara skill yang ditampilkan sebagai kekuatan dan skill yang masih perlu dikembangkan.

## 4.2 Indikator Keberhasilan

| Indikator | Target | Cara Pemeriksaan |
| --- | --- | --- |
| Penyelesaian tugas | ≥ 80% pengguna uji berhasil menyelesaikan skenario utama. | Observasi usability test dari input proyek hingga melihat hasil simulasi. |
| Pemahaman hasil | ≥ 80% pengguna uji memahami informasi utama pada halaman hasil. | Pertanyaan singkat setelah pengguna melihat hasil. |
| Relevansi pertanyaan validasi | ≥ 80% pengguna uji menilai pertanyaan relevan dengan proyek. | Penilaian pengguna setelah menyelesaikan skenario pertanyaan. |
| Usability | Skor SUS minimal 70. | Kuesioner System Usability Scale bila pengujian dilakukan. |
| Kualitas implementasi frontend | Tidak ada error runtime yang menghentikan alur utama; minimal dua aksi interaktif dinamis berfungsi. | Pengujian manual pada browser dan ukuran layar berbeda. |
| Kesesuaian desain | Halaman utama dan alur prioritas sesuai dengan Figma Modul 5. | Pemeriksaan visual berdampingan dengan desain Figma. |

Indikator berikut mengacu pada target usability yang dicatat dalam perancangan riset Modul 2. Indikator ini merupakan target evaluasi, bukan klaim bahwa pengujian telah selesai dilakukan.

Untuk implementasi Modul 7, indikator yang dapat diverifikasi langsung adalah fungsi navigasi dan interaksi frontend, responsivitas, keterbacaan konten, serta tidak adanya crash/runtime error. Keberhasilan AI atau akurasi analisis tidak boleh diklaim jika prosesnya masih berupa simulasi.


# 5. Ruang Lingkup Produk


## 5.1 Termasuk dalam Ruang Lingkup

- Implementasi frontend berdasarkan desain Figma Modul 5 dengan penyesuaian seperlunya agar konsisten dan dapat digunakan.
- Halaman publik: Beranda/Landing Page, Tentang BUKTIVA, Cara Kerja, Team Kami, dan footer.
- Halaman akses akun: Login, Register, dan Reset Password sebagai antarmuka.
- Halaman setelah masuk: Dashboard, Analisa Baru/Input Proyek, Target Role, Upload CV opsional, Review Input, pertanyaan validasi, Hasil Analisis, Riwayat Analisis, dan halaman pendukung yang sudah dirancang pada Modul 5–6.
- Navigasi ant halaman, tombol kembali/lanjut, menu, form input, pilihan target role, validasi input dasar, pencarian/filter jika ditampilkan, dan interaksi penting lain yang dapat dijalankan di sisi frontend.
- Data dummy atau state frontend untuk mensimulasikan riwayat, statistik, pertanyaan, hasil analisis, skill gap, dan roadmap.
- Tampilan responsif, penanganan kondisi kosong/invalid sederhana, dan dokumentasi implementasi.

## 5.2 Di Luar Ruang Lingkup untuk Tahap Ini

- Backend/API produksi, database persisten, sistem manajemen akun, dan autentikasi nyata.
- Integrasi OAuth/Google Sign-In yang benar-benar memverifikasi identitas.
- Pengiriman email reset password dan perubahan kata sandi yang benar-benar berjalan.
- Pengambilan data repository/portofolio secara otomatis dari layanan eksternal.
- Pemrosesan unggahan PDF di server dan ekstraksi isi dokumen secara nyata.
- Integrasi model AI produksi untuk membaca proyek, membuat pertanyaan adaptif, menilai jawaban, atau menghasilkan rekomendasi.
- Penyimpanan permanen lintas perangkat atau lintas sesi; data simulasi tidak boleh dipresentasikan sebagai data pengguna nyata.
Batasan ini bukan berarti fitur tersebut tidak menjadi bagian dari visi produk. Fitur-fitur tersebut tetap tergambar dalam konsep dan prototype, tetapi implementasi Modul 7 diprioritaskan pada frontend yang responsif dan interaktif sesuai arahan tahap pengerjaan.


# 6. Fitur dan Kebutuhan Fungsional

| ID | Fitur | Kebutuhan fungsional | Prioritas |
| --- | --- | --- | --- |
| F-01 | Landing Page | Memperkenalkan BUKTIVA, nilai utama, CTA, dan navigasi menuju bagian Tentang, Cara Kerja, Login, dan Register. | Prioritas tinggi |
| F-02 | Tentang BUKTIVA | Menjelaskan konsep evidence-based skill analysis, penggunaan AI dalam visi produk, hasil terstruktur, dan target pengguna. | Prioritas tinggi |
| F-03 | Cara Kerja | Menjelaskan empat tahap: masukkan proyek, validasi, lihat skill gap, dan dapatkan roadmap. | Prioritas tinggi |
| F-04 | Team Kami & Footer | Menampilkan lima anggota tim, peran, tautan profil yang tersedia, navigasi, informasi bantuan/kontak, dan kebijakan privasi sebagai informasi antarmuka. | Prioritas menengah |
| F-05 | Login | Menyediakan field email dan kata sandi, tombol masuk, tautan reset kata sandi, tautan register, serta tombol Google sebagai elemen UI (simulasi bila belum terintegrasi). | Prioritas tinggi |
| F-06 | Register | Menyediakan nama lengkap, email, kata sandi, konfirmasi kata sandi, validasi dasar, dan navigasi ke login. | Prioritas tinggi |
| F-07 | Reset Password | Menerima email dan menampilkan feedback simulasi setelah tombol kirim tautan ditekan; tidak mengirim email sungguhan. | Prioritas menengah |
| F-08 | Dashboard | Menampilkan ringkasan aktivitas, skill, skill gap, rekomendasi belajar, roadmap, dan analisis terbaru menggunakan data simulasi. | Prioritas tinggi |
| F-09 | Analisa Baru / Input Proyek | Menerima tautan GitHub/GitLab, portofolio, deployment, atau pilihan unggah PDF; menampilkan daftar proyek yang dimasukkan atau status input. | Prioritas tinggi |
| F-10 | Target Role | Memungkinkan pengguna memilih role seperti Frontend Developer, Backend Developer, Mobile Developer, Data Analyst, UI/UX Designer, atau DevOps Developer, serta memasukkan deskripsi pekerjaan opsional. | Prioritas tinggi |
| F-11 | Upload CV Opsional | Menyediakan area unggah CV opsional dan status kelengkapan input; pada frontend dapat berupa simulasi unggah. | Prioritas menengah |
| F-12 | Review Input | Merangkum proyek, target role, deskripsi pekerjaan, dan CV opsional agar pengguna dapat meninjau data sebelum melanjutkan. | Prioritas tinggi |
| F-13 | Pertanyaan Validasi | Menampilkan rangkaian lima pertanyaan seputar proyek, keputusan teknis, kontribusi pribadi, kendala, dan solusi; jawaban dapat disimpan sementara dalam state frontend. | Prioritas tinggi |
| F-14 | Hasil Analisis | Menampilkan skor keseluruhan simulasi, skill yang tampak dikuasai, bukti proyek, gap, rekomendasi, dan opsi unduh laporan jika tersedia secara frontend. | Prioritas tinggi |
| F-15 | Riwayat Analisis | Menampilkan data dummy berisi proyek, target role, teknologi, tanggal, skill match, dan status; sediakan pencarian/filter/pengurutan jika tercantum pada desain. | Prioritas menengah |
| F-16 | Navigasi Alur | Menyediakan aksi kembali/lanjut, navigasi antarhalaman, dan penanganan input yang belum lengkap. | Prioritas tinggi |


## 6.1 Perilaku dan Validasi Antarmuka

- Field wajib diberi label yang jelas dan tidak hanya mengandalkan placeholder.
- Email harus memiliki format yang wajar; kata sandi dan konfirmasi kata sandi perlu diperiksa kesesuaiannya di sisi frontend.
- Jika input utama belum lengkap, pengguna memperoleh pesan yang menjelaskan apa yang perlu diperbaiki.
- Tombol utama menunjukkan aksi yang konsisten dengan labelnya dan tidak dibiarkan sebagai elemen dekoratif.
- Jika fitur hanya simulasi, feedback antarmuka harus menggunakan bahasa yang tidak menyesatkan, misalnya “simulasi berhasil” atau “contoh hasil analisis”.
- Navigasi dari satu langkah ke langkah berikutnya harus mempertahankan data sementara selama alur berlangsung sejauh memungkinkan.

# 7. User Stories dan Kriteria Penerimaan

| ID | User story | Kriteria penerimaan |
| --- | --- | --- |
| US-01 | Sebagai pengunjung, saya ingin memahami fungsi BUKTIVA agar dapat menilai apakah platform ini sesuai dengan kebutuhan saya. | Informasi utama dan CTA tampil; navigasi ke Tentang, Cara Kerja, Login, dan Register berfungsi. |
| US-02 | Sebagai mahasiswa/fresh graduate, saya ingin mengetahui tahapan kerja BUKTIVA agar memahami proses sebelum memulai analisis. | Empat tahapan ditampilkan dengan urutan jelas dan dapat diakses melalui navigasi/scroll. |
| US-03 | Sebagai pengguna, saya ingin mengisi informasi proyek agar proyek tersebut dapat menjadi konteks analisis kompetensi. | Form menyediakan input tautan dan/atau unggahan; input invalid atau kosong ditangani dengan pesan yang jelas. |
| US-04 | Sebagai pengguna, saya ingin memilih target role agar informasi hasil dapat diarahkan ke posisi yang ingin saya tuju. | Pilihan role dapat dipilih; deskripsi pekerjaan bersifat opsional; pilihan terlihat pada tahap review. |
| US-05 | Sebagai pengguna, saya ingin memeriksa ulang data sebelum lanjut agar dapat memperbaiki kesalahan input. | Halaman review merangkum input utama dan menyediakan aksi kembali untuk mengubah data. |
| US-06 | Sebagai pengguna, saya ingin menjawab pertanyaan terkait proyek agar dapat menunjukkan kontribusi dan pemahaman saya. | Pertanyaan ditampilkan bertahap; jawaban dapat dimasukkan; indikator progres dan navigasi kembali/lanjut berfungsi. |
| US-07 | Sebagai pengguna, saya ingin melihat ringkasan kompetensi dan skill gap agar mengetahui area yang perlu ditingkatkan. | Halaman hasil menampilkan ringkasan skor, skill, gap, bukti pendukung, dan rekomendasi sebagai hasil simulasi bila AI belum terhubung. |
| US-08 | Sebagai pengguna, saya ingin melihat riwayat analisis agar dapat meninjau contoh analisis sebelumnya. | Daftar riwayat tampil dari data dummy; pencarian/filter yang ditampilkan bekerja di frontend. |
| US-09 | Sebagai pengguna, saya ingin menggunakan website di layar desktop maupun mobile agar dapat mengakses alur dengan nyaman. | Layout menyesuaikan ukuran layar; tidak ada konten utama terpotong atau scroll horizontal yang tidak diperlukan. |
| US-10 | Sebagai pengunjung, saya ingin dapat berpindah dari login ke register atau reset password agar menemukan alur akun yang sesuai. | Semua tautan terkait mengarah ke halaman yang benar; proses autentikasi dan email tetap dinyatakan sebagai simulasi. |


# 8. Alur Pengguna dan Skenario Utama


## 8.1 Alur Pengunjung

Beranda → Tentang/Cara Kerja (opsional) → pilih Masuk atau Daftar.


## 8.2 Alur Analisis Kompetensi

1. Pengguna membuka Dashboard dan memilih Analisa Baru.
1. Pengguna memasukkan bukti proyek melalui tautan repository/portofolio/deployment atau memilih unggah dokumen.
1. Pengguna memilih target role dan, bila diperlukan, menambahkan deskripsi pekerjaan.
1. Pengguna menambahkan CV bila ingin; tahap ini bersifat opsional.
1. Pengguna meninjau ringkasan input dan kembali ke langkah sebelumnya bila ada informasi yang perlu diperbaiki.
1. Pengguna mengisi lima pertanyaan validasi terkait proyek dan kontribusinya.
1. Pengguna melanjutkan ke halaman Hasil Analisis untuk melihat ringkasan skill, skill gap, prioritas, dan roadmap dalam bentuk data simulasi jika belum ada layanan AI.
1. Hasil dapat ditinjau kembali melalui Riwayat Analisis jika alur demo frontend mendukung penyimpanan state sementara atau data dummy.

## 8.3 Skenario Alternatif dan Penanganan Kesalahan

| Kondisi | Perilaku yang diharapkan |
| --- | --- |
| Input proyek belum diisi | Tampilkan pesan validasi dan tahan pengguna agar tidak melanjutkan ke tahap berikutnya. |
| Tautan tidak memiliki format yang sesuai | Tampilkan pesan bahwa format perlu diperiksa; tidak perlu melakukan verifikasi repository sungguhan pada tahap frontend. |
| Target role belum dipilih | Tampilkan pengingat untuk memilih role sebelum review. |
| CV dilewati | Pengguna tetap dapat melanjutkan karena CV bersifat opsional. |
| Jawaban pertanyaan belum diisi | Tandai pertanyaan yang belum lengkap dan jelaskan tindakan yang diperlukan. |
| Pengguna kembali ke langkah sebelumnya | Pertahankan input sementara jika state frontend telah diterapkan. |
| Hasil analisis merupakan data contoh | Berikan label simulasi/contoh agar tidak dianggap sebagai hasil evaluasi AI aktual. |
| Layar berukuran kecil | Navigasi dan konten menyesuaikan layout; menu dapat berubah menjadi drawer/menu ringkas bila sesuai desain. |


# 9. Kebutuhan Nonfungsional dan Batasan Implementasi


## 9.1 Responsivitas dan Konsistensi Visual

- Antarmuka harus dapat digunakan pada desktop, tablet, dan mobile tanpa kehilangan fungsi utama.
- Implementasi mengacu pada struktur, hierarki informasi, warna, tipografi, komponen, ilustrasi, dan jarak visual di Figma Modul 5.
- Jika desain perlu disesuaikan untuk layar kecil, perubahan tidak boleh menghilangkan informasi atau mengubah urutan proses utama.

## 9.2 Aksesibilitas dan Kemudahan Penggunaan

- Gunakan struktur heading yang berurutan, elemen HTML semantik, label form, teks alternatif gambar yang bermakna, dan fokus keyboard yang terlihat.
- Pastikan teks dan tombol cukup terbaca serta memiliki kontras yang memadai.
- Pesan error harus menjelaskan masalah dan langkah perbaikannya, bukan hanya mengandalkan warna.

## 9.3 Kinerja dan Stabilitas

- Halaman utama dan aset visual dioptimalkan agar tidak memperlambat pemuatan secara berlebihan.
- Tidak ada error runtime yang membuat alur utama berhenti atau halaman gagal digunakan.
- Navigasi dan aksi interaktif yang menjadi bagian dari demonstrasi harus diuji secara manual.

## 9.4 Teknologi dan Lingkungan Implementasi

Teknologi implementasi frontend mengikuti keputusan tim dan ketentuan Modul 7. Dokumen ini tidak mengunci framework tertentu. HTML, CSS, dan JavaScript maupun framework frontend dapat digunakan sepanjang hasilnya memenuhi desain, responsivitas, interaksi, dan ketentuan repository. Backend, database, serta integrasi AI tidak menjadi prasyarat untuk lingkup frontend yang ditetapkan di sini.


## 9.5 Data, Privasi, dan Keamanan pada Prototipe

- Hindari meminta pengguna memasukkan data pribadi sensitif untuk kebutuhan demo.
- Jangan menampilkan kata sandi yang dimasukkan; field kata sandi menggunakan tipe input yang sesuai.
- Jangan menyatakan data tersimpan secara permanen apabila hanya dikelola pada state browser atau data dummy.
- Jangan mengklaim autentikasi, pemrosesan dokumen, atau analisis AI telah berjalan nyata apabila belum terintegrasi.

## 9.6 Batasan yang Diketahui

Dokumen ini mendefinisikan kebutuhan produk dan perilaku frontend, bukan spesifikasi teknis backend. Keberhasilan implementasi dinilai berdasarkan kesesuaian desain, kelengkapan alur prioritas, responsivitas, interaksi yang berfungsi, penanganan keadaan kosong/error dasar, dan kestabilan demo. Hasil analisis contoh harus diberi label yang jelas.


# Catatan Bagian Berikutnya

PRD ini sengaja disusun sampai Bagian 9 sesuai permintaan. Bagian 10–11 belum ditambahkan dan akan dilengkapi setelah kebutuhan serta arahan berikutnya tersedia.


---

*BUKTIVA | PRD Modul 7 — Bagian 1–9*
