import assert from "node:assert/strict";
import test from "node:test";
import { buildAnalysisInput } from "@/lib/analysis/analysis-input-builder";
import { analysisInputSchema } from "@/types/analysis-input";
import { AnalysisError } from "@/lib/analysis/errors";
import { normalizeProject } from "@/lib/ingestion/project-normalizer";
import { ANALYSIS_ID,EVIDENCE_ID,SECOND_EVIDENCE_ID,USER_ID,createMock,cvRow,githubProject,mockIngestGithub } from "./fixtures";
import expectedInput from "./analysis-input.fixture.json";

test("documented synthetic snapshot matches actual builder output and schema",async()=>{
  const result=await buildAnalysisInput(ANALYSIS_ID,{client:createMock().client,ingestGithub:mockIngestGithub});
  assert.deepEqual(result,expectedInput);
  assert.ok(analysisInputSchema.safeParse(expectedInput).success);
});

test("builds schema-valid, serializable server AnalysisInput from authorized mock data",async()=>{
  const mock=createMock({tables:{cv_files:[cvRow()]}});
  const result=await buildAnalysisInput(ANALYSIS_ID,{client:mock.client,ingestGithub:mockIngestGithub});
  assert.equal(result.analysisId,ANALYSIS_ID);assert.equal(result.userId,USER_ID);assert.equal(result.processingStatus,"complete");
  assert.ok(analysisInputSchema.safeParse(JSON.parse(JSON.stringify(result))).success);
  assert.equal(result.cv?.contentStatus,"unsupported");assert.ok(result.warnings.includes("CV_METADATA_ONLY"));
  const serialized=JSON.stringify(result);
  for(const forbidden of ["storage_path","access_token","refresh_token","cookie","apiKey"])assert.equal(serialized.includes(forbidden),false);
});

test("missing evidence produces blocked input, not fictional source or score",async()=>{
  const mock=createMock({tables:{project_evidences:[]}});
  const result=await buildAnalysisInput(ANALYSIS_ID,{client:mock.client});
  assert.equal(result.processingStatus,"blocked");assert.deepEqual(result.evidences,[]);assert.deepEqual(result.warnings,["NO_PROJECT_EVIDENCE"]);
  assert.equal("score" in result,false);
});

test("one source failure preserves another successful project with per-evidence identity",async()=>{
  const mock=createMock();mock.tables.project_evidences.push({...mock.tables.project_evidences[0],id:SECOND_EVIDENCE_ID,url:"https://github.com/acme/other"});
  const result=await buildAnalysisInput(ANALYSIS_ID,{client:mock.client,ingestGithub:async url=>{
    if(url.endsWith("/other"))throw new Error("PRIVATE_UPSTREAM_DETAIL");return githubProject(url);
  }});
  assert.equal(result.processingStatus,"partial");
  assert.equal(result.evidences.find(e=>e.evidenceId===EVIDENCE_ID)?.status,"complete");
  assert.equal(result.evidences.find(e=>e.evidenceId===SECOND_EVIDENCE_ID)?.status,"failed");
  assert.equal(JSON.stringify(result).includes("PRIVATE"),false);
});

test("ZIP only is blocked, PDF only unsupported, GitHub error only failed",async()=>{
  for(const [type,status] of [["zip","blocked"],["pdf","unsupported"],["github","failed"]] as const){
    const mock=createMock();mock.tables.project_evidences[0].evidence_type=type;
    const result=await buildAnalysisInput(ANALYSIS_ID,{client:mock.client,ingestGithub:async()=>{throw new Error("fixture");}});
    assert.equal(result.processingStatus,status);
  }
});

test("unauthorized/invalid ID and role failures never start ingestion",async()=>{
  let calls=0;
  for(const [mock,id,expected] of [[createMock({auth:"missing"}),ANALYSIS_ID,"UNAUTHENTICATED"],[createMock(),"bad-id","INVALID_ANALYSIS_ID"],[createMock({tables:{role_benchmarks:[]}}),ANALYSIS_ID,"BENCHMARK_NOT_CONFIGURED"]] as const){
    await assert.rejects(buildAnalysisInput(id,{client:mock.client,ingestGithub:async()=>{calls++;return githubProject();}}),e=>e instanceof AnalysisError&&e.code===expected);
  }
  assert.equal(calls,0);
});

test("schema rejects extra secret fields, forged completion and mismatched evidence sources",async()=>{
  const result=await buildAnalysisInput(ANALYSIS_ID,{client:createMock().client,ingestGithub:mockIngestGithub});
  assert.equal(analysisInputSchema.safeParse({...result,access_token:"synthetic-not-real"}).success,false);
  assert.equal(analysisInputSchema.safeParse({...result,evidences:[],processingStatus:"complete"}).success,false);
  const evidence=result.evidences[0];
  assert.equal(analysisInputSchema.safeParse({...result,evidences:[{...evidence,sourceReference:"https://example.invalid"}]}).success,false);
});

test("multi-evidence file/byte budgets stop before starting another reader",async()=>{
  for(const mode of ["files","bytes"] as const){
    const mock=createMock();
    mock.tables.project_evidences=[EVIDENCE_ID,SECOND_EVIDENCE_ID,"77777777-7777-4777-8777-777777777777"].map(id=>({...mock.tables.project_evidences[0],id}));
    let calls=0;
    const result=await buildAnalysisInput(ANALYSIS_ID,{client:mock.client,ingestGithub:async reference=>{
      calls++;
      const count=mode==="files"?40:16;
      const content=mode==="files"?"x":"x".repeat(65536);
      return normalizeProject({sourceType:"github",projectName:"demo",sourceReference:reference,revision:"a".repeat(40),discoveredFiles:count,
        files:Array.from({length:count},(_,i)=>({path:`src/file${i}.ts`,content}))});
    }});
    assert.equal(calls,2);
    assert.equal(result.evidences[2].status,"blocked");
    assert.equal(result.processingStatus,"partial");
    assert.ok(analysisInputSchema.safeParse(result).success);
  }
});
