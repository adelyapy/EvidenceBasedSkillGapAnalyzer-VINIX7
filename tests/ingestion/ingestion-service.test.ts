import assert from "node:assert/strict";
import test from "node:test";
import { ingestGithubRepository, ingestProject, ingestZipProject } from "@/lib/ingestion/ingestion-service";
import { IngestionError } from "@/lib/ingestion/errors";
import { normalizedProjectSchema, type IngestionInput } from "@/types/ingestion";
import { fixtureContent, githubFixture, makeZip } from "./fixtures";
import expectedZipProject from "./normalized-project.fixture.json";

test("GitHub and ZIP integration produce the same file/stats schema",async()=>{
  const github=await ingestGithubRepository("https://github.com/acme/demo",githubFixture());
  const zip=await ingestZipProject(makeZip([{path:"src/main.ts",content:fixtureContent}]),"demo.zip");
  for(const result of [github,zip]) assert.ok(normalizedProjectSchema.safeParse(result).success);
  assert.deepEqual(zip,expectedZipProject);
  assert.deepEqual(github.files,zip.files);
  assert.deepEqual(github.stats,zip.stats);
  assert.deepEqual(github.warnings,zip.warnings);
});

test("source dispatch supports GitHub/ZIP and rejects future adapters explicitly",async()=>{
  assert.equal((await ingestProject({sourceType:"github",url:"https://github.com/acme/demo"},githubFixture())).sourceType,"github");
  assert.equal((await ingestProject({sourceType:"zip",buffer:makeZip([]),filename:"demo.zip"})).sourceType,"zip");
  for(const sourceType of ["folder","gitlab","website","portfolio","deployment","pdf","cv"] as const) {
    await assert.rejects(ingestProject({sourceType,reference:"unused"}),e=>e instanceof IngestionError && e.code==="UNSUPPORTED_SOURCE");
  }
  await assert.rejects(ingestProject(null as unknown as IngestionInput),e=>e instanceof IngestionError && e.code==="INVALID_INPUT");
});

test("project code and package scripts are data, never executed; no environment needed",async()=>{
  const marker="__BUKTIVA_INGESTION_EXECUTED__";
  const content=`globalThis.${marker} = true; throw new Error('do not execute');`;
  const before=Reflect.get(globalThis,marker);
  const zip=await ingestZipProject(makeZip([
    {path:"src/main.ts",content},
    {path:"package.json",content:JSON.stringify({scripts:{postinstall:"exit 91"}})},
  ]),"demo.zip");
  assert.equal(zip.files.length,2);
  const github=await ingestGithubRepository("https://github.com/acme/demo",githubFixture({files:[{path:"src/main.ts",content}]}));
  assert.equal(github.files[0].content,content);
  assert.equal(Reflect.get(globalThis,marker),before);
});
