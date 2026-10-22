import assert from "node:assert/strict";
import test from "node:test";
import { loadOwnedAnalysis } from "@/lib/analysis/analysis-repository";
import { AnalysisError } from "@/lib/analysis/errors";
import { ANALYSIS_ID,OTHER_USER_ID,USER_ID,createMock,cvRow } from "./fixtures";

const code=(expected:string)=>(e:unknown)=>e instanceof AnalysisError&&e.code===expected;

test("verified user owns every private query; projections and row limits are explicit",async()=>{
  const mock=createMock({tables:{cv_files:[cvRow()]}});
  const result=await loadOwnedAnalysis(ANALYSIS_ID,mock.client);
  assert.equal(result.userId,USER_ID);
  assert.equal(result.cv?.original_filename,"cv.pdf");
  assert.equal(mock.authCalls,1);
  for(const query of mock.queries){
    assert.ok(query.filters.some(([key,value])=>key==="user_id"&&value===USER_ID));
    assert.equal(query.columns.includes("*"),false);
    assert.ok(query.single||query.limit!==undefined);
  }
  assert.deepEqual(mock.queries[0].filters,[["id",ANALYSIS_ID],["user_id",USER_ID]]);
});

test("missing, invalid and throwing authentication all reject without database reads",async()=>{
  for(const auth of ["missing","invalid","throw"] as const){
    const mock=createMock({auth});
    await assert.rejects(loadOwnedAnalysis(ANALYSIS_ID,mock.client),code("UNAUTHENTICATED"));
    assert.equal(mock.queries.length,0);
  }
});

test("invalid analysis UUID rejects before auth/query",async()=>{
  const mock=createMock();
  for(const id of ["", "arbitrary-id","../analysis","123 OR 1=1"])await assert.rejects(loadOwnedAnalysis(id,mock.client),code("INVALID_ANALYSIS_ID"));
  assert.equal(mock.authCalls,0);
  assert.equal(mock.queries.length,0);
});

test("missing and other-user analyses are indistinguishable; never read child rows",async()=>{
  const missing=createMock({tables:{analyses:[]}});
  await assert.rejects(loadOwnedAnalysis(ANALYSIS_ID,missing.client),code("ANALYSIS_NOT_FOUND"));
  const other=createMock();other.tables.analyses[0].user_id=OTHER_USER_ID;
  await assert.rejects(loadOwnedAnalysis(ANALYSIS_ID,other.client),code("ANALYSIS_NOT_FOUND"));
  const brokenFilter=createMock({ignoreFilters:true});brokenFilter.tables.analyses[0].user_id=OTHER_USER_ID;
  await assert.rejects(loadOwnedAnalysis(ANALYSIS_ID,brokenFilter.client),code("ANALYSIS_NOT_FOUND"));
  assert.equal(other.queries.length,1);
  assert.equal(brokenFilter.queries.length,1);
});

test("empty/multiple evidences and absent CV preserve metadata without inventing records",async()=>{
  const empty=createMock({tables:{project_evidences:[]}});
  const result=await loadOwnedAnalysis(ANALYSIS_ID,empty.client);
  assert.equal(result.evidences.length,0);assert.equal(result.cv,null);
  const many=createMock();many.tables.project_evidences.push({...many.tables.project_evidences[0],id:"66666666-6666-4666-8666-666666666666"});
  assert.equal((await loadOwnedAnalysis(ANALYSIS_ID,many.client)).evidences.length,2);
});

test("database error/exception and invalid fields become safe typed errors",async()=>{
  for(const mock of [createMock({errorTable:"analyses"}),createMock({throwTable:"project_evidences"})]){
    await assert.rejects(loadOwnedAnalysis(ANALYSIS_ID,mock.client),e=>{
      assert.ok(e instanceof AnalysisError);assert.equal(e.code,"DATABASE_ERROR");assert.ok(!e.message.includes("PRIVATE"));return true;
    });
  }
  const bad=createMock();bad.tables.analyses[0].target_role=42;
  await assert.rejects(loadOwnedAnalysis(ANALYSIS_ID,bad.client),code("DATABASE_CONTRACT_ERROR"));
});

test("defense in depth rejects cross-user child rows even if an adapter ignores filters",async()=>{
  const mock=createMock({ignoreFilters:true});mock.tables.project_evidences[0].user_id=OTHER_USER_ID;
  await assert.rejects(loadOwnedAnalysis(ANALYSIS_ID,mock.client),code("DATABASE_CONTRACT_ERROR"));
});

test("too many evidence/CV rows fail rather than silently omitting data",async()=>{
  const mock=createMock();mock.tables.project_evidences=Array.from({length:9},()=>({...mock.tables.project_evidences[0]}));
  await assert.rejects(loadOwnedAnalysis(ANALYSIS_ID,mock.client),code("DATA_LIMIT_EXCEEDED"));
  const cvs=createMock({tables:{cv_files:[cvRow(),{...cvRow(),id:"77777777-7777-4777-8777-777777777777"}]}});
  await assert.rejects(loadOwnedAnalysis(ANALYSIS_ID,cvs.client),code("DATA_LIMIT_EXCEEDED"));
});
