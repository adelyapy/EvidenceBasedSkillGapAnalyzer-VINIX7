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

# LOG PROMPT MODUL 8 AI ENGINEER 1
## Proyek BUKTIVA — Evidence-Based Skill Gap Analyzer

**Periode:** Oktober 2026  
**Posisi:** AI Engineer 1  
**Proyek:** BUKTIVA (Evidence-Based Skill Gap Analyzer)  
**AI Assistant:** ChatGPT dan OpenAI Codex  
**Model AI Aplikasi:** Google Gemini  
**Teknologi:** Next.js, TypeScript, Supabase, Google GenAI SDK, Zod, GitHub API, dan ZIP Reader

---

# A. Pendahuluan

Log prompt ini merupakan dokumentasi penggunaan AI Assistant selama proses pengembangan sistem kecerdasan buatan pada proyek BUKTIVA.

BUKTIVA dikembangkan sebagai aplikasi analisis kesenjangan keterampilan berbasis bukti proyek. Aplikasi bertujuan mengidentifikasi keterampilan pengguna melalui proyek yang dikerjakan, melakukan validasi menggunakan lima pertanyaan, serta menghasilkan hasil analisis kompetensi dan rekomendasi pengembangan keterampilan.

Dalam pengembangan proyek, saya berperan sebagai AI Engineer 1 dengan tanggung jawab utama pada integrasi Gemini API, pemrosesan bukti proyek, ekstraksi keterampilan, validasi output AI, serta penyelarasan modul AI dengan kebutuhan backend dan frontend.

Penggunaan ChatGPT dan Codex dilakukan untuk mendukung analisis arsitektur, perencanaan milestone, implementasi kode, penyusunan pengujian, evaluasi hasil, dan identifikasi masalah teknis.

Seluruh output AI tetap memerlukan pemeriksaan dan pengujian sebelum dinyatakan berhasil.

---

# B. Dokumentasi Penggunaan Prompt AI

## Prompt 01 — Analisis Awal Struktur Proyek BUKTIVA

**Tujuan:** Memahami kondisi awal repository dan mengidentifikasi kebutuhan integrasi AI.

**Instruksi prompt:**

"Analisis seluruh struktur proyek BUKTIVA secara menyeluruh, termasuk frontend, backend, autentikasi, database, dependency, dan alur pengguna. Identifikasi modul yang sudah tersedia, fitur yang masih berupa simulasi, kendala teknis, serta kebutuhan untuk mengintegrasikan Gemini AI tanpa merusak implementasi frontend."

**Hasil penggunaan AI:**

- Menghasilkan inventaris awal sebanyak 267 file proyek.
- Mengidentifikasi bahwa aplikasi masih didominasi prototipe frontend.
- Mengidentifikasi penggunaan `sessionStorage` dan data simulasi.
- Menemukan potensi masalah validasi lima pertanyaan.
- Menemukan masalah konsistensi penghapusan PDF dan penyimpanan sesi.
- Menyusun rekomendasi arsitektur serta kebutuhan integrasi AI.

**Evaluasi:**

Hasil audit digunakan sebagai dasar pembagian milestone pengembangan AI agar implementasi dilakukan bertahap dan tidak langsung mengubah seluruh sistem.

**Status:** Selesai.

---

## Prompt 02 — Perencanaan Roadmap Integrasi Gemini

**Tujuan:** Menyusun tahapan pengembangan AI yang sesuai dengan struktur BUKTIVA.

**Instruksi prompt:**

"Berdasarkan kondisi proyek BUKTIVA dan ERD Supabase yang tersedia, susun roadmap teknis integrasi Gemini AI mulai dari koneksi API, pembacaan proyek GitHub dan ZIP, identifikasi keterampilan, validasi jawaban, perhitungan skill gap, hingga pembuatan learning roadmap. Tentukan dependency, arsitektur, pengujian, dan pembagian pekerjaan AI Engineer."

**Hasil penggunaan AI:**

Disusun tahapan pengembangan:

1. M1 — Gemini Connection.
2. M2 — Project Ingestion.
3. M3 — AnalysisInput dan Supabase Integration.
4. M4 — Evidence-Based Skill Extraction.
5. M5 — Five-Question Validation.
6. M6 — Competency Scoring.
7. M7 — Learning Roadmap.
8. M8 — Full-Stack AI Integration.

**Evaluasi:**

Roadmap tersebut menjadi acuan pengembangan modul AI, dengan pendekatan modular dan pengujian pada setiap milestone.

**Status:** Selesai.

---

## Prompt 03 — Milestone 1: Integrasi Gemini API

**Tujuan:** Menyiapkan koneksi Gemini pada lingkungan server BUKTIVA.

**Instruksi prompt:**

"Periksa implementasi awal `.env.local`, script pengujian Gemini, serta dependency proyek. Bangun modul Gemini server-side menggunakan Google GenAI SDK dengan validasi environment, error handling, endpoint pengujian development, dan pengujian otomatis. Pertahankan kode yang sudah tersedia."

**Hasil penggunaan AI:**

- Integrasi Google GenAI SDK.
- Pembuatan helper Gemini server.
- Pembuatan endpoint pengujian koneksi.
- Penambahan script pengujian.
- Pengamanan agar Gemini API key tidak digunakan langsung pada frontend.
- Pengujian modul Gemini.

**Hasil pengujian:** 7/7 pengujian internal dilaporkan lulus.

**Kendala:**

Pengujian generasi Gemini live pernah menghasilkan error HTTP 503/504. Keberhasilan koneksi dan metadata model belum membuktikan generasi konten berjalan stabil.

**Evaluasi:**

Fondasi koneksi Gemini tersedia, tetapi pengujian live masih menjadi pekerjaan lanjutan.

**Status:** Selesai untuk fondasi kode, dengan verifikasi generasi live yang belum tuntas pada tahap ini.

---

## Prompt 04 — Milestone 2: Project Ingestion

**Tujuan:** Membangun sistem pembacaan proyek pengguna dari GitHub publik dan ZIP.

**Instruksi prompt:**

"Implementasikan project ingestion untuk membaca repository GitHub publik dan file ZIP secara aman. Lakukan normalisasi data proyek, pembatasan ukuran dan jumlah file, filtering file yang tidak relevan atau sensitif, validasi path, serta pengujian menggunakan data sintetis dan repository publik."

**Hasil penggunaan AI:**

- GitHub Repository Reader.
- ZIP Reader.
- NormalizedProject Schema.
- Pembatasan ukuran dan jumlah file.
- Pemeriksaan path dan keamanan URL.
- Filtering file sensitif.
- Pengujian repository GitHub publik.
- Perbaikan temuan keamanan pada konfigurasi yang mengandung kemungkinan kredensial.

**Hasil pengujian:** 44/44 pengujian dilaporkan lulus setelah perbaikan regresi yang berkaitan dengan ingestion.

**Evaluasi:**

Modul ingestion menyediakan kemampuan membaca bukti proyek tanpa menjalankan source code pengguna.

Kemampuan offline tersebut belum otomatis berarti alur upload frontend dan penyimpanan ZIP privat Supabase sudah terhubung.

**Status:** Selesai untuk implementasi ingestion offline.

---

## Prompt 05 — Milestone 3: AnalysisInput dan Supabase Data Integration

**Tujuan:** Menghubungkan kontrak input analisis dengan struktur database dan benchmark target role.

**Instruksi prompt:**

"Bangun service AnalysisInput menggunakan struktur ERD Supabase yang tersedia. Implementasikan analysis repository, target role resolver, evidence resolver, dan input builder. Pastikan analisis terikat pada identitas pengguna, mendukung relasi skill serta role benchmark, dan tidak melakukan perubahan database sebelum schema serta RLS diverifikasi."

**Hasil penggunaan AI:**

- Analysis Repository.
- Target Role Resolver.
- Evidence Resolver.
- Analysis Input Builder.
- Pemetaan data evidence, skill, dan target role.
- Penanganan identifier `bigint` menggunakan representasi string.
- Pengujian kontrak AnalysisInput.

**Hasil pengujian:** 31/31 pengujian modul dilaporkan lulus.

**Kendala:**

Schema development, kebijakan RLS, dan penyimpanan ZIP privat belum sepenuhnya terverifikasi pada tahap ini.

**Evaluasi:**

M3 menghasilkan kontrak pemrosesan data yang digunakan sebagai fondasi untuk Skill Extraction M4.

**Status:** Selesai untuk implementasi offline dengan ketergantungan pada verifikasi Supabase live.

---

## Prompt 06 — Milestone 4: Evidence-Based Skill Extraction

**Tujuan:** Mengembangkan modul identifikasi kandidat keterampilan berdasarkan bukti proyek.

**Instruksi prompt:**

"Bangun Evidence-Based Skill Extraction menggunakan Gemini, dataset/rubrik Frontend Developer, Evidence Preparation, prompt terstruktur, output schema Zod, dan semantic validation. Setiap kandidat skill harus memiliki referensi bukti yang valid. Jangan menyimpulkan kompetensi atau level akhir hanya dari keberadaan teknologi dalam repository."

**Hasil penggunaan AI:**

- Dataset dan rubrik Frontend Developer.
- Evidence Preparation.
- Gemini Extraction Prompt.
- Structured Output Schema.
- Evidence Validator.
- Pemeriksaan referensi file dan kutipan.
- Pemisahan kandidat keterampilan dari kemampuan yang sudah tervalidasi.

**Hasil pengujian:** 49/49 pengujian offline dilaporkan lulus.

**Kendala:**

Pengujian live Gemini belum dijalankan pada tahap tersebut karena konfigurasi opt-in tidak aktif.

**Evaluasi:**

Modul ekstraksi sudah disiapkan dengan pendekatan berbasis bukti. Penggunaan modul oleh backend runtime tetap memerlukan integrasi lebih lanjut.

**Status:** Selesai secara offline.

---

## Prompt 07 — Milestone 5: Five-Question Validation

**Tujuan:** Mengembangkan mekanisme validasi keterampilan berdasarkan lima jawaban pengguna.

**Instruksi prompt:**

"Implementasikan service validasi lima pertanyaan BUKTIVA. Pastikan jumlah pertanyaan tepat lima, seluruh jawaban wajib lengkap, question ID valid, dan evaluasi menggunakan bukti proyek. Gunakan rubrik terstruktur dan Gemini evaluator. Jangan menghasilkan level kompetensi final tanpa kebijakan penilaian yang sah."

**Hasil penggunaan AI:**

- Validation Submission Schema.
- Question Context.
- Answer Evaluation Service.
- Provisional Competency Assessment.
- Validasi jumlah dan urutan jawaban.
- Pemeriksaan jawaban kosong.
- Pengujian respons Gemini menggunakan mock.

**Hasil pengujian:** 74/74 pengujian dilaporkan lulus.

**Evaluasi:**

Validasi lima jawaban berjalan dalam cakupan offline.

Pada pengembangan backend berikutnya, tim membuat lima pertanyaan dinamis melalui Gemini. Karena itu, kontrak M5 perlu dicocokkan dengan implementasi backend terbaru.

**Status:** Selesai secara offline; memerlukan rekonsiliasi dengan pertanyaan dinamis backend.

---

## Prompt 08 — Milestone 6: Competency Scoring

**Tujuan:** Menyiapkan penilaian keterampilan berdasarkan hasil validasi dan benchmark target role.

**Instruksi prompt:**

"Implementasikan Competency Scoring Engine untuk menghitung level keterampilan, gap, coverage, readiness, dan priority. Gunakan Scoring Policy yang berversi. Bedakan keterampilan yang belum dapat dinilai dari keterampilan yang benar-benar mempunyai gap. Jangan menghasilkan angka numerik pengguna nyata ketika policy masih draft."

**Hasil penggunaan AI:**

- Scoring Policy versi 0.1.0.
- Level Resolver.
- Gap Calculator.
- Coverage Evaluator.
- Readiness Calculator.
- Priority Ranker.
- CompetencyScoringResult.
- Pengujian kebijakan numerik menggunakan policy sintetis.

**Hasil pengujian:** 66/66 pengujian dilaporkan lulus.

**Keputusan teknis:**

Scoring Policy tetap berstatus `draft`. Nilai level, gap, dan readiness yang belum sah dipertahankan sebagai `null`.

**Evaluasi:**

Implementasi backend terbaru telah melaporkan hasil readiness numerik. Perbedaan tersebut perlu diaudit untuk memastikan kebijakan penilaian yang digunakan oleh runtime sesuai dengan keputusan tim.

**Status:** Selesai secara offline; scoring numerik runtime belum disahkan melalui M6.

---

## Prompt 09 — Milestone 7: Learning Roadmap Engine

**Tujuan:** Menghasilkan rekomendasi pengembangan keterampilan dari hasil penilaian.

**Instruksi prompt:**

"Bangun Learning Roadmap Engine yang terintegrasi dengan hasil Competency Scoring M6. Implementasikan roadmap policy, resource catalog, eligibility resolver, resource matcher, four-phase planner, success criteria builder, validator, dan service. Jangan memberikan aktivitas learning berbasis gap numerik jika scoring masih diblokir."

**Hasil penggunaan AI:**

- Roadmap Policy.
- Learning Resource Catalog.
- Eligibility Resolver.
- Resource Matcher.
- Four-Phase Planner.
- Success Criteria Builder.
- Output Validator.
- Roadmap Service.
- Pengujian duplikasi resource dan ketidaksesuaian prioritas.
- Dokumentasi mapping yang diusulkan ke Supabase.

**Hasil final review:**

- M7: 66/66 pengujian lulus.
- Regresi M1–M6: 271/271 pengujian lulus.
- Total: 337/337 pengujian lulus.
- ESLint, TypeScript, dan build lulus.
- Audit dependency produksi: 0 kerentanan yang dilaporkan.

**Keputusan teknis:**

Resource catalog menggunakan status `source_verified_pedagogy_pending`.

Roadmap berbasis kesenjangan numerik tetap diblokir jika belum terdapat Scoring Policy yang disetujui.

**Status:** PASS WITH CONDITIONS — Offline Roadmap Engine Complete, Personalized Numeric Roadmap Blocked.

---

## Prompt 10 — Milestone 8: Integrasi AI, Frontend, dan Backend

**Tujuan:** Menghubungkan modul M1–M7 dengan frontend, Gemini runtime, dan Supabase.

**Instruksi prompt:**

"Audit repository terbaru setelah sinkronisasi Git. Bangun atau gunakan API yang sudah tersedia untuk menghubungkan project ingestion, skill extraction, lima pertanyaan, evaluation, scoring, roadmap, persistence, dan history. Verifikasi autentikasi serta RLS sebelum mengaktifkan analisis live. Hindari duplikasi implementasi backend."

**Hasil penggunaan AI pada branch AI Engineer 1:**

- Audit struktur frontend setelah pull.
- Penambahan endpoint pemeriksaan kemampuan live.
- Pemisahan mode simulasi dan pemeriksaan live.
- Penandaan fitur demo.
- Perbaikan guard navigasi pertanyaan kelima.
- Pengujian integrasi sintetis M4–M7.
- Dokumentasi kesenjangan schema dan persistence.

**Hasil pengujian:**

- Regresi M1–M7: 337/337.
- Pengujian M8: 8/8.
- Total: 345/345 pengujian dilaporkan lulus.

**Kendala:**

Pada pelaksanaan M8 tersebut, Gemini live, schema privat, RLS dua akun, persistence, dan browser E2E belum terverifikasi secara lengkap.

**Evaluasi:**

M8 pada branch AI Engineer 1 masih bersifat partially completed. Implementasinya perlu disesuaikan dengan perubahan backend dan frontend yang kemudian tersedia di `main`.

**Status:** PARTIALLY COMPLETED.

---

## Prompt 11 — Pemeriksaan Supabase Development secara Read-Only

**Tujuan:** Memverifikasi sebagian schema Supabase tanpa mengubah database bersama.

**Instruksi prompt:**

"Lakukan introspeksi Supabase development hanya secara read-only. Periksa metadata tabel, kolom, tipe data, dan relasi yang dapat diakses menggunakan izin yang tersedia. Jangan menjalankan migration, operasi tulis, perubahan RLS, maupun akses administratif."

**Hasil penggunaan AI:**

- Sebagian metadata `target_roles`, `role_benchmarks`, dan `skills` berhasil diperiksa.
- Identifier katalog bertipe `bigint`.
- `required_level` bertipe numeric.
- Akses anonim ke tabel privat ditolak.
- Tidak ada bucket privat yang berhasil diverifikasi melalui akses anonim.
- Keterbatasan metadata privat dicatat untuk koordinasi backend.

**Evaluasi:**

Inspeksi memberikan konfirmasi awal bahwa sebagian kontrak M3 cocok dengan database development.

Tidak ada klaim bahwa semua constraint, kebijakan RLS, dan schema persistence telah terverifikasi.

**Status:** Selesai sesuai cakupan read-only yang tersedia.

---

## Prompt 12 — Audit Konflik Integrasi AI Engineer 1 dengan Backend

**Tujuan:** Mengidentifikasi potensi duplikasi antara modul AI modular dan implementasi backend terbaru.

**Instruksi prompt:**

"Bandingkan modul AI M1–M7 dengan endpoint backend terbaru, terutama validation-questions dan evaluate-analysis. Periksa kesesuaian Gemini provider, prompt, lima pertanyaan, evidence preparation, scoring policy, persistence, serta kemungkinan duplikasi layanan. Jangan mengubah kode sebelum memperoleh persetujuan backend/PM."

**Hasil analisis:**

Ditemukan perbedaan arsitektur yang perlu diselaraskan:

1. Backend memakai Gemini langsung melalui route handler.
2. Pipeline modular M1–M7 belum terdeteksi digunakan penuh pada runtime.
3. Backend membuat pertanyaan dinamis, sedangkan M5 awal memakai katalog pertanyaan tetap.
4. Backend menghasilkan readiness score, sementara Scoring Policy M6 masih draft.
5. Evidence preparation modular belum menjadi gerbang utama pemrosesan README GitHub.
6. Frontend masih mencampurkan sebagian data nyata dan demo.

**Evaluasi:**

Hasil audit menjadi dasar rekomendasi agar integrasi berikutnya berfokus pada penyatuan pipeline, bukan membuat ulang endpoint backend.

**Status:** Identifikasi risiko dan perencanaan rekonsiliasi.

---

## Prompt 13 — Investigasi Error Evaluasi AI

**Tujuan:** Menganalisis kegagalan saat pengguna menyelesaikan lima pertanyaan validasi.

**Instruksi prompt:**

"Analisis error ketika pengguna menekan tombol Selesai pada pertanyaan kelima. Periksa pemanggilan endpoint evaluate-analysis, respons HTTP, penggunaan response.json(), pemanggilan Gemini, dan kemungkinan kegagalan persistence. Pisahkan penyebab yang terbukti dari dugaan yang masih membutuhkan log server."

**Temuan pengujian manual:**

Pengguna berhasil mencapai pertanyaan kelima dan mengisi jawaban.

Ketika menekan tombol Selesai, frontend menampilkan:

`Failed to execute 'json' on 'Response': Unexpected end of JSON input`

Console browser sebelumnya juga mencatat HTTP 500 pada:

`POST /api/ai/evaluate-analysis`

**Hasil analisis:**

- Frontend sudah memiliki pemanggilan ke endpoint evaluasi.
- Evaluasi akhir pernah menghasilkan HTTP 500.
- Frontend gagal memproses respons sebagai JSON.
- Penyebab internal HTTP 500 belum berhasil dipastikan.
- Gemini, validasi output, dan penulisan Supabase merupakan bagian yang perlu diperiksa.
- Risiko evaluasi berulang dan penyimpanan parsial perlu diperhatikan.

**Tindak lanjut:**

Temuan perlu dikoordinasikan dengan backend/PM karena endpoint evaluasi merupakan bagian implementasi backend bersama.

**Status:** Investigasi awal selesai; akar kegagalan backend masih terbuka.

---

# C. Ringkasan Capaian Pekerjaan AI Engineer 1

| Milestone | Capaian utama | Status |
|---|---|---|
| M1 | Integrasi Gemini server dan pengujian koneksi | Fondasi selesai |
| M2 | GitHub dan ZIP Project Ingestion | Offline selesai |
| M3 | AnalysisInput dan data resolver | Offline selesai |
| M4 | Evidence-Based Skill Extraction | Offline selesai |
| M5 | Five-Question Validation | Offline selesai |
| M6 | Competency Scoring | Selesai dengan policy draft |
| M7 | Learning Roadmap Engine | PASS WITH CONDITIONS |
| M8 | Integrasi frontend, backend, dan AI | PARTIALLY COMPLETED |
| Audit integrasi | Identifikasi duplikasi AI dengan backend | Memerlukan penyelarasan |
| Debugging | Investigasi HTTP 500 evaluasi akhir | Perlu tindak lanjut backend |

# D. Pembelajaran dari Penggunaan AI Assistant

Selama pengembangan proyek BUKTIVA, terdapat beberapa pembelajaran penting.

**1. AI Assistant membantu mempercepat pengembangan modular.**

Dengan membagi pekerjaan menjadi milestone, implementasi dapat dilakukan bertahap dan setiap bagian diuji sebelum digunakan oleh bagian berikutnya.

**2. Output kode AI tetap membutuhkan pengujian.**

Kelulusan unit test tidak otomatis membuktikan integrasi Gemini dan Supabase live sudah berhasil. Oleh karena itu, pengujian offline, integration test, serta pengujian langsung perlu dibedakan.

**3. Integrasi membutuhkan koordinasi lintas peran.**

Pengembangan AI Engineer 1 dan backend menghasilkan modul yang saling berhubungan. Perbedaan kontrak pertanyaan, kebijakan scoring, dan pemanggilan Gemini perlu disepakati bersama agar tidak terjadi duplikasi.

**4. Keamanan perlu menjadi bagian dari setiap tahap.**

Pemrosesan repository pengguna, pemanggilan model, autentikasi, otorisasi, serta database memerlukan pembatasan yang jelas.

**5. Penggunaan AI tidak menggantikan keputusan teknis tim.**

ChatGPT dan Codex digunakan sebagai alat bantu analisis, implementasi, dan debugging. Keputusan mengenai API runtime, database bersama, Scoring Policy, serta penggabungan branch tetap dilakukan melalui koordinasi tim.

# E. Kesimpulan

Selama pengembangan BUKTIVA, saya menggunakan ChatGPT dan Codex sebagai alat bantu dalam perancangan arsitektur, implementasi modul AI, penyusunan pengujian, audit integrasi, serta investigasi kendala teknis.

Kontribusi utama pekerjaan AI Engineer 1 adalah membangun fondasi pipeline berbasis bukti, mulai dari Project Ingestion, AnalysisInput, Skill Extraction, Five-Question Validation, Competency Scoring, sampai Learning Roadmap Engine.

Milestone 1–7 telah menghasilkan rangkaian modul yang dilaporkan lulus 337 pengujian pada final review M7. Milestone 8 kemudian menghasilkan tambahan integrasi dan pengujian lokal dengan total 345 pengujian lulus, tetapi belum memenuhi seluruh persyaratan live pada branch AI Engineer 1.

Perkembangan backend berikutnya menunjukkan bahwa endpoint Gemini dan persistence sudah mulai berjalan. Namun, audit arsitektur menemukan bahwa pipeline modular AI Engineer 1 dan jalur AI runtime backend masih memerlukan penyelarasan.

Oleh karena itu, arah pengembangan berikutnya adalah melakukan rekonsiliasi implementasi AI dengan backend dan frontend terbaru, memperkuat validasi evidence serta output, memastikan kebijakan scoring konsisten, dan melanjutkan pengujian end-to-end.

Dokumentasi prompt ini menunjukkan bahwa penggunaan AI Assistant dilakukan sebagai bagian dari proses rekayasa perangkat lunak yang bertahap, dapat diuji, serta tetap membutuhkan evaluasi dan keputusan teknis dari pengembang.

---

**Status dokumen:** Draft dokumentasi Prompt Log AI Engineer 1  
**Batas dokumentasi:** Disusun dari riwayat instruksi, hasil Codex yang dilaporkan, audit repository, dan pengujian yang tersedia. Waktu setiap prompt dan kutipan verbatim perlu dicocokkan dengan riwayat Codex asli sebelum diserahkan sebagai log historis final.