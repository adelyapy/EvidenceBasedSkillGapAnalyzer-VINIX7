import "server-only";
import { createHash } from "node:crypto";
import { questions } from "@/components/validation/questions";
import { uuidSchema } from "@/types/analysis-input";
import type { ValidationQuestion } from "@/types/validation-evaluation";

/** Server-owned identities. Uses UUID v5 with the URL namespace; not a database write. */
export function createValidationQuestions(rawAnalysisId: string): ValidationQuestion[] {
  const analysisId = uuidSchema.parse(rawAnalysisId);
  return ([1, 2, 3, 4, 5] as const).map(order => {
    const bytes = createHash("sha1").update(Buffer.from("6ba7b8119dad11d180b400c04fd430c8", "hex"))
      .update(`buktiva-validation-v1:${analysisId}:${order}`).digest().subarray(0, 16);
    bytes[6] = (bytes[6] & 0x0f) | 0x50; bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = bytes.toString("hex");
    return { questionId: `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`,
      analysisId, order, questionText: questions[order].question };
  });
}
