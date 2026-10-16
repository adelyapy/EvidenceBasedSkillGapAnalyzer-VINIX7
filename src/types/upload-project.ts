export type UploadProjectUrlSource = "github" | "portfolio" | "deployment";
export type UploadProjectSource = UploadProjectUrlSource | "pdf";

export type UploadProjectSourceOption = {
  id: UploadProjectSource;
  label: string;
  description: string;
  inputLabel: string;
  placeholder?: string;
};

export type UploadProjectLinkEvidence = {
  id: string;
  kind: "url";
  source: UploadProjectUrlSource;
  value: string;
};

export type UploadProjectPdfEvidence = {
  id: string;
  kind: "pdf";
  source: "pdf";
  file: File;
};

export type UploadProjectEvidence = UploadProjectLinkEvidence | UploadProjectPdfEvidence;
