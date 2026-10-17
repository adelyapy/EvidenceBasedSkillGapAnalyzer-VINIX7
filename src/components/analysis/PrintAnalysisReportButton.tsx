"use client";

import AnalysisResultIcon from "./AnalysisResultIcon";

export default function PrintAnalysisReportButton() {
  return (
    <button
      className="bkr-printButton bkr-screenOnly"
      type="button"
      onClick={() => window.print()}
      aria-describedby="bkr-print-help"
    >
      Unduh Laporan PDF
      <AnalysisResultIcon name="download" size={17} />
    </button>
  );
}
