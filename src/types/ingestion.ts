import { z } from "zod";
import { isCanonicalProjectPath } from "@/lib/ingestion/project-path";

export const projectFileSchema = z.object({
  path: z.string().min(1).max(512).refine(isCanonicalProjectPath,
  { message: "Path must be a normalized relative path" }),
  language: z.string().optional(),
  content: z.string(),
  sizeBytes: z.number().int().nonnegative().max(64 * 1024),
}).strict().refine((file) => new TextEncoder().encode(file.content).length === file.sizeBytes, {
  message: "Content byte count does not match sizeBytes",
});

export const projectStatsSchema = z.object({
  discoveredFiles: z.number().int().nonnegative(),
  includedFiles: z.number().int().nonnegative().max(40),
  skippedFiles: z.number().int().nonnegative(),
  totalContentBytes: z.number().int().nonnegative().max(1024 * 1024),
}).strict();

export const normalizedProjectSchema = z.object({
  sourceType: z.enum(["github", "zip"]),
  projectName: z.string().min(1).max(100),
  sourceReference: z.string().min(1).max(512),
  revision: z.string().regex(/^[a-f0-9]{40}$/).optional(),
  files: z.array(projectFileSchema).max(40),
  stats: projectStatsSchema,
  warnings: z.array(z.enum([
    "DUPLICATE_PATH_SKIPPED", "UNSAFE_OR_IRRELEVANT_FILE_SKIPPED", "OUTPUT_LIMIT_REACHED",
    "PARTIAL_PROJECT_FILES_SKIPPED", "NO_RELEVANT_FILES",
  ])).max(50),
  status: z.enum(["complete", "partial"]),
}).strict().superRefine((project, context) => {
  const stats = project.stats;
  if (stats.includedFiles !== project.files.length ||
      stats.discoveredFiles !== stats.includedFiles + stats.skippedFiles ||
      stats.totalContentBytes !== project.files.reduce((sum, file) => sum + file.sizeBytes, 0) ||
      new Set(project.files.map((file) => file.path)).size !== project.files.length) {
    context.addIssue({ code: "custom", message: "Inconsistent project statistics or duplicate paths" });
  }
  if ((project.status === "complete" && (stats.skippedFiles > 0 || !project.files.length)) ||
      (project.sourceType === "github" && (!project.revision || !/^https:\/\/github\.com\/[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/.test(project.sourceReference))) ||
      (project.sourceType === "zip" && !/^[^/\\:\x00-\x1f]+\.zip$/i.test(project.sourceReference))) {
    context.addIssue({ code: "custom", message: "Invalid source reference or completeness status" });
  }
});

export type ProjectFile = z.infer<typeof projectFileSchema>;
export type ProjectStats = z.infer<typeof projectStatsSchema>;
export type NormalizedProject = z.infer<typeof normalizedProjectSchema>;

export type IngestionInput =
  | { sourceType: "github"; url: string }
  | { sourceType: "zip"; buffer: Buffer; filename: string }
  | { sourceType: "folder" | "gitlab" | "website" | "portfolio" | "deployment" | "pdf" | "cv"; reference: string };

/** Extension point for future authorized storage/ingestion adapters. */
export interface ProjectSourceReader<TInput> {
  read(input: TInput): Promise<NormalizedProject>;
}
