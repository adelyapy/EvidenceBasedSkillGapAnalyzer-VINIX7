# Milestone 2 — Project Ingestion & Normalization Engine

Tanggal verifikasi: 22 Oktober 2026.

Status: **COMPLETED untuk cakupan MVP GitHub publik dan ZIP yang diuji dengan fixture/mock**. Tidak ada penilaian skill atau pemanggilan Gemini. Ini bukan klaim sertifikasi keamanan produksi atau dukungan semua format proyek.

## 1. Tujuan dan audit awal

Menyediakan bukti proyek teks yang dibatasi ukurannya, disaring, dan dinormalisasi menjadi `NormalizedProject`, tanpa menjalankan source code atau menulis data ke database.

Temuan sebelum implementasi:

- Next.js 16.4.0, React 19.3.0, TypeScript strict, alias `@/*` ke `src/*`, Tailwind/Turbopack dan `cacheComponents` sudah tersedia. Konfigurasi dipertahankan.
- `src/lib` berisi helper Supabase dan `ai/gemini.ts`; belum ada ingestion reader/normalizer.
- `@google/genai` 2.30.0, Zod 4.6.7, `server-only` 0.0.1, `@supabase/ssr` 0.12.7, dan `@supabase/supabase-js` 2.118.0 sudah terpasang. Library ZIP dan pemuat test TypeScript belum terpasang.
- Pengujian yang sudah ada menggunakan `node:test` pada `scripts/test-gemini-server.mjs`; belum ada Jest/Vitest atau folder test ingestion. Test Milestone 1 dijalankan ulang sebelum implementasi dan lulus 7/7.
- `UploadProjectPage.tsx` menyimpan URL/metadata PDF dalam sesi browser. Validator internalnya mengizinkan HTTP, www.github.com dan path yang lebih longgar; tidak aman dijadikan validator request backend. Komponen ini tidak diubah.
- Tipe `AnalysisProject` dan `UploadProjectEvidence` merupakan kontrak UI/draft; tidak menyediakan konten source, snapshot SHA, statistik atau batas resource. Kontrak ingestion dibuat terpisah.
- Data hasil, skill gap dan roadmap masih demo; tidak digunakan sebagai output ingestion.
- README, PRD, dokumentasi Milestone 1, konfigurasi test, dan AGENTS.md diperiksa. Petunjuk Next.js lokal tentang batas server/client dibaca. Hasil generasi Gemini 503/504 pada Milestone 1 tetap merupakan masalah lama, tidak diuji ulang dengan API atau dijadikan blocker ingestion.
- Git awal sudah memiliki perubahan `package.json`, lockfile, serta file Milestone 1/AGENTS/docs/scripts yang belum di-commit. Semuanya dipertahankan. `.env.local` tidak dibaca dan tetap diabaikan Git.

## 2. Library dan file

Tambahan yang benar-benar terpasang:

| Library | Versi | Kegunaan |
| --- | --- | --- |
| `yauzl` | 3.4.0 | Pembacaan central directory secara lazy dan stream entri ZIP |
| `@types/yauzl` | 3.4.0 | Tipe ZIP untuk TypeScript, dev dependency |
| `tsx` | 4.23.15 | Memuat test TypeScript dengan runner Node.js bawaan, dev dependency |

Node.js aktual: 24.12.0. Implementasi memakai `node:zlib.crc32`, yang memerlukan Node.js setidaknya 20.15.0; gunakan versi Node tersebut atau lebih baru. SDK AI dan Supabase tidak diubah. Instalasi dijalankan dengan `--ignore-scripts`, tanpa menjalankan script paket atau project pengguna.

Dasar pemilihan ZIP: [dokumentasi yauzl](https://github.com/thejoshwolfe/yauzl) menyediakan `lazyEntries`, validasi ukuran, dan stream entri. Versi 3.4.0 terpasang diperiksa langsung untuk `fromBufferPromise`, `eachEntry`, dan `openReadStreamPromise`. Implementasi menambahkan penghitung byte aktual dan CRC sendiri; tidak hanya mempercayai metadata arsip.

```text
src/types/ingestion.ts                    # Tipe input/output dan schema Zod
src/lib/ingestion/
  errors.ts                              # Kode error dan pesan aman
  limits.ts                              # Batas default, override hanya boleh memperketat
  file-filter.ts                         # Path aman, prioritas, bahasa, binary/secret filter
  project-normalizer.ts                   # Deduplikasi, urutan, statistik, schema akhir
  github-reader.ts                       # Snapshot GitHub REST API dengan fetch terbatas
  zip-reader.ts                          # ZIP lazy, stream terbatas, tanpa ekstraksi disk
  ingestion-service.ts                   # Fungsi publik dan dispatch sumber
tests/ingestion/
  fixtures.ts                            # Mock GitHub dan pembuat ZIP fixture lokal
  normalized-project.fixture.json        # Snapshot JSON yang dibandingkan pada integration test
  file-filter.test.ts
  github-reader.test.ts
  zip-reader.test.ts
  normalizer.test.ts
  ingestion-service.test.ts
docs/ai/milestone-02.md
```

File lama yang diubah hanya `package.json` dan `package-lock.json`: tambahan library serta script `test:ingestion`. Tidak ada perubahan frontend, desain, autentikasi, database/RLS, PRD, lima pertanyaan, hasil demo, atau modul/script Gemini. Tidak ada route ingestion HTTP baru, migration, commit, push atau deploy.

## 3. Kontrak output

`NormalizedProject`:

- `sourceType`: `github` atau `zip`.
- `projectName`: nama label yang dinormalisasi, maksimal 100 karakter.
- `sourceReference`: URL repository kanonis tanpa kredensial/query/fragment, atau nama ZIP tanpa path lokal.
- `revision`: SHA commit 40 digit hex untuk GitHub; tidak ada untuk ZIP.
- `files`: path relatif POSIX, bahasa, konten UTF-8 dan `sizeBytes` konten output.
- `stats`: jumlah file ditemukan/disertakan/dilewati dan total byte teks output.
- `warnings`: kode peringatan terbatas, bukan pesan atau konten bebas dari input.
- `status`: `complete` atau `partial`.

Schema Zod memeriksa struktur, batas file/byte, path relatif, source reference, SHA, ukuran UTF-8, keunikan path, konsistensi statistik, dan klaim kelengkapan. Semua hasil dapat diserialisasi sebagai JSON. `includedFiles + skippedFiles = discoveredFiles`; `totalContentBytes` adalah jumlah byte output, bukan ukuran ZIP atau ukuran repository.

Definisi hitungan: GitHub menghitung entri non-tree (blob dan submodule); ZIP menghitung entri non-direktori. Direktori ZIP tetap dihitung untuk batas 200 entri, tetapi tidak masuk statistik file. Symlink GitHub/submodule dilewati; symlink ZIP menolak seluruh arsip. Tidak ada klaim bahwa file yang dilewati telah dianalisis.

Setiap file yang tidak disertakan, termasuk dependency atau media yang memang disaring, menjadikan status `partial`. Sumber kosong/tanpa file relevan juga `partial`. Dengan demikian, `complete` hanya berarti seluruh file yang ditemukan pada sumber berhasil dimasukkan; bukan seluruh kompetensi pengguna telah dinilai.

Kode warning:

| Kode | Arti |
| --- | --- |
| `PARTIAL_PROJECT_FILES_SKIPPED` | Ada file ditemukan yang tidak masuk hasil |
| `UNSAFE_OR_IRRELEVANT_FILE_SKIPPED` | Kandidat ditolak oleh pemeriksaan konten/path atau normalizer |
| `OUTPUT_LIMIT_REACHED` | Kuota output/file/request kandidat tercapai |
| `DUPLICATE_PATH_SKIPPED` | Path normalisasi sudah ditemukan |
| `NO_RELEVANT_FILES` | Tidak ada file aman dan relevan dalam output |

## 4. Cara menggunakan service

Hanya impor dari kode server; semua reader/filter/normalizer/service memakai `server-only`.

```ts
import {
  ingestGithubRepository,
  ingestZipProject,
  ingestProject,
} from "@/lib/ingestion/ingestion-service";

const github = await ingestGithubRepository("https://github.com/acme/demo");
// buffer harus sudah dibatasi ukurannya oleh caller saat upload/download storage.
const zip = await ingestZipProject(buffer, "demo.zip");

// Sumber berikut menolak dengan IngestionError.code === "UNSUPPORTED_SOURCE".
await ingestProject({ sourceType: "pdf", reference: "authorized-storage-reference" });
```

`acme/demo` di atas merupakan placeholder API, bukan bukti akses repository jaringan nyata. Pengujian otomatis menyediakan `options.fetch` mock. Opsi `limits` dapat memperketat batas default, misalnya `{ limits: { maxIncludedFiles: 10 } }`. Override nol, negatif, pecahan, Infinity, key tak dikenal, atau nilai di atas hard ceiling ditolak. `ProjectSourceReader<TInput>` disediakan sebagai kontrak adapter untuk pengembangan sumber berikutnya.

### GitHub publik

1. Validasi URL asli sebelum normalisasi parser: HTTPS dan hostname tepat `github.com`; owner/repo dibatasi karakter dan panjang. `.git` dan satu trailing slash diperbolehkan.
2. Tolak www, host palsu, localhost/IP privat, userinfo, semua port eksplisit (termasuk 443), query, fragment, persen encoding, dot traversal, subpath tree/blob dan bentuk ambigu.
3. Bangun sendiri endpoint `https://api.github.com/repos/{owner}/{repo}`. Tidak fetch URL input bebas atau URL yang dikirim provider. Tidak memakai token, cookie akun, git clone, shell atau source execution.
4. Ambil metadata publik, default branch, commit SHA dan tree SHA; baca tree recursive snapshot tersebut. Header memakai media type GitHub resmi, API version dan User-Agent.
5. `truncated: true` menolak seluruh sumber dengan `TRUNCATED_TREE`, bukan mengklaim seluruh repo sudah diperiksa.
6. Saring metadata kandidat, prioritaskan README/manifest/source/test, lalu ambil raw blob berdasarkan SHA melalui REST API. Ukuran aktual harus sama dengan metadata tree.
7. Respons dibaca dengan stream dan cap sebelum JSON parse/penyimpanan. Redirect manual tidak diikuti. Timeout mencakup fetch dan pembacaan body. Tidak ada retry otomatis.

Lihat [GitHub Git Trees API](https://docs.github.com/en/rest/git/trees) untuk semantik recursive tree/truncation dan [Git Blobs API](https://docs.github.com/en/rest/git/blobs) untuk raw blob. Branch tidak dibaca ulang setelah snapshot ditemukan, sehingga konten tidak bercampur antarcommit.

Private repo tidak didukung, termasuk jika custom fetch mengembalikan metadata `private: true`. Error 404 dapat berarti tidak ditemukan atau privat, tanpa membedakan informasi yang tidak tersedia. GitHub 403 rate-limit dengan header rate-limit/retry-after dan 429 menjadi `RATE_LIMITED`; 403 lain menjadi `GITHUB_FORBIDDEN`. Redirect/5xx menjadi `UPSTREAM_ERROR`. Body error provider tidak dibaca atau dikirim ke output.

### ZIP proyek lokal

1. Caller menyediakan `Buffer` yang sudah dibatasi saat upload/storage read. Reader memeriksa ukuran buffer lagi, nama `.zip`, dan magic bytes local-header/empty-ZIP.
2. Central directory dibaca lazy untuk memvalidasi jumlah, semua path, tipe entri, ukuran individual dan total deklarasi. Tidak ada ekstraksi ke disk.
3. Tolak traversal, absolute/UNC/drive/ADS paths, kontrol/bidi berbahaya, persen ambiguity, Windows reserved names, symlink/special entry, enkripsi, compression method selain stored/deflate, dan nested archive yang terdeteksi.
4. Separator backslash dinormalisasi ke `/`; dot-segment aman dihapus, sedangkan `..` selalu ditolak. Path dinormalisasi Unicode NFC. Path identik hanya dimasukkan sekali; ZIP memilih entri pertama pada offset arsip.
5. Pilih kandidat berprioritas. File yang melebihi batas output individual dilewati tanpa dekompresi. File yang melampaui batas entri arsip menolak sumber, walaupun namanya tidak relevan.
6. Konsumsi setiap stream kandidat sambil menghitung byte individual dan total aktual; hentikan segera saat melewati cap. `validateEntrySizes` juga aktif. Setelah stream selesai, cocokkan ukuran dan CRC-32 sebelum mempercayai konten.
7. Periksa magic nested archive, UTF-8, biner, kemungkinan secret, lalu normalisasi output. Stream ditutup/dihancurkan, dan handle ZIP ditutup di `finally`.

File yang disaring sejak nama/ukuran tidak didekompresi atau diperiksa CRC-nya. Seluruh metadata tetap tunduk pada batas entri dan total ukuran deklarasi. Pembatasan aktual berlaku untuk semua data yang benar-benar didekompresi. Tidak ada janji bahwa seluruh payload file yang sengaja dilewati bebas kerusakan.

## 5. Filtering dan resource limits

Prioritas: README → manifest dependency → source utama pada src/app/lib → unit test → konfigurasi/dokumentasi teknis lain. Pemilihan dan urutan deterministik berdasarkan prioritas lalu path, tanpa locale-dependent sorting. Normalizer memeriksa keamanan konten lagi, menghapus path duplikat dan menghitung statistik.

Bahasa yang dikenali berdasarkan ekstensi/nama file mencakup JavaScript, TypeScript, Python, Java, PHP, Dart, HTML/CSS/SCSS, JSON/YAML, Markdown, Go, Rust, Ruby, C/C++, C#, Swift, Kotlin, SQL, Shell, Vue, Svelte, TOML/XML, R, Elixir dan beberapa manifest tanpa ekstensi. Deteksi bahasa tidak menilai penguasaan skill; dependency yang tercantum juga bukan bukti kompetensi.

Yang disaring: node_modules, .git, .next, dist/build, coverage, vendor, cache, virtualenv, direktori tool/build umum, .aws/.ssh, semua nama `.env*`, private key/certificate, credential/service-account/secret/password/token files, config autentikasi, lockfile umum yang dikenali, sourcemap, generated/minified output dan media/biner. Lockfile yang dikenali dilewati tanpa bergantung ukurannya; nama format baru tetap perlu ditambahkan secara eksplisit.

Konten diperiksa dengan UTF-8 fatal decoding, byte kontrol/biner, penanda generated, pola private key/token/API key/JWT, assignment secret umum, URL kredensial dan string terkutip panjang yang mencurigakan. Jika tidak lolos, seluruh file dikeluarkan; konten tidak dipotong menjadi cuplikan yang mungkin kehilangan konteks keamanan.

| Batas default/hard ceiling | Nilai | Perilaku |
| --- | --- | --- |
| ZIP terkompresi | 10 MiB | Tolak sebelum membuka ZIP |
| Entri ZIP total | 200 | Cek header dan iterasi aktual, termasuk direktori |
| Ukuran satu entri ZIP | 1 MiB | Tambahan batas proteksi; menolak jika terlampaui |
| Total dekompresi ZIP | 25 MiB | Cek deklarasi semua entri dan byte stream aktual |
| File teks output | 40 | Sisanya dilewati dengan warning/status partial |
| Konten satu file output | 64 KiB | Metadata disaring sebelum download/dekompresi; stream tetap dibatasi |
| Total teks output | 1 MiB | Tidak menambahkan file yang melampaui total; partial |
| Entri tree GitHub | 5.000 | Tolak jika melampaui batas |
| Response GitHub umum | 2 MiB | Cap pembacaan stream sebelum parse |
| Response metadata/commit | 64/128 KiB | Cap lebih kecil per jenis request |
| Request GitHub | 43 | 3 metadata/commit/tree + maksimal 40 blob; sequential |
| Timeout per request GitHub | 10 detik | Termasuk body; error tanpa retry |

Angka memakai satuan biner KiB/MiB. Header tree yang terpotong atau batas response terlampaui menolak sumber; output yang dibatasi secara aman memakai status partial. Pada worst case GitHub ada 43 request sequential yang masing-masing dibatasi 10 detik; belum ada deadline keseluruhan job atau antrean worker. ZIP mendapat batas jumlah/byte, bukan isolasi CPU terpisah.

## 6. Contoh output fixture yang diuji

Integration test membandingkan hasil ZIP dengan `tests/ingestion/normalized-project.fixture.json` berikut dan membandingkan `files`, `stats`, `warnings` GitHub mock dengan hasil ZIP:

```json
{
  "sourceType": "zip",
  "projectName": "demo",
  "sourceReference": "demo.zip",
  "files": [
    {
      "path": "src/main.ts",
      "language": "TypeScript",
      "content": "export const answer = 42;\n",
      "sizeBytes": 26
    }
  ],
  "stats": {
    "discoveredFiles": 1,
    "includedFiles": 1,
    "skippedFiles": 0,
    "totalContentBytes": 26
  },
  "warnings": [],
  "status": "complete"
}
```

Input fixture dibuat dari satu entri `src/main.ts`. Sumber GitHub mock memiliki reference `https://github.com/acme/demo` dan revision SHA fixture; isi file dan statistik mengikuti schema yang sama. Ini bukan hasil Gemini ataupun jaringan GitHub nyata.

## 7. Error dan format belum didukung

Semua kegagalan terkontrol memakai `IngestionError` dengan `code` dan pesan tetap yang aman. Tidak meneruskan raw exception yauzl/fetch, body GitHub, URL rahasia, atau konten file. Kode meliputi `INVALID_INPUT`, `INVALID_GITHUB_URL`, `UNSUPPORTED_SOURCE`, `NOT_FOUND`, `PRIVATE_REPOSITORY`, `RATE_LIMITED`, `GITHUB_FORBIDDEN`, `TIMEOUT`, `NETWORK_ERROR`, `UPSTREAM_ERROR`, `INVALID_RESPONSE`, `LIMIT_EXCEEDED`, `TRUNCATED_TREE`, `INVALID_ZIP`, `UNSAFE_PATH`, `UNSUPPORTED_ENTRY`, dan `NESTED_ARCHIVE`. Path yang ditolak oleh parser ZIP sebelum pemeriksaan aplikasi dapat menjadi `INVALID_ZIP`; keduanya menolak sumber tanpa menampilkan path penyerang.

Dispatch untuk folder lokal, GitLab, website/portfolio, deployment URL, PDF proyek dan CV menghasilkan `UNSUPPORTED_SOURCE`. Tidak ada pembacaan folder server, crawl website, ekstraksi PDF, atau dukungan direct storage URL. LinkedIn dan sumber lain yang belum dikenal juga tidak mempunyai adapter dan ditolak saat dispatch runtime; tidak diiklankan sebagai dukungan ingestion.

## 8. Pengujian aktual dan cara menjalankan

```powershell
npm.cmd run test:ingestion
node --test scripts/test-gemini-server.mjs
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
npm.cmd audit --omit=dev
```

`test:ingestion` memakai runner `node:test` dengan `tsx` dan condition `react-server` agar modul bertanda `server-only` dapat diuji di Node. Condition ini hanya dipakai pada proses test; proteksi client Next.js tidak dihapus. Tidak ada pembacaan `.env.local`, API key, Gemini atau request GitHub nyata dalam test. ZIP fixture dibentuk lokal tanpa ekstraksi filesystem. Integration test menggabungkan reader → filter → normalizer → schema/service, termasuk bukti kode/script proyek tidak dieksekusi.

| Verifikasi | Hasil |
| --- | --- |
| Test ingestion unit/integrasi | 40/40 lulus, 0 gagal |
| Test Milestone 1 sebelum/sesudah | 7/7 lulus; tidak ada request AI nyata |
| ESLint | Lulus, exit 0 |
| TypeScript | Lulus, exit 0 |
| Build frontend produksi | Lulus, exit 0; seluruh halaman serta route lama tetap terbangun |
| Audit produksi | 0 kerentanan |
| Audit seluruh dependency | 5 temuan high pada rantai ESLint baseline; tidak ada advisori yang dilaporkan pada yauzl/tsx tambahan |
| Proteksi environment | `.env.local` tetap diabaikan Git; tidak dibaca/diubah dalam milestone ini |
| Request GitHub nyata | Tidak dijalankan; seluruh pengujian GitHub memakai mock fetch |
| Browser UI interaktif | Tidak dijalankan; frontend tidak diedit dan build lulus |

Kasus pengujian mencakup URL valid/host palsu/IP privat/userinfo/port, repository 404/403/429, network error, stalled fetch/body timeout, tree truncated, tree/path/ukuran respons tidak valid, file besar/biner/secret/tanpa source, prioritas dan batas output/request, ZIP valid/korup/CRC salah, node_modules/sensitive file, traversal/absolute/Windows/ADS, symlink/enkripsi/nested archive, count/compressed/decompressed limits dan ukuran palsu, sumber kosong, deduplikasi, statistik UTF-8, determinisme, schema sama lintas sumber, format unsupported dan kode yang tidak dieksekusi.

Kendala lingkungan: tsx awalnya gagal di sandbox Windows dengan `uv_os_get_passwd`/ENOMEM sebelum test berjalan. Pengulangan test di luar sandbox lulus; ini bukan ZIP bomb atau OOM dari fixture. Audit npm sandbox juga gagal jaringan dan berhasil setelah akses jaringan diberikan. Tidak ada penolakan auto-review yang menyisakan pekerjaan terblokir.

Masalah kode awal yang ditemukan oleh test/typecheck telah diperbaiki: pola generated filename terlalu sempit, mutabilitas tipe object limits, serta deklarasi tipe Response pada mock biner. Fixture ukuran/metadata enkripsi dikoreksi. Pemeriksaan final tidak menonaktifkan lint atau TypeScript.

Rantai audit lama: `eslint-config-next` 16.4.0 → `@next/eslint-plugin-next` → `fast-glob` 3.3.1 → `micromatch` 4.0.8 → `braces` 3.0.3. Versi tersebut dikonfirmasi sama dengan `HEAD` sebelum perubahan. Advisori braces: [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). Tidak menjalankan `audit fix --force` atau menerima saran downgrade ESLint/Next.js otomatis.

## 9. Risiko dan batas keamanan

- Filter secret merupakan heuristik konservatif: dapat menolak file aman dan tidak dapat menjamin mendeteksi semua secret arbitrer, encoding atau obfuscation. Sebelum data nyata dikirim ke AI, tambahkan secret scanning yang ditinjau tim dan kebijakan redaksi/izin. Tidak ada jaminan semua kode tanpa pola secret pasti bebas credential.
- Konten yang lolos tetap data tidak tepercaya dan dapat memuat prompt injection. Milestone ini tidak mengeksekusi atau mengikuti instruksi file. Pemanggil AI berikutnya harus memisahkan bukti dari instruksi sistem serta membatasi token/retensi.
- Hanya UTF-8 yang didukung. File UTF-16, biner, media, generated output, source sangat besar, Git LFS payload tak relevan dan submodule tidak dianalisis. ZIP64/multidisk dan varian format lain tidak dijanjikan dukungannya; input tetap tunduk pada cap dan parser.
- Pembatasan ZIP melindungi konsumsi data pada reader, tetapi Buffer upload sudah dialokasikan sebelum fungsi dipanggil. Backend wajib membatasi request/storage download selama streaming sebelum membuat Buffer. Tidak ada public upload endpoint atau parsing multipart pada milestone ini.
- Nested archive diperiksa lewat ekstensi dan magic umum pada kandidat yang dibaca; file biner tersembunyi yang disaring tidak dibuka sebagai arsip. Tidak ada ekstraksi rekursif.
- Cakupan repo besar akan parsial atau ditolak. Batas commit response 128 KiB dapat menolak commit dengan diff metadata besar. Tidak ada retry otomatis, autentikasi GitHub, cache/queue global atau bypass rate limit.
- Reader tidak menulis file ke disk/database dan tidak memakai service role key. Helper Supabase tidak diimpor. Runtime Node dan batas caller tetap diperlukan; ini bukan worker sandbox untuk mengeksekusi kode.
- Error Gemini 503/504 dari Milestone 1 tidak diperbaiki atau ditutup dengan output palsu; ingestion tidak bergantung pada koneksi Gemini.

## 10. Integrasi berikutnya dan mapping Supabase

Pembaruan Milestone 3: temuan audit P1/P2/P3 ditutup dengan regression test. Filter sekarang mengecualikan `.docker`, `.kube`, direktori credential standar dan konteks `.config/gcloud`/`.config/gh`, mendeteksi indikator registry auth, serta mengenali `npm-shrinkwrap.json`/`packages.lock.json` dan lockfile tambahan. Path schema dan reader memakai satu kebijakan bersama (`project-path.ts`); schema mensyaratkan path kanonis dan menolak reserved names seperti `CON.ts`. `src/config.json` biasa tetap dapat disertakan. Scanner tetap heuristik, bukan jaminan deteksi semua secret. Putaran regression ingestion setelah perubahan ini berisi 44 test (40 test awal + 4 security regression); rincian hasil Milestone 3 ada di `milestone-03.md`.

| Metadata backend | Mapping yang disiapkan |
| --- | --- |
| `project_evidences.url` | Setelah otorisasi evidence/analysis, validasi sumber dan teruskan URL GitHub ke `ingestGithubRepository` |
| `project_evidences.storage_path` | Backend terotorisasi mengambil ZIP dari Supabase Storage dengan batas stream/ukuran, lalu meneruskan Buffer dan nama file aman ke `ingestZipProject`; jangan perlakukan storage_path sebagai URL fetch bebas |
| `project_evidences.id`, `analysis_id`, `user_id` | Tetap di lapisan backend untuk izin, traceability dan isolasi tenant; tidak diperlukan reader untuk fetch publik |
| `analyses.target_role`, `analyses.status` | Konteks analisis bisnis dan state job pada milestone berikutnya; bukan penilaian dalam normalizer |

Tidak ada perubahan tabel/RLS, migration, penyimpanan NormalizedProject, atau service-role access. Integrasi Gemini berikutnya menerima JSON yang telah lolos `normalizedProjectSchema`, mempertahankan `revision`, path bukti, warning dan status partial. Tim perlu merancang prompt bisnis, pembagian token, kontrak penilaian terstruktur, pembatasan job, secret scanning tambahan, dan penyimpanan terotorisasi. Keberadaan package atau bahasa di output tidak boleh langsung dianggap bukti penguasaan skill. Gemini belum dinyatakan berhasil menganalisis proyek.
