import { notFound } from "next/navigation";
import ValidationPage from "@/components/validation/ValidationPage";
import { isQuestionNumber } from "@/components/validation/questions";
import "@/styles/validation.css";

type Props = { params: Promise<{ nomor: string }> };

export const instant = false;

export default async function WorkspaceValidationPage({ params }: Props) {
  const { nomor } = await params;
  const step = Number(nomor);

  if (!isQuestionNumber(step)) notFound();
  return <ValidationPage step={step} />;
}
