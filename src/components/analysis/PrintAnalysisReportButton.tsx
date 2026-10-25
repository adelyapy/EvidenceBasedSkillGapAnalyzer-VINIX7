"use client";

import AnalysisResultIcon from "./AnalysisResultIcon";

export default function PrintAnalysisReportButton() {
  return (
    <button
      className="bkr-printButton bkr-screenOnly"
      type="button"
      onClick={() => window.print()}
    >
      Cetak laporan PDF
      <AnalysisResultIcon name="download" size={17} />
    </button>
  );
}
