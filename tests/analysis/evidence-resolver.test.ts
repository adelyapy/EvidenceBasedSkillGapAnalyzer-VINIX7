import assert from "node:assert/strict";
import test from "node:test";
import { resolveEvidence } from "@/lib/analysis/evidence-resolver";
import { evidenceRowSchema } from "@/types/analysis-input";
import { IngestionError } from "@/lib/ingestion/errors";
import { EVIDENCE_ID,createMock,githubProject,mockIngestGithub } from "./fixtures";
const row=()=>evidenceRowSchema.parse(createMock().tables.project_evidences[0]);

test("supported GitHub evidence is traced to its ID and validated canonical URL",async()=>{
  const result=await resolveEvidence(row(),{ingestGithub:mockIngestGithub});
  assert.equal(result.evidenceId,EVIDENCE_ID);assert.equal(result.status,"complete");
  assert.ok("normalizedProject" in result);assert.equal(result.normalizedProject.files.length,1);
});

test("ZIP blocked before download without a trusted size/bucket contract",async()=>{
  const result=await resolveEvidence({...row(),evidence_type:"zip",storage_path:"private/project.zip"});
  assert.equal(result.status,"blocked");
  assert.ok("error" in result);assert.equal(result.error,"STORAGE_READER_NOT_READY");
  assert.equal(JSON.stringify(result).includes("private/project.zip"),false);
});

test("PDF, CV, website, portfolio, deployment, GitLab and folder remain unsupported",async()=>{
  for(const evidence_type of ["pdf","cv","website","portfolio","deployment","gitlab","folder","unrecognized"]){
    const result=await resolveEvidence({...row(),evidence_type});
    assert.equal(result.status,"unsupported");assert.ok("error" in result);assert.equal(result.error,"UNSUPPORTED_SOURCE");
  }
});

test("invalid URLs reject before calling ingestion; raw metadata never appears in output",async()=>{
  for(const url of ["https://github.com.evil.invalid/a/b","http://127.0.0.1/private","https://user:pass@github.com/acme/demo",null]){
    let calls=0;
    const result=await resolveEvidence({...row(),url,title:"PRIVATE_TITLE",description:"PRIVATE_DESCRIPTION"},{ingestGithub:async()=>{calls++;return githubProject();}});
    assert.equal(result.status,"failed");assert.equal(calls,0);
    assert.equal(JSON.stringify(result).includes("PRIVATE"),false);
    assert.equal(result.sourceReference,`evidence:${EVIDENCE_ID}`);
  }
});

test("reader errors and limits become safe error codes, never raw messages",async()=>{
  for(const error of [new Error("PRIVATE_DETAIL"),new IngestionError("LIMIT_EXCEEDED")]){
    const result=await resolveEvidence(row(),{ingestGithub:async()=>{throw error;}});
    assert.equal(result.status,"failed");assert.ok("error" in result);
    assert.equal(result.error,error instanceof IngestionError?"EVIDENCE_LIMIT_EXCEEDED":"EVIDENCE_FETCH_FAILED");
    assert.equal(JSON.stringify(result).includes("PRIVATE"),false);
  }
});

test("revalidates reader output and re-filters standard credentials before handing it onward",async()=>{
  const synthetic=JSON.stringify({auths:{"registry.example.invalid":{auth:Buffer.from("fixture-user:fixture-password").toString("base64")}}});
  const injected=githubProject();injected.files=[{path:".docker/config.json",content:synthetic,sizeBytes:Buffer.byteLength(synthetic),language:"JSON"}];
  injected.stats.totalContentBytes=Buffer.byteLength(synthetic);
  const result=await resolveEvidence(row(),{ingestGithub:async()=>injected});
  assert.equal(result.status,"partial");assert.ok("normalizedProject" in result);assert.equal(result.normalizedProject.files.length,0);
  assert.equal(JSON.stringify(result).includes(synthetic),false);
  const wrong=await resolveEvidence(row(),{ingestGithub:async()=>({...githubProject(),sourceReference:"https://github.com/other/project"})});
  assert.equal(wrong.status,"failed");assert.ok("error" in wrong);assert.equal(wrong.error,"EVIDENCE_OUTPUT_REJECTED");
});

test("exhausted analysis budget prevents network; oversized adapter output cannot bypass cap",async()=>{
  let calls=0;
  const dependency={ingestGithub:async()=>{calls++;return githubProject();}};
  assert.equal((await resolveEvidence(row(),dependency,{bytes:0,files:1})).status,"blocked");
  assert.equal(calls,0);
  assert.equal((await resolveEvidence(row(),dependency,{bytes:1,files:1})).status,"blocked");
});
