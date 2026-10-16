import { redirect } from "next/navigation";
import { analysisRoutes } from "@/data/analysis";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const instant = false;

export default async function LegacyUploadCvRoute({ searchParams }: Props) {
  const source = await searchParams;
  const query = new URLSearchParams();

  for (const key of ["target_role", "deskripsi_pekerjaan", "demo", "next"]) {
    const value = source[key];
    if (typeof value === "string") query.set(key, value);
  }

  return redirect(`${analysisRoutes.uploadCv}${query.size ? `?${query.toString()}` : ""}`);
}
