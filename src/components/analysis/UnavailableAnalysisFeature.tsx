import Link from "next/link";

type UnavailableAnalysisFeatureProps = {
  featureName: string;
  description: string;
};

export default function UnavailableAnalysisFeature({
  featureName,
  description,
}: UnavailableAnalysisFeatureProps) {
  return (
    <section
      className="bkuf-page"
      aria-labelledby="bkuf-title"
      aria-describedby="bkuf-description"
    >
      <div className="bkuf-card" role="status" aria-live="polite">
        <div className="bkuf-icon" aria-hidden="true">
          <span>!</span>
        </div>

        <p className="bkuf-badge">FITUR BELUM TERSEDIA</p>
        <h1 id="bkuf-title">{featureName} belum dapat diakses</h1>
        <p id="bkuf-description" className="bkuf-description">
          {description}
        </p>

        <div className="bkuf-notice">
          <span aria-hidden="true">i</span>
          <p>
            Halaman ini belum digunakan pada alur BUKTIVA saat ini. Kamu tetap
            dapat melihat ringkasan dan riwayat analisis dari Dashboard.
          </p>
        </div>

        <Link className="bkuf-dashboardLink" href="/workspace/dashboard">
          Kembali ke Dashboard
          
        </Link>
      </div>
    </section>
  );
}
