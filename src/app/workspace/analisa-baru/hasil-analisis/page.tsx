import Link from "next/link";
import { analysisRoutes } from "@/data/analysis";
import "@/styles/analysis.css";

export default function WorkspaceAnalysisResultPage() {
  return (
    <section className="analysis-result" aria-labelledby="analysis-result-heading">
      <h1 id="analysis-result-heading">Validasi Selesai</h1>
      <p>Kelima jawaban berhasil disimpan sementara. Halaman hasil analisis akan dihubungkan dengan backend pada tahap berikutnya.</p>
      <Link href={analysisRoutes.question(5)}>Kembali ke Pertanyaan 5</Link>
    </section>
  );
}
