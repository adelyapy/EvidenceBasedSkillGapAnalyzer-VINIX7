export default function ValidationQuestionSkeleton() {
  return (
    <div
      className="validation-page validation-skeletonPage"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="validation-srOnly">
        Menyiapkan pertanyaan validasi pertama...
      </span>

      <div className="validation-content" aria-hidden="true">
        <div className="validation-intro validation-skeletonIntro">
          <span className="validation-skeletonBlock validation-skeletonTitle" />
          <span className="validation-skeletonBlock validation-skeletonCopy" />
          <span className="validation-skeletonBlock validation-skeletonCopy validation-skeletonCopy--short" />
        </div>

        <div className="validation-progress-section">
          <span className="validation-skeletonBlock validation-skeletonProgressLabel" />
          <span className="validation-skeletonBlock validation-skeletonProgressTrack" />
        </div>

        <div className="validation-workspace">
          <div className="validation-form">
            <div className="validation-question-card validation-skeletonQuestionCard">
              <span className="validation-skeletonBlock validation-skeletonEyebrow" />
              <span className="validation-skeletonBlock validation-skeletonQuestion" />
              <span className="validation-skeletonBlock validation-skeletonTextarea" />
            </div>

            <div className="validation-buttons">
              <span className="validation-skeletonBlock validation-skeletonButton" />
            </div>
          </div>

          <aside className="validation-tips validation-skeletonTips">
            <span className="validation-skeletonBlock validation-skeletonTipsTitle" />
            <span className="validation-skeletonBlock validation-skeletonTipsLine" />
            <span className="validation-skeletonBlock validation-skeletonTipsLine validation-skeletonTipsLine--medium" />
            <span className="validation-skeletonBlock validation-skeletonTipsLine" />
            <span className="validation-skeletonBlock validation-skeletonTipsLine validation-skeletonTipsLine--short" />
          </aside>
        </div>
      </div>
    </div>
  );
}
