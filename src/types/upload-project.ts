export type UploadProjectUrlSource = "github" | "portfolio" | "deployment" | "linkedin";
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
  file: File | {
    name: string;
    size: number;
    type?: string;
    lastModified?: number;
  };
};

export type UploadProjectEvidence = UploadProjectLinkEvidence | UploadProjectPdfEvidence;
