import assert from "node:assert/strict";
import test from "node:test";
import { resolveTargetRole } from "@/lib/analysis/target-role-resolver";
import { AnalysisError } from "@/lib/analysis/errors";
import { databaseInt8Schema } from "@/types/analysis-input";
import { ROLE_ID,SKILL_ID,createMock } from "./fixtures";
const code=(expected:string)=>(e:unknown)=>e instanceof AnalysisError&&e.code===expected;

test("official slug resolves active role, benchmark and skill without int8 precision loss",async()=>{
  const mock=createMock();const result=await resolveTargetRole("frontend-developer",mock.client);
  assert.equal(result.targetRole.id,ROLE_ID);assert.equal(result.benchmarks[0].skillId,SKILL_ID);
  assert.equal(result.benchmarks[0].requiredLevel,3);
  for(const query of mock.queries)assert.ok(query.columns.includes("id::text"));
  assert.ok(mock.queries.find(q=>q.table==="role_benchmarks")?.columns.includes("skill_id::text"));
});

test("normalized name matches deterministically with Unicode and repeated spaces",async()=>{
  const mock=createMock();mock.tables.target_roles[0].name="Frontend  Developer";
  assert.equal((await resolveTargetRole("  Ｆｒｏｎｔｅｎｄ   Developer  ",mock.client)).targetRole.id,ROLE_ID);
});

test("official slug takes precedence over a conflicting display name",async()=>{
  const mock=createMock();mock.tables.target_roles.push({...mock.tables.target_roles[0],id:"2",slug:"other",name:"frontend-developer"});
  assert.equal((await resolveTargetRole("frontend-developer",mock.client)).targetRole.id,ROLE_ID);
});

test("unknown, ambiguous, inactive, and duplicate-slug roles reject without fallback",async()=>{
  await assert.rejects(resolveTargetRole("unknown",createMock().client),code("ROLE_NOT_FOUND"));
  const ambiguous=createMock();ambiguous.tables.target_roles.push({...ambiguous.tables.target_roles[0],id:"2",slug:"frontend-alternative"});
  await assert.rejects(resolveTargetRole("Frontend Developer",ambiguous.client),code("ROLE_AMBIGUOUS"));
  const inactive=createMock();inactive.tables.target_roles[0].is_active=false;
  await assert.rejects(resolveTargetRole("frontend-developer",inactive.client),code("ROLE_INACTIVE"));
  const duplicate=createMock();duplicate.tables.target_roles.push({...duplicate.tables.target_roles[0],id:"2"});
  await assert.rejects(resolveTargetRole("frontend-developer",duplicate.client),code("ROLE_AMBIGUOUS"));
});

test("missing benchmark or skill rejects explicitly",async()=>{
  await assert.rejects(resolveTargetRole("frontend-developer",createMock({tables:{role_benchmarks:[]}}).client),code("BENCHMARK_NOT_CONFIGURED"));
  await assert.rejects(resolveTargetRole("frontend-developer",createMock({tables:{skills:[]}}).client),code("SKILL_NOT_FOUND"));
});

test("unsafe int8 numbers are rejected; exact decimal strings preserved",async()=>{
  assert.equal(databaseInt8Schema.parse("9223372036854775807"),"9223372036854775807");
  assert.equal(databaseInt8Schema.safeParse("9223372036854775808").success,false);
  assert.equal(databaseInt8Schema.safeParse(Number.MAX_SAFE_INTEGER+1).success,false);
  const mock=createMock();mock.tables.target_roles[0].id=Number.MAX_SAFE_INTEGER+1;
  await assert.rejects(resolveTargetRole("frontend-developer",mock.client),code("DATABASE_CONTRACT_ERROR"));
});

test("catalog and benchmark reads are bounded; duplicates/malformed provenance fail",async()=>{
  const large=createMock();large.tables.target_roles=Array.from({length:201},(_,i)=>({...large.tables.target_roles[0],id:String(i+1)}));
  await assert.rejects(resolveTargetRole("Unknown Role",large.client),code("DATA_LIMIT_EXCEEDED"));
  const duplicate=createMock();duplicate.tables.role_benchmarks.push({...duplicate.tables.role_benchmarks[0],id:"11"});
  await assert.rejects(resolveTargetRole("frontend-developer",duplicate.client),code("DATABASE_CONTRACT_ERROR"));
  const bad=createMock();bad.tables.role_benchmarks[0].source_url="https://user:pass@example.invalid/private";
  await assert.rejects(resolveTargetRole("frontend-developer",bad.client),code("DATABASE_CONTRACT_ERROR"));
});

test("database role query failures stay sanitized",async()=>{
  await assert.rejects(resolveTargetRole("frontend-developer",createMock({errorTable:"target_roles"}).client),code("DATABASE_ERROR"));
});
