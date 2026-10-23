import assert from "node:assert/strict";
import test from "node:test";
import { normalizeProject } from "@/lib/ingestion/project-normalizer";
import { resolveLimits } from "@/lib/ingestion/limits";
import { normalizedProjectSchema } from "@/types/ingestion";

const base = {sourceType:"zip" as const, projectName:"Demo project",sourceReference:"demo.zip",discoveredFiles:3};

test("normalizes paths, deduplicates, orders deterministically and counts UTF8 bytes",()=>{
  const files=[{path:"src\\z.ts",content:"// café\n"},{path:"README.md",content:"# Demo\n"},{path:"src/z.ts",content:"// café\n"}];
  const first=normalizeProject({...base,files});
  assert.deepEqual(first,normalizeProject({...base,files:[...files].reverse()}));
  assert.deepEqual(first.files.map(f=>f.path),["README.md","src/z.ts"]);
  assert.deepEqual(first.stats,{discoveredFiles:3,includedFiles:2,skippedFiles:1,totalContentBytes:16});
  assert.ok(normalizedProjectSchema.safeParse(JSON.parse(JSON.stringify(first))).success);
});

test("normalization rechecks content safety, paths and output bounds",()=>{
  const result=normalizeProject({...base,files:[{path:"src/a.ts",content:'const secret = "fixture-private";'},{path:"src/b.ts",content:"ok"}]},{maxIncludedFiles:1});
  assert.deepEqual(result.files.map(f=>f.path),["src/b.ts"]);
  assert.throws(()=>normalizeProject({...base,files:[{path:"../a.ts",content:"x"}]}));
  assert.throws(()=>normalizeProject({...base,discoveredFiles:0,files:[{path:"a.ts",content:"x"}]}));
});

test("schema rejects inconsistent statistics and false byte counts",()=>{
  const valid=normalizeProject({...base,discoveredFiles:1,files:[{path:"a.ts",content:"a"}]});
  assert.equal(normalizedProjectSchema.safeParse({...valid,stats:{...valid.stats,includedFiles:2}}).success,false);
  assert.equal(normalizedProjectSchema.safeParse({...valid,files:[{...valid.files[0],sizeBytes:20}]}).success,false);
});

test("callers may tighten resource limits, never disable or raise hard ceilings",()=>{
  assert.equal(resolveLimits({maxIncludedFiles:2}).maxIncludedFiles,2);
  for(const value of [0,-1,Infinity,41,1.5]) assert.throws(()=>resolveLimits({maxIncludedFiles:value}));
});

test("schema rejects unsafe paths, arbitrary warnings and false complete claims",()=>{
  const valid=normalizeProject({...base,discoveredFiles:1,files:[{path:"a.ts",content:"a"}]});
  assert.equal(normalizedProjectSchema.safeParse({...valid,files:[{...valid.files[0],path:"../a.ts"}]}).success,false);
  assert.equal(normalizedProjectSchema.safeParse({...valid,warnings:["untrusted free text"]}).success,false);
  assert.equal(normalizedProjectSchema.safeParse({...valid,stats:{...valid.stats,discoveredFiles:2,skippedFiles:1},status:"complete"}).success,false);
});
