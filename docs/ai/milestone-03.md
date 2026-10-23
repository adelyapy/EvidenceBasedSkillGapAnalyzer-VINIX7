# Milestone 3 — Supabase Data Integration & AI Input Pipeline

Tanggal: 22 Oktober 2026.

**Status implementasi: PASS WITH CONDITIONS.** Pipeline server dan security gate diuji dengan mock/fixture. **SUPABASE_LIVE_VERIFICATION_BLOCKED**: belum ada identifikasi project development yang disetujui, sesi akun uji yang sah, akun uji kedua, atau akses schema/RLS/Storage untuk verifikasi. Ini bukan klaim koneksi database live telah berhasil.

## Tujuan dan kondisi awal

Milestone ini membaca konteks analisis milik pengguna dan referensi kompetensi, lalu membentuk `AnalysisInput` internal server. Tidak memanggil Gemini, menilai skill, menulis hasil, membuat roadmap, atau mengirim isi proyek ke browser.

Audit workspace menemukan:

- Supabase server client `src/lib/supabase/server.ts` memakai `@supabase/ssr`, cookie request melalui `next/headers`, dan variabel `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Client browser terpisah tersedia; login frontend sudah menggunakan Supabase Auth.
- Belum ada helper verifikasi pengguna server, analysis repository, database generated types, SQL schema/migration, konfigurasi bucket privat, ataupun proxy/middleware refresh session yang dapat ditemukan pada checkout.
- Tidak tersedia konfigurasi akun uji development. Adanya nama environment Supabase tidak membuktikan project development, sesi valid, schema, FK atau RLS aktif. `.env.local` tidak dibaca atau diubah; hanya referensi nama environment pada kode yang diperiksa.
- Modul Gemini dan tujuh test internal Milestone 1 tersedia; generasi nyata sebelumnya gagal 503/504. Tidak ada request Gemini pada milestone ini.
- Milestone 2 menyediakan GitHub/ZIP ingestion dan kontrak `NormalizedProject`. Audit sebelumnya mengungkap P1/P2/P3; perbaikan dilakukan sebelum menghubungkan evidence ke builder.
- Runner `node:test` dengan `tsx`, Zod 4.6.7, `server-only` 0.0.1, `@supabase/ssr` 0.12.7, `@supabase/supabase-js` 2.118.0 dan yauzl 3.4.0 telah tersedia. Tidak ada library baru atau perubahan versi.
- Perubahan Git awal pada manifest/lockfile serta file Milestone 1/2/AGENTS belum di-commit dan dipertahankan. Frontend, PRD, schema database, RLS, environment, helper autentikasi backend dan modul Gemini tidak diubah.

## Security gate Milestone 2

**Gate: PASSED untuk kasus regresi yang diketahui.** Hasil ini tidak menjamin deteksi seluruh secret arbitrer.

| Temuan | Perubahan | Bukti |
| --- | --- | --- |
| P1: Docker credential lolos | Direktori `.docker`, `.kube`, `.azure`, `.gnupg`, `credentials`/`secrets`, serta konteks `.config/gcloud`/`.config/gh` disaring. Scanner mengenali indikator registry auth, `_authToken`, dan Bearer. `.npmrc`, `.pypirc`, `.netrc`, `.aws`, `.git-credentials`, key dan `.env*` tetap ditolak | Regression melalui GitHub mock dan ZIP; blob credential berbasis path tidak diunduh; credential sintetis tidak muncul di output/warning |
| P2: path schema tidak konsisten | Kebijakan path dipindah ke helper pure `project-path.ts`. Reader menormalisasi; schema mensyaratkan hasil kanonis dari kebijakan yang sama. Tidak ada circular dependency | `CON.ts`, traversal, absolute/drive path, kontrol/bidi, wildcard Windows ditolak; separator Windows/dot-segment aman dinormalisasi sebelum schema |
| P3: lockfile tidak lengkap | Tambah `npm-shrinkwrap.json`, `packages.lock.json`, `pnpm-lock.yml`, `deno.lock`, `Pipfile.lock`, `uv.lock`; dokumentasi dibatasi pada nama lockfile yang dikenali | Test kedua reader memastikan lockfile dilewati dan `package.json` tetap disertakan |

`src/config.json` biasa tetap disertakan; tidak memblokir seluruh config.json. Scanner tetap heuristik, dengan kemungkinan false positive/negative. Normalized output dari adapter juga diperiksa schema dan di-filter ulang pada evidence resolver sebelum masuk builder. Tidak ada logging isi file atau exception provider.

## Struktur dan perubahan file

```text
src/lib/ingestion/project-path.ts          # Kebijakan path bersama, tanpa dependency schema/server API
src/lib/analysis/
  errors.ts                               # Error code dan pesan tetap yang aman
  analysis-repository.ts                  # Client existing, getUser, owner filters, validasi rows
  target-role-resolver.ts                  # Slug/name deterministik, benchmark dan skill
  evidence-resolver.ts                     # Github ingestion, sanitasi, ZIP blocked, unsupported types
  analysis-input-builder.ts                # Orkestrasi privat, anggaran multi-evidence, schema akhir
src/types/analysis-input.ts                # Proyeksi row ERD, schema Zod dan tipe AnalysisInput server
tests/ingestion/security-regression.test.ts
tests/analysis/
  fixtures.ts                             # Mock client/query dan data sintetis
  analysis-repository.test.ts
  target-role-resolver.test.ts
  evidence-resolver.test.ts
  analysis-input-builder.test.ts
  analysis-input.fixture.json              # Snapshot aktual yang diuji terhadap builder/schema
docs/ai/milestone-03.md
```

File lama diubah: `file-filter.ts` untuk P1/P3 dan pemakaian helper path; `src/types/ingestion.ts` untuk P2; `docs/ai/milestone-02.md` untuk mengoreksi klaim lockfile dan mencatat penutupan gate; `package.json` hanya menambahkan `test:analysis`. Tidak perlu memasang dependency atau mengubah lockfile untuk Milestone 3. Modifikasi lockfile yang sudah ada berasal dari progres sebelumnya.

Nama `AnalysisInput` pada `src/types/analysis-input.ts` adalah kontrak pipeline **server** baru. Tipe bernama sama pada `src/types/analysis.ts` merupakan draft UI lama, tidak diganti atau dipakai sebagai payload AI.

## Kontrak database dan asumsi yang belum diverifikasi

Query dibuat dari kolom ERD yang diberikan, bukan introspeksi database live. Schema Zod memvalidasi respons secara fail-closed. File ini bukan hasil Supabase type generation dan tidak membuktikan constraint/foreign key/RLS pada deployment.

| Tabel | Proyeksi query | Penggunaan |
| --- | --- | --- |
| `analyses` | `id,user_id,status,target_role,created_at,updated_at` | Analisis milik pengguna terverifikasi |
| `project_evidences` | `id,analysis_id,user_id,evidence_type,title,url,storage_path,description` | Metadata evidence, maksimal 8 |
| `cv_files` | `id,analysis_id,user_id,storage_path,original_filename,mime_type,file_size_bytes` | Maksimal satu CV, metadata saja |
| `target_roles` | `id::text,name,slug,description,is_active` | Target role resmi |
| `role_benchmarks` | `id::text,target_role_id::text,skill_id::text,required_level,priority,source_name,source_url` | Kompetensi target, maksimal 100 |
| `skills` | `id::text,name,category,description` | Identitas skill benchmark |

Asumsi yang wajib dikonfirmasi backend:

1. ID analysis/evidence/CV/user berbentuk UUID; timestamps analysis ISO datetime bertimezone. Ini asumsi adapter, belum bukti tipe database aktual.
2. ID role/benchmark/skill dan FK terkait adalah int8 positif. Query meminta cast `::text` pada server sebelum parsing JSON dapat membulatkan angka. Angka JavaScript yang tidak safe integer ditolak. Nilai string hingga `9223372036854775807` dipertahankan tanpa konversi number.
3. `analyses.target_role` adalah teks. Kolom nama/slug/status dan label nonkosong; description kategori/provenance yang opsional boleh null. Metadata tidak cocok, nilai rahasia mencurigakan, atau field melampaui batas menghasilkan error kontrak aman.
4. `required_level`/`priority` dipertahankan sebagai label aman atau number 0–100; bukan skor yang dihitung pipeline. Tim backend harus mengonfirmasi enum/range sebenarnya sebelum live. Tidak ada benchmark fallback.
5. Satu CV per analisis adalah kebijakan pipeline sementara. Dua record CV menghasilkan `DATA_LIMIT_EXCEEDED`, bukan memilih salah satu tanpa jejak. Backend perlu menyepakati kebijakan versi CV.
6. Alias evidence yang dikenali eksplisit: `github`/`github_url`, `zip`/`zip_file`, `pdf`/`pdf_file`, `portfolio`/`portfolio_url`, `deployment`/`deployment_url`, serta `cv`, `website`, `gitlab`, `folder`. Nilai lain menjadi `unknown` dan unsupported; sesuaikan dengan enum backend setelah schema tersedia.
7. Cast query PostgREST, izin SELECT dan kebijakan bucket harus divalidasi pada project development; kesesuaian tipe SDK/mocks bukan pengganti test live.

Tidak ada data akun nyata dibaca, akun/record dibuat, migration dijalankan, atau perubahan RLS dilakukan.

## Otorisasi dan client server

`loadOwnedAnalysis(analysisId, injectedClient?)` memvalidasi UUID, menggunakan client server existing ketika tidak ada dependency internal, lalu memanggil `auth.getUser()` untuk memperoleh identitas terverifikasi. Tidak memakai `getSession().user` atau user ID dari browser. Server helper tetap menggunakan publishable key; tidak ada service-role/secret-key path.

Setiap query data privat memakai `user_id = verifiedUserId`, ditambah ID analysis atau `analysis_id`. Hasil row juga diperiksa lagi untuk ownership/analysis ID. Analisis orang lain dan analisis tidak ditemukan sama-sama `ANALYSIS_NOT_FOUND`. Query child tidak dimulai jika ownership analysis gagal. Tidak ada `select('*')`, pemilihan kolom dibatasi dan jumlah row diberi limit.

Dependency injection client hanya untuk kode server tepercaya/test; jangan menerima objek dependency/userId dari request. Pipeline tidak menggunakan global client, React cache, `use cache`, atau cache privat lintas pengguna. Helper cookie yang ada dipakai ulang. Tidak ada route HTTP baru atau response privat ke browser. Jika dihubungkan melalui route internal nanti, otorisasi harus tetap berjalan per request, respons harus `private, no-store`, dan seluruh konten AnalysisInput tidak boleh diserialisasi ke browser.

Pola getUser/getClaims sebagai dasar verifikasi mengikuti [panduan Supabase server-side auth](https://supabase.com/docs/guides/auth/server-side/creating-a-client). Refresh cookie pada Server Component belum terbukti tersedia: helper existing menangkap kegagalan menulis cookie, dan proxy refresh belum ditemukan. Koordinasikan mekanisme refresh dengan backend; milestone ini tidak mengubah login atau memasang auth bypass untuk menyiasatinya.

Error utama repository: `INVALID_ANALYSIS_ID`, `UNAUTHENTICATED`, `ANALYSIS_NOT_FOUND`, `DATABASE_ERROR`. Error tambahan: `DATABASE_CONTRACT_ERROR`, `DATA_LIMIT_EXCEEDED`, `SERVER_CONFIGURATION_ERROR`, `INVALID_ANALYSIS_INPUT`. Pesan tetap tidak membawa JWT, cookie, URL privat, raw DB error atau stack trace ke output pipeline.

## Target Role Resolver

`resolveTargetRole(value, client)` dipanggil setelah ownership diverifikasi. Query slug memakai input NFKC, trim, collapse spasi dan lowercase tanpa wildcard atau tebakan AI. Slug resmi diutamakan. Bila tidak ada slug yang cocok, baca katalog terbatas 200 role lalu cocokkan nama dengan normalisasi yang sama; katalog lebih besar ditolak agar tidak menyimpulkan hasil dari daftar terpotong.

Kecocokan ganda menjadi `ROLE_AMBIGUOUS`; tidak ada hasil menjadi `ROLE_NOT_FOUND`; role tidak aktif menjadi `ROLE_INACTIVE`. Role aktif wajib memiliki benchmark (`BENCHMARK_NOT_CONFIGURED` jika kosong). FK target role, identitas skill dan duplikasi skill diperiksa; skill hilang menjadi `SKILL_NOT_FOUND`. Tidak mengambil benchmark milik role lain. ID dipertahankan sebagai decimal string, dan hasil benchmark diurutkan deterministik berdasarkan ID skill numerik BigInt.

## Evidence dan Storage

Setiap hasil mempunyai `evidenceId`, `sourceType`, `sourceReference` aman, status dan normalized project atau error code. Title, description mentah, URL invalid, serta storage path privat tidak diteruskan ke output. Evidence gagal/blocked/unsupported memakai reference internal `evidence:<UUID>`.

GitHub:

- Hanya URL repository publik tervalidasi oleh parser backend Milestone 2. Tidak fetch arbitrary URL, tidak git clone dan tidak eksekusi source.
- Gunakan ingestion service asli sebagai default. Test menggantinya dengan mock, bukan Gemini/dummy analisis nyata.
- Validasi schema hasil, cocokkan source type/reference, lalu terapkan normalizer/filter terbaru lagi. Output adapter lama/injected yang mengandung `.docker/config.json` dibuang dan status menjadi partial.
- Kegagalan satu sumber tidak menghapus sumber lain. Raw error reader diganti kode aman seperti `EVIDENCE_FETCH_FAILED`, `EVIDENCE_LIMIT_EXCEEDED`, `INVALID_GITHUB_URL`, atau `EVIDENCE_OUTPUT_REJECTED`.

ZIP Storage:

**STORAGE_READER_NOT_READY.** Resolver tidak memanggil Storage download, signed URL atau public URL. ERD project_evidences hanya menyediakan storage_path, tanpa kontrak ukuran ZIP yang terverifikasi dan tanpa bucket privat/izin yang terkonfirmasi. Ukuran CV tidak dipakai untuk mengasumsikan ukuran ZIP. Bahkan jika ada storage_path, sumber tetap blocked.

Tim backend perlu menyediakan bucket privat yang terkonfirmasi, metadata ukuran ZIP dari sumber Storage yang sah, validasi ownership object/prefix, serta download streaming terotorisasi dengan batas sebelum alokasi Buffer. Setelah siap, panggil ZIP reader dengan batas Milestone 2; jangan memakai SDK download eager untuk file yang ukurannya belum dapat dipastikan. Jangan menggunakan service role untuk melewati RLS.

PDF, CV sebagai konten proyek, portfolio/website, deployment, GitLab, folder dan sumber unknown tetap `unsupported`. CV tabel terpisah hanya menjadi metadata: nama file, MIME, ukuran, ID dan reference `cv:<UUID>`, dengan `contentStatus: unsupported`. Konten CV tidak dibaca. Tidak ada klaim sumber tersebut telah dianalisis.

## Builder, status, dan resource limits

```ts
import { buildAnalysisInput } from "@/lib/analysis/analysis-input-builder";
// Panggil dalam konteks request server yang memiliki cookie sesi sah.
const input = await buildAnalysisInput(analysisId);
// Input tetap internal server. Jangan return seluruh input ke browser.
```

Urutan: validasi ID → client request → getUser → analysis milik user → metadata evidence/CV → official role/benchmark/skills → evidence resolver sequential → validasi Zod final. Tidak ada Gemini, scoring, penyimpanan database, skill gap atau roadmap.

`AnalysisInput` memuat analysisId, userId, targetRole, benchmarks, evidences, CV metadata/null, processingStatus dan warning terstruktur. Schema strict menolak field ekstra seperti access_token, memeriksa konsistensi status/reference, ID evidence unik, skill benchmark unik dan total budget. Isi proyek tetap mengikuti `NormalizedProject`, bukan bentuk proyek alternatif.

| Kondisi evidence | processingStatus |
| --- | --- |
| Tidak ada evidence | `blocked` + `NO_PROJECT_EVIDENCE` |
| Semua complete | `complete` |
| Ada hasil complete/partial disertai evidence tidak complete | `partial` |
| Tidak ada hasil normalized dan ada failed | `failed` |
| Tidak ada hasil normalized/failed dan ada blocked | `blocked` |
| Seluruhnya unsupported | `unsupported` |

Normalized project kosong yang secara eksplisit partial tetap partial, tidak menjadi complete. CV metadata opsional menambahkan `CV_METADATA_ONLY`; complete berarti pemrosesan evidence yang didukung selesai, bukan CV sudah diekstrak atau skill sudah dinilai.

Batas pipeline: maksimal 8 evidence, satu CV metadata, 100 benchmark/skill, katalog fallback 200 role, agregat 80 file dan 2 MiB konten proyek. Reader default tetap maksimal 40 file/1 MiB per proyek; sisa budget diteruskan untuk memperketat batas. Bila budget habis, reader berikutnya tidak dimulai. Hasil adapter yang melampaui sisa budget juga tidak diteruskan. Tidak ada pemotongan isi file tanpa status.

## Contoh JSON sintetis yang benar-benar diuji

Snapshot lengkap di `tests/analysis/analysis-input.fixture.json` dibandingkan dengan output builder dan lolos `analysisInputSchema`. Cuplikan ringkas berikut juga valid sebagai objek lengkap tanpa evidence (skenario analisis belum memiliki proyek):

```json
{
  "analysisId": "33333333-3333-4333-8333-333333333333",
  "userId": "11111111-1111-4111-8111-111111111111",
  "targetRole": {
    "id": "9007199254740993", "name": "Frontend Developer",
    "slug": "frontend-developer", "description": "Frontend engineering"
  },
  "benchmarks": [{
    "benchmarkId": "10", "skillId": "9007199254740995", "skillName": "TypeScript",
    "category": "Engineering", "description": "Typed JavaScript",
    "requiredLevel": 3, "priority": "high",
    "sourceName": "Synthetic benchmark", "sourceUrl": "https://example.invalid/benchmark"
  }],
  "evidences": [], "cv": null,
  "processingStatus": "blocked", "warnings": ["NO_PROJECT_EVIDENCE"]
}
```

Angka benchmark/role dan UUID di atas berasal dari fixture, bukan data atau penilaian pengguna nyata. Input dengan GitHub berhasil juga diuji: snapshot berisi satu file TypeScript 26 byte, SHA fixture, status complete dan CV null. Multi-evidence gagal/sukses menghasilkan partial dengan identitas masing-masing, bukan penggabungan proyek tanpa sumber.

## Pengujian dan hasil aktual

```powershell
npm.cmd run test:ingestion
npm.cmd run test:analysis
node --test scripts/test-gemini-server.mjs
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
npm.cmd audit --omit=dev
```

Gunakan shim `.cmd` pada PowerShell yang execution policy-nya memblokir npm.ps1. Test tsx pada lingkungan ini dijalankan di luar sandbox setelah kendala Windows `uv_os_get_passwd` yang sudah diketahui pada milestone sebelumnya. Tidak ada database/Gemini/network GitHub nyata dalam unit test. Test menggunakan client Supabase mock dan ingestion mock; regresi ingestion tetap menggunakan ZIP nyata sintetis serta fetch mock. Tidak ada credential nyata pada fixture atau snapshot.

| Pemeriksaan | Hasil |
| --- | --- |
| Security regression P1/P2/P3 dan seluruh ingestion | 44/44 lulus |
| Analysis repository/role/evidence/builder | 31/31 lulus |
| Milestone 1 regression | 7/7 lulus; tanpa request Gemini |
| Total test | 82 lulus, 0 gagal |
| ESLint | Lulus, exit 0 |
| TypeScript | Lulus, exit 0 |
| Build | Lulus, exit 0; halaman frontend dan route existing tetap terbangun |
| Audit produksi | 0 vulnerabilities; pengulangan jaringan setelah sandbox gagal |
| Supabase live schema/Auth/RLS | SUPABASE_LIVE_VERIFICATION_BLOCKED |
| ZIP Supabase Storage | STORAGE_READER_NOT_READY; tidak ada download |
| Browser interaktif | Tidak dijalankan; UI tidak diubah |

Kasus test: auth sah/tidak ada/invalid/error, invalid analysisId sebelum query, own/other-user/not-found, filter userId pada seluruh query privat, metadata CV ada/tidak, evidence kosong/banyak, DB error/exception/field invalid, cross-owner child defense, limit rows, slug/name/Unicode/ambiguity/inactive role, benchmark/skill hilang, int8 di atas safe integer, provenance tidak aman, ZIP blocked, unsupported formats, URL invalid, reader error, sanitasi output adapter, multi-evidence partial, limit bytes/file gabungan, JSON snapshot/schema serta field secret ekstra.

Mock membuktikan logika aplikasi, **bukan** kebijakan RLS database atau Storage. Test live berikut masih perlu dilakukan backend pada project development yang disetujui:

1. Konfirmasi schema, cast `::text`, enum, nullability, FK dan generated types.
2. Gunakan sesi akun uji A sah; baca satu analisis sintetis miliknya.
3. Uji tanpa sesi, sesi invalid dan akun uji B; data A harus tidak dapat dibaca.
4. Konfirmasi kebijakan SELECT pada analysis/evidence/CV serta referensi katalog.
5. Periksa refresh session/cookie dan mekanisme proxy yang disepakati.
6. Konfirmasi bucket privat, metadata ukuran terpercaya, ownership object dan pembatasan streaming sebelum membuka ZIP Storage.

Tidak mencoba membaca akun nyata atau mengambil data privat tanpa sesi uji sah. Tidak membuat akun/record pada production demi melewati blocker.

## Risiko dan kesiapan Milestone 4

- Schema database aktual belum diverifikasi. Adapter fail-closed dapat menolak data sah jika tipe/nullability/enum berbeda; ini perlu diselesaikan bersama backend, bukan dengan mematikan validator.
- Credential scanner tetap heuristik; fixed gate bukan sertifikasi seluruh file bebas secret. Output proyek tetap untrusted data yang bisa memuat prompt injection. Sebelum Gemini, tinjau secret scanning, prompt separation, consent/retensi dan token budget.
- Limit row tidak setara deadline/response-byte budget database global. Query memakai client request existing, belum worker/queue, cancel job, retry atau timeout keseluruhan pipeline. GitHub tetap memiliki limit/timeout per request Milestone 2.
- `AnalysisInput` berisi data privat dan source code, sehingga harus tetap server-only. Tidak ada HTTP route publik/response browser pada implementasi ini. Jangan menaruh builder dalam shared cache.
- Metadata CV belum ekstraksi CV; ZIP Storage memang dinonaktifkan sampai kontrak aman tersedia. Sumber lain tetap unsupported.
- Error Gemini 503/504 lama tidak diperbaiki, tidak dicoba ulang, dan tidak diganti hasil AI palsu. Tidak ada perubahan `gemini.ts` atau mekanisme autentikasi tim.

Milestone 4 dapat menerima objek yang sudah lolos `analysisInputSchema`, dengan identitas evidence, SHA, path file dan status parsial tetap terjaga. Pisahkan skill yang didukung bukti dari klaim manifest, gunakan benchmark resmi yang berasal dari database, dan buat kontrak output AI terstruktur. Sebelum mengaktifkan pemrosesan data pengguna nyata, tutup verifikasi Supabase Auth/RLS/schema live dan sediakan koneksi Gemini yang terverifikasi. Tidak ada Skill Extraction, dataset kompetensi hasil AI, readiness score atau roadmap yang diimplementasikan di milestone ini.
