function DashboardSkeletonBlock({ className = "" }: { className?: string }) {
  return <span className={`bkd-skeletonBlock ${className}`} />;
}

export function DashboardHeroSkeleton() {
  return (
    <div className="bkd-hero bkd-skeletonHero" aria-hidden="true">
      <div className="bkd-skeletonHeroCopy">
        <DashboardSkeletonBlock className="bkd-skeletonTitle" />
        <DashboardSkeletonBlock className="bkd-skeletonText" />
        <div className="bkd-skeletonActions">
          <DashboardSkeletonBlock className="bkd-skeletonButton" />
          <DashboardSkeletonBlock className="bkd-skeletonButton bkd-skeletonButton--secondary" />
        </div>
      </div>
      <DashboardSkeletonBlock className="bkd-skeletonHeroImage" />
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="bkd-stats" aria-hidden="true">
      {[0, 1, 2, 3].map((item) => (
        <div className="bkd-statCard bkd-skeletonStat" key={item}>
          <DashboardSkeletonBlock className="bkd-skeletonStatIcon" />
          <div className="bkd-skeletonStatCopy">
            <DashboardSkeletonBlock className="bkd-skeletonText bkd-skeletonText--short" />
            <DashboardSkeletonBlock className="bkd-skeletonValue" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardPanelSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <section
      className={`bkd-panel bkd-skeletonPanel${compact ? " bkd-skeletonPanel--compact" : ""}`}
      aria-hidden="true"
    >
      <div className="bkd-skeletonPanelHeading">
        <DashboardSkeletonBlock className="bkd-skeletonPanelTitle" />
        <DashboardSkeletonBlock className="bkd-skeletonPanelAction" />
      </div>
      <div className="bkd-skeletonPanelBody">
        <DashboardSkeletonBlock className="bkd-skeletonPanelIcon" />
        <DashboardSkeletonBlock className="bkd-skeletonText" />
        <DashboardSkeletonBlock className="bkd-skeletonText bkd-skeletonText--wide" />
        <DashboardSkeletonBlock className="bkd-skeletonButton" />
      </div>
    </section>
  );
}

export function DashboardPageSkeleton() {
  return (
    <section
      className="bkd-dashboard bkd-pageSkeleton"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="bkw-srOnly">Memuat dashboard...</span>
      <DashboardHeroSkeleton />
      <DashboardStatsSkeleton />
      <div className="bkd-contentGrid">
        <DashboardPanelSkeleton />
        <DashboardPanelSkeleton />
        <DashboardPanelSkeleton compact />
        <DashboardPanelSkeleton compact />
      </div>
    </section>
  );
}
