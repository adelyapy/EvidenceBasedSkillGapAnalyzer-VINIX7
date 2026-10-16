import Link from "next/link";

export default function HasilAnalisisPage() {
  return (
    <main style={{ padding: 40 }}>
      <h1>Validasi Selesai</h1>
      <p>
        Kelima jawaban berhasil disimpan sementara.
        Halaman hasil analisis akan dihubungkan
        dengan backend pada tahap berikutnya.
      </p>

      <Link href="/pertanyaan-5">
        Kembali ke Pertanyaan 5
      </Link>
    </main>
  );
}