# Milestone 1 — Koneksi Gemini BUKTIVA

Tanggal pengujian: 22 Oktober 2026.

**Status: implementasi tersedia, tetapi acceptance Milestone 1 belum seluruhnya terpenuhi. Generasi teks Gemini belum berhasil diverifikasi.** Tidak ada hasil dummy yang diperlakukan sebagai hasil Gemini.

## Tujuan dan kondisi awal

Milestone ini hanya menyediakan koneksi server Gemini, script pengujian Node.js dan endpoint development. Tidak mencakup database, ingestion proyek, perubahan UI, lima pertanyaan validasi, skill assessment, skill gap atau roadmap AI.

| Komponen | Kondisi sebelum perubahan | Tindakan |
| --- | --- | --- |
| Gemini SDK | `@google/genai` 2.30.0 sudah terpasang dan tercatat di lockfile | Dipertahankan; tidak memasang SDK lama |
| Zod | 4.6.7 sudah terpasang | Dipakai untuk memvalidasi konfigurasi server |
| Supabase | `@supabase/ssr` 0.12.7 dan `@supabase/supabase-js` 2.118.0 tersedia | Tidak diubah atau dipanggil oleh integrasi ini |
| Node.js | 24.12.0 | Kompatibel dengan Next.js 16.4.0 (`>=20.9.0`) dan SDK Gemini (`>=20.0.0`) |
| `.env.local` | Key/model Gemini dan variabel Supabase tersedia dan berisi nilai; file diabaikan Git | Tidak diubah; nilai tidak dicetak |
| `scripts/test-gemini.mjs` | Sudah memakai `GoogleGenAI`, `models.generateContent`, prompt tetap, `response.text`; catch mencetak pesan SDK mentah | Dipertahankan dengan timeout, retry nonaktif, pemeriksaan respons kosong dan error aman |
| `src/lib` | Hanya helper `supabase/client.ts` dan `supabase/server.ts` | Tambah modul `ai/gemini.ts` |
| API Gemini | Belum tersedia | Tambah route POST khusus development |

Perubahan pengguna pada `package.json`, `package-lock.json`, dan folder `scripts` sudah ada saat audit dan dipertahankan. README dan PRD dibaca sebagai konteks, tidak diubah. SDK resmi dan model diverifikasi melalui [dokumentasi Google](https://ai.google.dev/gemini-api/docs/generate-content/whats-new-gemini-3.8) serta deklarasi tipe SDK terpasang. Keberadaan model bagi konfigurasi akun juga dikonfirmasi dengan `models.get`; ini **bukan** bukti keberhasilan generasi teks.

## File dan struktur

```text
src/lib/ai/gemini.ts                  # Transport teks server; validasi konfigurasi dan error aman
src/app/api/ai/test/route.ts           # POST development dengan prompt tetap
scripts/test-gemini.mjs               # Script pengguna; perbaikan terbatas
scripts/test-gemini-server.mjs        # Tujuh pengujian deterministik tanpa jaringan
docs/ai/milestone-01.md               # Petunjuk dan hasil aktual
```

`server-only` 0.0.1 ditambahkan sebagai dependensi langsung; `package.json` dan lockfile diperbarui untuk penambahan ini. Gemini/Zod yang telah terpasang tidak diinstal ulang secara sengaja atau dihapus. `next dev` menghasilkan `AGENTS.md` secara otomatis; file itu bukan fitur AI dan tidak diedit manual.

## Environment server

Nama yang diperlukan:

- `GEMINI_API_KEY`: wajib saat request Gemini, tidak memakai awalan `NEXT_PUBLIC_`.
- `GEMINI_MODEL`: model pilihan; jika kosong/tidak tersedia, modul memakai `gemini-3.8-flash`.
- `NODE_ENV`: dikelola Next.js; endpoint hanya aktif ketika nilainya `development`.

Nama Supabase yang sudah ada: `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Keduanya tidak dibutuhkan oleh modul Gemini dan tidak diubah dalam milestone ini. `.gitignore` melindungi `.env.local` melalui aturan environment.

Tidak ada client Gemini di browser. `import "server-only"` mencegah modul transport diimpor ke client component. Konfigurasi dan client baru dibaca/dibuat saat fungsi dipanggil, sehingga import saat build tidak mensyaratkan key. API memakai Node.js **bawaan**. Export eksplisit `runtime = "nodejs"` ditolak oleh Next.js 16.4 dengan `cacheComponents`; export tersebut tidak dipakai agar konfigurasi dan frontend tetap utuh. Panduan lokal: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/runtime.md`.

Fungsi reusable: `generateGeminiText(prompt: string): Promise<{ model: string; result: string }>`. Prompt bisnis berada di pemanggil, bukan modul transport. Timeout 30 detik dan maksimal satu percobaan SDK per pemanggilan; tidak ada pergantian model otomatis atau retry berulang yang diam-diam memakai kuota.

## Menjalankan pengujian

Pada PowerShell ini gunakan `npm.cmd`/`npx.cmd` karena shim `.ps1` diblokir execution policy. Tidak perlu mengubah kebijakan sistem.

```powershell
node -v
npm.cmd ls @google/genai zod server-only
node --env-file=.env.local scripts/test-gemini.mjs
```

Script menggunakan satu request generasi sederhana per eksekusi dan memakai kuota API. Jangan mencetak environment atau pesan error SDK mentah saat diagnosis.

Untuk endpoint, jalankan pada terminal pertama:

```powershell
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

Pada terminal kedua:

```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:3000/api/ai/test
```

Tidak perlu body atau API key pada request localhost. Body pengguna tidak dibaca. Prompt endpoint:

> Kamu adalah asisten AI untuk aplikasi BUKTIVA, sebuah Evidence-Based Skill Gap Analyzer. Sebutkan tiga keterampilan penting untuk Frontend Developer dalam bahasa Indonesia secara singkat.

Kontrak sukses berikut merupakan **format**, bukan hasil pengujian yang telah sukses:

```json
{
  "success": true,
  "model": "nama-model-yang-digunakan",
  "result": "jawaban-asli-gemini"
}
```

Error mengembalikan `{ "success": false, "error": "pesan aman" }` tanpa header autentikasi, key, stack trace atau detail request. Respons development diberi `Cache-Control: no-store`.

| HTTP | Arti/tindakan |
| --- | --- |
| 404 | POST di luar development; memang diblokir sebelum pemanggilan SDK |
| 405 | Method selain yang didukung; ditangani otomatis Next.js (OPTIONS dapat ditangani otomatis) |
| 500 | Konfigurasi server belum tersedia atau error internal tak terduga; periksa nama environment |
| 429 | Kuota/batas request provider; periksa kuota dan tunggu sebelum mencoba ulang |
| 504 | Timeout dikenali; periksa layanan/koneksi dan coba lagi kemudian |
| 502 | Error upstream lain atau respons teks kosong; periksa model, izin dan layanan Gemini. Error 503 provider termasuk dalam kategori aman ini |

Pemeriksaan tanpa jaringan dan pemeriksaan proyek:

```powershell
node --test scripts/test-gemini-server.mjs
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
```

Pengujian deterministik menggunakan SDK tiruan, tidak membaca key asli atau menggunakan kuota. Pengujian ini memeriksa fallback model, konfigurasi lazy, timeout/retry, prompt tetap, error aman, respons kosong, dan penolakan production. Ini tidak menggantikan pengujian Gemini nyata.

Untuk memverifikasi deployment produksi lokal setelah build, hentikan dev lalu:

```powershell
npm.cmd run start -- --hostname 127.0.0.1 --port 3001
# Terminal lain: POST harus 404, GET harus 405.
curl.exe -i -X POST http://127.0.0.1:3001/api/ai/test
curl.exe -i http://127.0.0.1:3001/api/ai/test
```

## Hasil aktual

| Pemeriksaan | Hasil |
| --- | --- |
| Dependency dan Node | Berhasil, versi aktual tercantum di atas |
| Pembacaan key server | Terverifikasi lewat akses metadata model; tidak ada nilai kredensial dicetak |
| Metadata `models.get` | Berhasil, model tersedia untuk konfigurasi akun yang diuji |
| Generasi teks / koneksi Gemini untuk acceptance | **Gagal pada pengujian**; belum ada respons teks sukses |
| Script Node.js | **Gagal**: sandbox memberi error jaringan; di luar sandbox mendapatkan status 504, lalu satu pengulangan terakhir status 503 |
| POST development | **Handler dan sanitasi error terverifikasi**, tetapi jalur sukses Gemini belum terverifikasi. POST lokal mengembalikan 502 JSON aman baik sebelum maupun sesudah server dijalankan di luar sandbox |
| GET development | Berhasil menolak dengan 405 |
| POST production nyata (`next start`) | Berhasil menolak dengan 404 dan JSON `Endpoint tidak tersedia.` |
| GET production | 405 |
| Pengujian deterministik | 7/7 lulus |
| ESLint | Berhasil, exit 0 setelah memperbaiki nama variabel pengujian yang dilarang aturan Next.js |
| TypeScript | Berhasil, exit 0; juga lolos tahap TypeScript build |
| Build | Berhasil, exit 0 setelah diulang dengan akses jaringan. Percobaan sandbox gagal mengambil Google Fonts, masalah lingkungan yang sudah terlihat pada audit sebelumnya |
| Smoke test frontend produksi | `/`, `/login`, `/workspace/dashboard`, `/workspace/analisa-baru` semuanya HTTP 200 |
| Pemeriksaan kebocoran key | Nilai key aktual dibandingkan secara lokal terhadap sumber `src`, `scripts`, `docs` yang ada dan bundle browser `.next/static`: 175 file saat pemeriksaan, tidak ada kecocokan. Nilai tidak dicetak |
| Perubahan UI/database/pertanyaan | Tidak ada file frontend, Supabase, migration, atau pertanyaan yang diedit |

Smoke test HTTP tidak membuktikan semua interaksi browser tetap berfungsi; pengujian browser menyeluruh tidak dilakukan. Tidak ada commit, push atau deploy. Tidak ada `npm audit fix --force`, downgrade Next.js, perubahan key atau perubahan `PRD.md`.

## Masalah dan batas verifikasi

1. Gangguan generasi provider (504/503) tetap terjadi meskipun metadata model dapat diakses. Ini tidak membuktikan key salah atau kuota habis. Jangan mengganti key/model tanpa diagnosis tambahan. Coba ulang script ketika layanan pulih, lalu uji POST development untuk memperoleh respons 200 asli.
2. Export runtime eksplisit menyebabkan error kompilasi karena konfigurasi cache; diselesaikan dengan runtime Node.js bawaan dan diuji kembali.
3. Paket `server-only` membutuhkan pemasangan dengan akses jaringan; tidak mengubah database maupun kode Supabase.
4. Build sandbox gagal mengunduh font; pengulangan dengan jaringan lulus tanpa mengubah desain/font.
5. Pengujian awal menamai variabel lokal `module`; aturan ESLint Next.js menolaknya. Nama diubah menjadi `transportModule`; lint berikutnya lulus.

## Checklist penerimaan

- [x] Key dibaca aman pada server dan tidak diganti.
- [ ] Script menghasilkan respons Gemini sungguhan dengan sukses.
- [x] Modul `gemini.ts` tersedia, reusable, server-only dan lazy.
- [x] POST development tersedia, memakai prompt tetap, JSON dan error aman.
- [ ] POST development menghasilkan HTTP 200 dengan teks Gemini sungguhan.
- [x] Tidak ada hasil dummy saat API gagal.
- [x] POST production ditolak; tidak memanggil SDK (dibuktikan juga pada pengujian deterministik).
- [x] Tidak ada key pada sumber atau bundle browser yang dipindai; tidak dicetak ke output.
- [x] Lint, TypeScript dan build berhasil.
- [x] Frontend tidak diedit dan smoke test halaman utama lulus.
- [ ] Seluruh interaksi frontend diverifikasi di browser (belum dilakukan).
- [x] Hasil aktual dan keterbatasan didokumentasikan.

Milestone **belum dinyatakan selesai** sampai script dan endpoint menghasilkan respons sukses Gemini nyata. Implementasi tidak menutupi kegagalan provider dengan data contoh.

## Kesiapan Milestone 2

Fondasi transport tersedia. Sebelum Project Ingestion Engine dikerjakan, selesaikan bukti koneksi generasi sukses. Kemudian sepakati kontrak bukti proyek dan hasil ekstraksi, batas ukuran/tipe file, izin akses repository, penanganan URL tidak tepercaya/SSRF, pembersihan arsip dan traversal path, ekstraksi PDF, timeout, serta hubungan ID analisis/bukti dengan backend Supabase. Tentukan pembagian tanggung jawab backend/AI dan pengujian ingestion sebelum menghubungkannya ke prompt bisnis. **Tidak ada ingestion GitHub, ZIP/folder, website atau PDF yang diimplementasikan pada milestone ini.**
