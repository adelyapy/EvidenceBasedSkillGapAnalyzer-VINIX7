# BUKTIVA — AI Quality Assurance & Evaluation Report

## 1. Ringkasan Eksekusi (Executive Summary)

Sebagai AI Engineer 2, saya bertanggung jawab atas kualitas data, validasi output AI, pengujian otomatis, integrasi formatter, dan memastikan hasil AI siap digunakan oleh _frontend_.

Sistem AI BUKTIVA telah berhasil diuji menggunakan **Node.js Test Runner**. Hasil akhir menunjukkan:

- **Total Test:** 67 (Seluruh suite AI)
- **Status:** **67 PASSED, 0 FAILED**
- **Durasi Eksekusi:** ~1.6 detik (Sangat cepat dan efisien).

Semua temuan audit pada fase sebelumnya telah berhasil diamankan melalui _automated testing_, dataset evaluasi telah disiapkan, dan integrasi Skill Gap serta Roadmap telah berhasil diselaraskan dengan modul _Scoring_ milik tim _Backend_.

---

## 2. Perbaikan Temuan Audit

Berdasarkan audit proyek sebelumnya, terdapat dua masalah kritis yang berhasil diselesaikan oleh AI Engineer 2:

1.  **Temuan 1: Validasi 5 Jawaban Bisa Di-bypass**
    - **Solusi:** Membuat fungsi `normalizeAnalysisInput()` yang memastikan jumlah jawaban tepat 5. Jika kurang, sistem akan menolak sebelum memanggil Gemini.
    - **Bukti Uji:** Lulus di `tests/ai/input.test.ts`.
2.  **Temuan 2: _State Leakage_ (Data Sesi Lama Bocor ke Sesi Baru)**
    - **Solusi:** Membuat fungsi `verifyAnalysisSession()` untuk mencocokkan `analysisId` sesi aktif dengan data yang masuk. Jika tidak cocok, data ditolak.
    - **Bukti Uji:** Lulus di `tests/ai/input.test.ts`.

---

## 3. Modul yang Telah Dibangun (Hasil Kerja)

| Modul              | File                                           | Fungsi Utama                                                                                                                                                                                         |
| :----------------- | :--------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Preprocessing**  | `src/lib/ai/input-processor.ts`                | Membersihkan teks (repository/PDF), memotong teks kepanjangan (maks 15.000 karakter), dan validasi 5 jawaban.                                                                                        |
| **Validation**     | `src/lib/ai/validation/ai-output-validator.ts` | Menggunakan **Zod** untuk mencegah halusinasi Gemini (memastikan `level` 0-4, `confidence` 0-1, dan `skillId` valid). Skema dibuat fleksibel (menerima ID angka/string) agar selaras dengan backend. |
| **Error Handling** | `src/lib/ai/error-handler.ts`                  | Menangani kegagalan API, timeout, dan JSON rusak dengan mengembalikan status `failed` yang aman.                                                                                                     |
| **Formatter**      | `src/lib/ai/ai-result-formatter.ts`            | Memformat data agar siap dipakai _frontend_ (persentase progress bar, warna badge, kalkulasi otomatis _skill gap_ jika belum ada, dan format Roadmap).                                               |
| **Integration**    | `src/lib/scoring/skill-gap-calculator.ts`      | Memanggil fungsi `calculateSkillGap` resmi dari tim _Backend_ agar hasil kalkulasi UI dan Backend selalu konsisten (Single Source of Truth).                                                         |
| **Evaluator**      | `src/lib/ai/evaluation/evaluator.ts`           | Membandingkan output Gemini dengan _Ground Truth_ (`golden-dataset.json`) untuk mengukur akurasi.                                                                                                    |
| **Dataset Uji**    | `src/data/evaluation/golden-dataset.json`      | Berisi skenario awal (kasus sukses, gagal, dan halusinasi) untuk menguji akurasi AI.                                                                                                                 |

---

## 4. Kontrak Data Final untuk Frontend

Tim _Frontend_ (`AnalysisResultPage.tsx`, `SkillGapReportPage.tsx`, dll) **wajib** menggunakan fungsi `formatResponseForFrontend()` yang ada di `ai-result-formatter.ts`.

Fungsi ini menjamin _frontend_ selalu menerima struktur JSON yang konsisten, bahkan jika AI gagal:

```json
{
  "analysisId": "string",
  "status": "completed | partial | failed",
  "processedAt": "ISO_String",
  "skills": [
    {
      "skillId": "string | number",
      "skillName": "string",
      "level": "number (0-4)",
      "percentage": "number (0-100)",
      "uiBadgeColor": "red | yellow | green"
    }
  ],
  "skillGaps": [
    {
      "rank": "number",
      "skillName": "string",
      "gapText": "Selisih X level",
      "priorityLabel": "Prioritas Tinggi | Sedang | Rendah",
      "badgeColorClass": "string (Tailwind CSS class)"
    }
  ],
  "roadmap": [
    {
      "stepNumber": "number",
      "title": "string",
      "duration": "string",
      "topics": ["array of strings"],
      "buttonText": "string",
      "isMaterialAvailable": "boolean"
    }
  ],
  "validationPassed": "boolean",
  "errorMessage": "string (opsional, jika status failed)"
}
```
