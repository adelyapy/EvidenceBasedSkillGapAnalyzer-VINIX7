import "server-only";
import { z } from "zod";
import file from "@/data/roadmap/learning-resources.json";
import { canonical } from "@/lib/scoring/scoring-context";
import { RoadmapError } from "./errors";
import { validateRubricDataset } from "@/lib/ai/rubric-dataset";

const hosts=new Set(["www.typescriptlang.org","developer.mozilla.org","react.dev","nextjs.org","nodejs.org","git-scm.com","docs.github.com","tailwindcss.com"]);
export const learningResourceSchema=z.object({resourceId:z.string().regex(/^[a-z0-9-]{1,80}$/),skillKey:z.string().regex(/^[a-z0-9-]{1,40}$/),title:z.string().min(1).max(160),
  url:z.string().max(512).refine(value=>{try{const u=new URL(value);return u.protocol==="https:"&&hosts.has(u.hostname)&&!u.username&&!u.password&&!u.port&&!u.search&&!u.hash&&u.href===value;}catch{return false;}}),
  publisher:z.string().min(1).max(80),versionScope:z.string().min(1).max(100),verifiedOn:z.iso.date(),verification:z.literal("official_page_opened"),language:z.literal("en"),durationMinutes:z.null(),
}).strict();
export const resourceCatalogSchema=z.object({catalogVersion:z.literal("1.0.0"),provenance:z.string().min(1).max(300),
  review:z.object({status:z.literal("source_verified_pedagogy_pending"),performedBy:z.literal("codex_source_verification"),method:z.literal("official_page_opened_and_skill_scope_checked"),
    reviewedOn:z.iso.date(),humanCurriculumApproval:z.null()}).strict(),resources:z.array(learningResourceSchema).max(20)}).strict().superRefine((r,c)=>{
  const keys=new Set(validateRubricDataset().rubrics.roles.find(role=>role.slug==="frontend-developer")!.rubrics.map(r=>r.key));
  if(new Set(r.resources.map(r=>r.resourceId)).size!==r.resources.length||new Set(r.resources.map(r=>r.skillKey)).size!==r.resources.length||r.resources.some(resource=>!keys.has(resource.skillKey)))c.addIssue({code:"custom",message:"Duplicate or unknown resource identity/mapping"});
});
export function parseResourceCatalog(raw:unknown=file){const result=resourceCatalogSchema.safeParse(raw);if(!result.success)throw new RoadmapError("INVALID_CATALOG");return result.data;}
export function loadResourceCatalog(raw?:unknown){const catalog=parseResourceCatalog(raw);if(canonical(catalog)!==canonical(parseResourceCatalog()))throw new RoadmapError("UNTRUSTED_CATALOG");return catalog;}
export type ResourceCatalog=ReturnType<typeof parseResourceCatalog>;
