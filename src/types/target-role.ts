export type TargetRoleId =
  | "frontend"
  | "backend"
  | "mobile"
  | "data-analyst"
  | "ui-ux"
  | "devops";

export type TargetRoleIconName =
  | "code"
  | "server"
  | "mobile"
  | "chart"
  | "design"
  | "cloud";

export type TargetRoleOption = {
  id: TargetRoleId;
  label: string;
  icon: TargetRoleIconName;
};

export type TargetRoleDraft = {
  role: TargetRoleId;
  jobDescription: string;
};
