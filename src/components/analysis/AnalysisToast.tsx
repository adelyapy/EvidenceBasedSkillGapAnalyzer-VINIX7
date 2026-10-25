type AnalysisToastProps = {
  id?: string;
  type: "success" | "error";
  message: string;
  leaving?: boolean;
};

export default function AnalysisToast({
  id,
  type,
  message,
  leaving = false,
}: AnalysisToastProps) {
  return (
    <div
      id={id}
      className={`analysis-toast analysis-toast--${type}${
        leaving ? " analysis-toast--leaving" : ""
      }`}
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
      aria-atomic="true"
    >
      <span className="analysis-toastIcon" aria-hidden="true">
        {type === "success" ? "✓" : "!"}
      </span>
      <span>{message}</span>
    </div>
  );
}
