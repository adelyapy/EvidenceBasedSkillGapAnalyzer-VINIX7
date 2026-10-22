import "server-only";
import { z } from "zod";
import { normalizedProjectSchema } from "./ingestion";
import { containsPossibleSecret } from "@/lib/ingestion/file-filter";

export const ANALYSIS_PIPELINE_LIMITS = Object.freeze({ evidences: 8, benchmarks: 100, roleCatalog: 200, contentBytes: 2 * 1024 * 1024, files: 80 });
export const uuidSchema = z.uuid();

/** Cast int8 columns to text in SELECT before JSON parsing can round them. */
export const databaseInt8Schema = z.union([
  z.string().regex(/^[1-9]\d{0,18}$/),
  z.number().int().positive().refine(Number.isSafeInteger),
]).transform(String).refine(value => BigInt(value) <= BigInt("9223372036854775807"));

export const safeTextSchema = z.string().trim().min(1).max(2000).refine(value =>
  !/[\x00-\x1f\x7f\u202a-\u202e\u2066-\u2069]/u.test(value) && !containsPossibleSecret(value));
const optionalText = safeTextSchema.nullable();
const label = safeTextSchema.pipe(z.string().max(160));
const sourceUrl = z.string().max(512).refine(value => {
  if (/[\x00-\x20\x7f]/.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.search && !url.hash && !containsPossibleSecret(value);
  } catch { return false; }
}).nullable();

// Projections of the supplied ERD. Actual deployed schema/RLS remains unverified.
export const analysisRowSchema = z.object({
  id: uuidSchema, user_id: uuidSchema, status: label, target_role: label,
  created_at: z.iso.datetime({ offset: true }), updated_at: z.iso.datetime({ offset: true }),
});
export const evidenceRowSchema = z.object({
  id: uuidSchema, analysis_id: uuidSchema, user_id: uuidSchema,
  evidence_type: z.string().min(1).max(80),
  title: z.string().max(500).nullable(), url: z.string().max(2048).nullable(),
  storage_path: z.string().max(1024).nullable(), description: z.string().max(5000).nullable(),
});
export const cvRowSchema = z.object({
  id: uuidSchema, analysis_id: uuidSchema, user_id: uuidSchema,
  storage_path: z.string().min(1).max(1024),
  original_filename: label.refine(value => !/[\\/:]/.test(value)),
  mime_type: label, file_size_bytes: z.number().int().nonnegative().max(100 * 1024 * 1024),
});
export const targetRoleRowSchema = z.object({
  id: databaseInt8Schema, name: label, slug: label, description: optionalText, is_active: z.boolean(),
});
export const benchmarkRowSchema = z.object({
  id: databaseInt8Schema, target_role_id: databaseInt8Schema, skill_id: databaseInt8Schema,
  required_level: z.union([label, z.number().finite().min(0).max(100)]),
  priority: z.union([label, z.number().finite().min(0).max(100)]),
  source_name: label.nullable(), source_url: sourceUrl,
});
export const skillRowSchema = z.object({ id: databaseInt8Schema, name: label, category: label.nullable(), description: optionalText });

export const evidenceIssueSchema = z.enum([
  "UNSUPPORTED_SOURCE", "STORAGE_READER_NOT_READY", "INVALID_GITHUB_URL",
  "EVIDENCE_FETCH_FAILED", "EVIDENCE_LIMIT_EXCEEDED", "EVIDENCE_OUTPUT_REJECTED", "ANALYSIS_CONTENT_LIMIT_REACHED",
]);
const evidenceBase = { evidenceId: uuidSchema, sourceType: z.enum(["github","zip","pdf","cv","portfolio","website","deployment","gitlab","folder","unknown"]), sourceReference: z.string().max(512) };
export const analysisEvidenceSchema = z.discriminatedUnion("status", [
  z.object({ ...evidenceBase, status: z.literal("complete"), normalizedProject: normalizedProjectSchema, warnings: z.array(evidenceIssueSchema).max(8) }).strict(),
  z.object({ ...evidenceBase, status: z.literal("partial"), normalizedProject: normalizedProjectSchema, warnings: z.array(evidenceIssueSchema).max(8) }).strict(),
  z.object({ ...evidenceBase, status: z.enum(["unsupported","blocked","failed"]), error: evidenceIssueSchema, warnings: z.array(evidenceIssueSchema).max(8) }).strict(),
]);

export const analysisInputSchema = z.object({
  analysisId: uuidSchema, userId: uuidSchema,
  targetRole: z.object({ id: databaseInt8Schema, name: label, slug: label, description: optionalText }).strict(),
  benchmarks: z.array(z.object({
    benchmarkId: databaseInt8Schema, skillId: databaseInt8Schema, skillName: label,
    category: label.nullable(), description: optionalText,
    requiredLevel: benchmarkRowSchema.shape.required_level, priority: benchmarkRowSchema.shape.priority,
    sourceName: label.nullable(), sourceUrl,
  }).strict()).min(1).max(ANALYSIS_PIPELINE_LIMITS.benchmarks),
  evidences: z.array(analysisEvidenceSchema).max(ANALYSIS_PIPELINE_LIMITS.evidences),
  cv: z.object({
    id: uuidSchema, sourceReference: z.string().regex(/^cv:[0-9a-f-]+$/i),
    originalFilename: cvRowSchema.shape.original_filename, mimeType: label,
    sizeBytes: cvRowSchema.shape.file_size_bytes, contentStatus: z.literal("unsupported"),
  }).strict().nullable(),
  processingStatus: z.enum(["complete","partial","unsupported","blocked","failed"]),
  warnings: z.array(z.enum(["NO_PROJECT_EVIDENCE","INCOMPLETE_EVIDENCE","CV_METADATA_ONLY"])).max(3),
}).strict().superRefine((input, context) => {
  let bytes = 0;
  let files = 0;
  for (const evidence of input.evidences) {
    if ("normalizedProject" in evidence) {
      bytes += evidence.normalizedProject.stats.totalContentBytes;
      files += evidence.normalizedProject.files.length;
      if (evidence.status !== evidence.normalizedProject.status || evidence.sourceType !== evidence.normalizedProject.sourceType ||
          evidence.sourceReference !== evidence.normalizedProject.sourceReference) {
        context.addIssue({code:"custom",message:"Evidence status/source mismatch"});
      }
    }
    if (!("normalizedProject" in evidence) && evidence.sourceReference !== `evidence:${evidence.evidenceId}`) {
      context.addIssue({code:"custom",message:"Unsafe internal reference"});
    }
  }
  if (bytes > ANALYSIS_PIPELINE_LIMITS.contentBytes || files > ANALYSIS_PIPELINE_LIMITS.files ||
      new Set(input.evidences.map(e => e.evidenceId)).size !== input.evidences.length ||
      new Set(input.benchmarks.map(b => b.skillId)).size !== input.benchmarks.length ||
      input.processingStatus !== getProcessingStatus(input.evidences)) {
    context.addIssue({code:"custom",message:"Inconsistent analysis input"});
  }
});

export type AnalysisEvidence = z.infer<typeof analysisEvidenceSchema>;
export type AnalysisInput = z.infer<typeof analysisInputSchema>;
export type EvidenceRow = z.infer<typeof evidenceRowSchema>;
export type CvRow = z.infer<typeof cvRowSchema>;

export function getProcessingStatus(evidences: AnalysisEvidence[]): "complete"|"partial"|"unsupported"|"blocked"|"failed" {
  if (!evidences.length) return "blocked";
  if (evidences.every(e => e.status === "complete")) return "complete";
  if (evidences.some(e => e.status === "complete" || e.status === "partial")) return "partial";
  if (evidences.some(e => e.status === "failed")) return "failed";
  if (evidences.some(e => e.status === "blocked")) return "blocked";
  return "unsupported";
}
