export type HistoryStatusTone =
  | "completed"
  | "draft"
  | "failed"
  | "processing"
  | "unknown";

export type HistoryStatusIconName =
  | "check"
  | "draft"
  | "error"
  | "processing"
  | "help";

export function getHistoryStatusPresentation(status: string): {
  tone: HistoryStatusTone;
  icon: HistoryStatusIconName;
} {
  switch (status.trim().toLowerCase()) {
    case "completed":
    case "complete":
    case "success":
    case "selesai":
      return { tone: "completed", icon: "check" };
    case "draft":
      return { tone: "draft", icon: "draft" };
    case "failed":
    case "error":
    case "gagal":
      return { tone: "failed", icon: "error" };
    case "processing":
    case "in_progress":
    case "analyzing":
      return { tone: "processing", icon: "processing" };
    default:
      return { tone: "unknown", icon: "help" };
  }
}
