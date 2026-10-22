import test from "node:test";
import assert from "node:assert/strict";
import { loadRoadmapPolicy,parseRoadmapPolicy } from "@/lib/roadmap/roadmap-policy";
import { loadResourceCatalog,parseResourceCatalog } from "@/lib/roadmap/resource-catalog";
import { matchLearningResource } from "@/lib/roadmap/learning-resource-matcher";
import { roadmapFixture } from "./fixtures";

test("roadmap policy preserves draft, four phases and all four distinct activity types",()=>{
  const policy=loadRoadmapPolicy();assert.equal(policy.policyStatus,"draft");assert.equal(policy.phaseOrderingRules.length,4);
  assert.deepEqual(policy.allowedActivityTypes,["learning","evidence_collection","manual_review","reassessment"]);
  assert.equal(policy.fallbackRules.duration,"unknown_null");
});
for(const change of ["approved","version","duplicate-phase","duplicate-type","reorder","extra","limit"] as const){
  test(`policy rejects ${change}`,()=>{
    const raw=structuredClone(loadRoadmapPolicy()) as unknown as Record<string,unknown>;
    if(change==="approved")raw.policyStatus="approved";
    if(change==="version")delete raw.policyVersion;
    if(change==="duplicate-phase")raw.phaseOrderingRules=[loadRoadmapPolicy().phaseOrderingRules[0],...loadRoadmapPolicy().phaseOrderingRules.slice(0,3)];
    if(change==="duplicate-type")raw.allowedActivityTypes=["learning","learning","manual_review","reassessment"];
    if(change==="reorder")raw.phaseOrderingRules=loadRoadmapPolicy().phaseOrderingRules.reverse();
    if(change==="extra")raw.approvalFromRequest=true;
    if(change==="limit")raw.fallbackRules={...loadRoadmapPolicy().fallbackRules,maxSkills:1000};
    assert.throws(()=>parseRoadmapPolicy(raw),/INVALID_POLICY/);
  });
}
test("even schema-valid policy changes cannot replace the pinned runtime draft",()=>{
  const policy=loadRoadmapPolicy();policy.fallbackRules.maxSkills=1;
  assert.throws(()=>loadRoadmapPolicy(policy),/UNTRUSTED_POLICY/);
});
test("resource catalog contains verified official references without time estimates",()=>{
  const catalog=loadResourceCatalog();assert.equal(catalog.resources.length,10);
  assert.equal(catalog.review.status,"source_verified_pedagogy_pending");
  assert.equal(catalog.review.performedBy,"codex_source_verification");assert.equal(catalog.review.humanCurriculumApproval,null);
  assert.ok(catalog.resources.every(r=>r.verification==="official_page_opened"&&r.durationMinutes===null&&r.verifiedOn==="2026-10-22"));
});
test("catalog rejects fabricated review approval and unknown skill mappings",()=>{
  const catalog=loadResourceCatalog();catalog.resources[0].skillKey="unknown-skill";
  assert.throws(()=>parseResourceCatalog(catalog),/INVALID_CATALOG/);
  assert.throws(()=>parseResourceCatalog({...loadResourceCatalog(),review:{...loadResourceCatalog().review,status:"human_approved"}}),/INVALID_CATALOG/);
});
for(const url of ["http://react.dev/learn","https://react.dev.evil.invalid/learn","https://user:pass@react.dev/learn","https://react.dev/learn?token=x","javascript:alert(1)","https://127.0.0.1/test","https://react.dev:8443/learn"]){
  test(`resource rejects unsafe URL ${url.split(":")[0]} / ${url.length}`,()=>{
    const catalog=loadResourceCatalog();catalog.resources[0].url=url;assert.throws(()=>parseResourceCatalog(catalog),/INVALID_CATALOG/);
  });
}
test("untrusted catalog resources, duplicate IDs and extra fields cannot enter runtime",()=>{
  const catalog=loadResourceCatalog();catalog.resources[0].title="Changed catalog";
  assert.throws(()=>loadResourceCatalog(catalog),/UNTRUSTED_CATALOG/);
  catalog.resources.push(catalog.resources[0]);assert.throws(()=>parseResourceCatalog(catalog),/INVALID_CATALOG/);
  assert.throws(()=>parseResourceCatalog({...loadResourceCatalog(),apiKey:"not-a-real-key"}),/INVALID_CATALOG/);
});
test("resource matcher uses exact existing rubric mapping, never name guessing or arbitrary ID",async()=>{
  const f=await roadmapFixture();assert.equal(matchLearningResource(f.context,f.scoring.skills[0])?.resourceId,"typescript-generics");
  assert.equal(matchLearningResource(f.context,{...f.scoring.skills[0],skillName:"TypeScriptish"}),undefined);
});
