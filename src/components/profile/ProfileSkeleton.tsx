const detailRows = ["name", "email", "password", "joined"] as const;

export default function ProfileSkeleton() {
  return (
    <div
      className="bkpfl-page bkpfl-skeletonPage"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="bkpfl-visuallyHidden">Memuat profil...</span>

      <div aria-hidden="true">
        <header className="bkpfl-pageHeader bkpfl-skeletonHeader">
          <div>
            <span className="bkpfl-skeletonBlock bkpfl-skeletonKicker" />
            <span className="bkpfl-skeletonBlock bkpfl-skeletonTitle" />
            <span className="bkpfl-skeletonBlock bkpfl-skeletonDescription" />
          </div>
          <span className="bkpfl-skeletonBlock bkpfl-skeletonEdit" />
        </header>

        <div className="bkpfl-grid">
          <section className="bkpfl-card bkpfl-overview bkpfl-skeletonCard">
            <span className="bkpfl-skeletonBlock bkpfl-skeletonAvatar" />
            <div className="bkpfl-skeletonIdentity">
              <span className="bkpfl-skeletonBlock bkpfl-skeletonEyebrow" />
              <span className="bkpfl-skeletonBlock bkpfl-skeletonName" />
              <span className="bkpfl-skeletonBlock bkpfl-skeletonEmail" />
              <span className="bkpfl-skeletonBlock bkpfl-skeletonRole" />
            </div>
          </section>

          <section className="bkpfl-card bkpfl-information bkpfl-skeletonCard">
            <div className="bkpfl-cardHeading bkpfl-skeletonCardHeading">
              <span className="bkpfl-skeletonBlock bkpfl-skeletonEyebrow" />
              <span className="bkpfl-skeletonBlock bkpfl-skeletonInformationTitle" />
            </div>

            <div className="bkpfl-details">
              {detailRows.map((row) => (
                <div className="bkpfl-detailRow" key={row}>
                  <span className="bkpfl-skeletonBlock bkpfl-skeletonDetailLabel" />
                  <span className="bkpfl-skeletonBlock bkpfl-skeletonDetailValue" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
