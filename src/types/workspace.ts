export type WorkspaceIconName = "dashboard" | "analysis" | "history" | "profile" | "logout" | "chevron" | "menu" | "close" | "book" | "plus" | "target";

export type WorkspaceNavItem = {
  label: string;
  icon: WorkspaceIconName;
  href?: string;
  activePrefix?: string;
};

export type WorkspaceUser = {
  name: string;
  role: string;
  avatar: string;
};

export type WorkspaceProfileUpdatedDetail = {
  name?: string;
  avatar?: string;
};
