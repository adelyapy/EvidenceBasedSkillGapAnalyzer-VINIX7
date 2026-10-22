import "server-only";
export const successCriteriaTemplates={
  review:["Reviewer mencatat bukti yang mendukung, bertentangan, atau belum tersedia.","Keputusan dan keterbatasan ditulis; perubahan policy memerlukan proses persetujuan terpisah."],
  learn:["Kesesuaian materi dan versi dengan proyek diperiksa sebelum latihan.","Artefak latihan dan alasan keputusan teknis tersedia untuk diperiksa."],
  collect:["Artefak teknis dan provenance tersedia tanpa kredensial atau data pribadi.","Penjelasan membedakan bagian pribadi, tim, dan hal yang belum dapat diverifikasi."],
  verify:["Skenario, hasil yang diharapkan dan hasil yang benar-benar diamati didokumentasikan.","Reviewer dapat menelusuri hasil ke artefak; kegagalan dan keterbatasan tetap dicatat."],
  reassess:["Bukti yang diperbarui dan tindak lanjut reviewer tersedia.","Mapping, policy dan otorisasi diperiksa ulang sebelum evaluasi; hasil unknown tetap diperbolehkan."],
} as const;
/** Proposed observable artifacts, never a time commitment or guarantee of level advancement. */
export function buildSuccessCriteria(template:keyof typeof successCriteriaTemplates):string[]{return [...successCriteriaTemplates[template]];}
