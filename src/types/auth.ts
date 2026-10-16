export type AuthMode = "login" | "register" | "reset";
export type FieldName = "fullName" | "email" | "password" | "confirmPassword";
export type FormValues = Record<FieldName, string>;
export type FormErrors = Partial<Record<FieldName, string>>;
export type Notice = { type: "info" | "error"; text: string } | null;
