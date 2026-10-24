type WorkspaceRouteSkeletonProps = {
  variant: "analysis" | "history" | "profile";
};

const statusLabels = {
  analysis: "Memuat halaman analisa baru",
  history: "Memuat riwayat analisis",
  profile: "Memuat profil",
} as const;

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <span className={`bkwrl-block ${className}`} />;
}

export default function WorkspaceRouteSkeleton({
  variant,
}: WorkspaceRouteSkeletonProps) {
  return (
    <section
      className={`bkwrl-route bkwrl-route--${variant}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="bkw-srOnly">{statusLabels[variant]}...</span>

      <div className="bkwrl-visual" aria-hidden="true">
        {variant !== "analysis" && (
          <header className="bkwrl-heading">
            <SkeletonBlock className="bkwrl-badge" />
            <SkeletonBlock className="bkwrl-title" />
            <SkeletonBlock className="bkwrl-copy" />
          </header>
        )}

        {variant === "profile" && (
          <div className="bkwrl-profileGrid">
            <article className="bkwrl-card bkwrl-profileCard">
              <SkeletonBlock className="bkwrl-avatar" />
              <SkeletonBlock className="bkwrl-line bkwrl-line--short" />
              <SkeletonBlock className="bkwrl-line" />
              <SkeletonBlock className="bkwrl-pill" />
            </article>
            <article className="bkwrl-card bkwrl-detailCard">
              <SkeletonBlock className="bkwrl-sectionTitle" />
              {[0, 1, 2, 3].map((item) => (
                <div className="bkwrl-detailRow" key={item}>
                  <SkeletonBlock className="bkwrl-line bkwrl-line--label" />
                  <SkeletonBlock className="bkwrl-line" />
                </div>
              ))}
            </article>
          </div>
        )}

        {variant === "history" && (
          <>
            <div className="bkwrl-statGrid">
              {[0, 1, 2].map((item) => (
                <article className="bkwrl-card bkwrl-stat" key={item}>
                  <SkeletonBlock className="bkwrl-icon" />
                  <div>
                    <SkeletonBlock className="bkwrl-line bkwrl-line--short" />
                    <SkeletonBlock className="bkwrl-line" />
                  </div>
                </article>
              ))}
            </div>
            <article className="bkwrl-card bkwrl-filter">
              <SkeletonBlock className="bkwrl-sectionTitle" />
              <div className="bkwrl-filterGrid">
                {[0, 1, 2, 3].map((item) => (
                  <SkeletonBlock className="bkwrl-field" key={item} />
                ))}
              </div>
            </article>
            <article className="bkwrl-card bkwrl-list">
              <SkeletonBlock className="bkwrl-sectionTitle" />
              <SkeletonBlock className="bkwrl-emptyArea" />
            </article>
          </>
        )}

        {variant === "analysis" && (
          <>
            <div className="bkwrl-stepper">
              {[0, 1, 2, 3].map((item) => (
                <span className="bkwrl-step" key={item}>
                  <SkeletonBlock className="bkwrl-stepCircle" />
                  <SkeletonBlock className="bkwrl-line" />
                </span>
              ))}
            </div>
            <article className="bkwrl-card bkwrl-analysisHero">
              <div className="bkwrl-analysisHeroCopy">
                <SkeletonBlock className="bkwrl-title" />
                <SkeletonBlock className="bkwrl-copy" />
                <SkeletonBlock className="bkwrl-copy bkwrl-copy--short" />
              </div>
              <SkeletonBlock className="bkwrl-analysisArtwork" />
            </article>
            <div className="bkwrl-sourceTabs">
              {[0, 1, 2, 3, 4].map((item) => (
                <span className="bkwrl-sourceTab" key={item}>
                  <SkeletonBlock className="bkwrl-sourceIcon" />
                  <span className="bkwrl-sourceCopy">
                    <SkeletonBlock className="bkwrl-line bkwrl-line--short" />
                    <SkeletonBlock className="bkwrl-line" />
                  </span>
                </span>
              ))}
            </div>
            <div className="bkwrl-sourceForm">
              <SkeletonBlock className="bkwrl-field" />
              <SkeletonBlock className="bkwrl-button" />
            </div>
            <SkeletonBlock className="bkwrl-analysisEmpty" />
            <SkeletonBlock className="bkwrl-analysisTips" />
          </>
        )}
      </div>
    </section>
  );
}
