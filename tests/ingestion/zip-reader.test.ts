import assert from "node:assert/strict";
import test from "node:test";
import { readZipProject } from "@/lib/ingestion/zip-reader";
import { IngestionError } from "@/lib/ingestion/errors";
import { normalizedProjectSchema } from "@/types/ingestion";
import { fixtureContent, makeZip } from "./fixtures";

const code = (expected: string) => (e: unknown) => e instanceof IngestionError && e.code === expected;

test("reads valid stored and compressed ZIP entries without disk extraction", async () => {
  const result = await readZipProject(makeZip([{path:"src/main.ts",content:fixtureContent,deflate:true},{path:"README.md",content:"# Demo\n"}]),"demo.zip");
  assert.ok(normalizedProjectSchema.safeParse(result).success);
  assert.deepEqual(result.files.map(f=>f.path),["README.md","src/main.ts"]);
  assert.equal(result.stats.totalContentBytes,33);
  assert.equal(result.status,"complete");
});

test("rejects wrong filename, magic bytes, corrupt directory and bad CRC", async () => {
  await assert.rejects(readZipProject(makeZip([]),"demo.pdf"),code("INVALID_INPUT"));
  await assert.rejects(readZipProject(Buffer.from("not a zip"),"demo.zip"),code("INVALID_ZIP"));
  await assert.rejects(readZipProject(Buffer.from([0x50,0x4b,3,4]),"demo.zip"),code("INVALID_ZIP"));
  await assert.rejects(readZipProject(makeZip([{path:"a.ts",content:"hello",wrongCrc:true}]),"demo.zip"),code("INVALID_ZIP"));
});

test("filters sensitive names, node_modules, binary bytes and secrets in normal source", async () => {
  const result = await readZipProject(makeZip([
    {path:".env.local",content:"PRIVATE"}, {path:"node_modules/a/index.js",content:"ignored"},
    {path:"credentials.json",content:"{}"}, {path:"src/raw.ts",content:Buffer.from([0,1,2])},
    {path:"src/config.ts",content:'const apiKey = "fixture-not-a-key";'},
    {path:"src/main.ts",content:fixtureContent},
  ]),"demo.zip");
  assert.deepEqual(result.files.map(f=>f.path),["src/main.ts"]);
  assert.equal(result.stats.discoveredFiles,6);
  assert.equal(result.stats.skippedFiles,5);
  assert.equal(JSON.stringify(result).includes("fixture-not-a-key"),false);
});

test("rejects traversal, absolute and Windows unsafe paths even in ignored directories", async () => {
  for (const path of ["../a.ts","node_modules/../../a.ts","/a.ts","C:\\a.ts","\\\\server\\a.ts","src/a.ts:extra"]) {
    await assert.rejects(readZipProject(makeZip([{path,content:"x"}]),"demo.zip"), e=>e instanceof IngestionError);
  }
});

test("normalizes Windows separators", async () => {
  const result=await readZipProject(makeZip([{path:"src\\main.ts",content:"hello"}]),"demo.zip");
  assert.equal(result.files[0].path,"src/main.ts");
});

test("rejects symlinks, encrypted entries, named and disguised nested archives", async () => {
  await assert.rejects(readZipProject(makeZip([{path:"link.ts",content:"target",mode:0o120777}]),"demo.zip"),code("UNSUPPORTED_ENTRY"));
  await assert.rejects(readZipProject(makeZip([{path:"a.ts",content:"x",encrypted:true}]),"demo.zip"),code("UNSUPPORTED_ENTRY"));
  await assert.rejects(readZipProject(makeZip([{path:"nested.zip",content:makeZip([])}]),"demo.zip"),code("NESTED_ARCHIVE"));
  await assert.rejects(readZipProject(makeZip([{path:"disguised.ts",content:makeZip([])}]),"demo.zip"),code("NESTED_ARCHIVE"));
});

test("enforces compressed size, central entry count, individual and total sizes", async () => {
  await assert.rejects(readZipProject(makeZip([]),"demo.zip",{limits:{maxZipBytes:10}}),code("LIMIT_EXCEEDED"));
  await assert.rejects(readZipProject(makeZip([{path:"a.ts"},{path:"b.ts"}]),"demo.zip",{limits:{maxZipEntries:1}}),code("LIMIT_EXCEEDED"));
  await assert.rejects(readZipProject(makeZip([{path:"a.ts",content:"12345"}]),"demo.zip",{limits:{maxEntryBytes:4}}),code("LIMIT_EXCEEDED"));
  await assert.rejects(readZipProject(makeZip([{path:"a.ts",content:"123"},{path:"b.ts",content:"456"}]),"demo.zip",{limits:{maxUncompressedBytes:5}}),code("LIMIT_EXCEEDED"));
});

test("rejects forged uncompressed size while consuming compressed data", async () => {
  const bomb=makeZip([{path:"a.ts",content:"x".repeat(100000),declaredSize:1,deflate:true}]);
  await assert.rejects(readZipProject(bomb,"demo.zip"),e=>e instanceof IngestionError && ["INVALID_ZIP","LIMIT_EXCEEDED"].includes(e.code));
});

test("file and output limits skip safe excess data explicitly", async () => {
  const buffer=makeZip([{path:"a.ts",content:"abc"},{path:"b.ts",content:"def"}]);
  for (const limits of [{maxFileBytes:2},{maxIncludedFiles:1},{maxContentBytes:3}]) {
    const result=await readZipProject(buffer,"demo.zip",{limits});
    assert.equal(result.status,"partial");
    assert.ok(result.stats.skippedFiles>0);
  }
});

test("empty directories and ZIP without relevant code yield explicit empty output", async () => {
  for (const entries of [[],[{path:"empty/",mode:0o040755}],[{path:"photo.png",content:"fake image"}]]) {
    const result=await readZipProject(makeZip(entries),"demo.zip");
    assert.equal(result.files.length,0);
    assert.ok(result.warnings.includes("NO_RELEVANT_FILES"));
  }
});

test("handles duplicate normalized paths deterministically without duplicate output", async () => {
  const result=await readZipProject(makeZip([{path:"src/a.ts",content:"first"},{path:"src\\a.ts",content:"second"}]),"demo.zip");
  assert.equal(result.files.length,1);
  assert.equal(result.files[0].content,"first");
  assert.equal(result.stats.skippedFiles,1);
  assert.ok(result.warnings.includes("DUPLICATE_PATH_SKIPPED"));
});

test("default entry and compressed upload ceilings reject immediately", async () => {
  await assert.rejects(readZipProject(makeZip(Array.from({length:201},(_,i)=>({path:`${i}.ts`})) ),"demo.zip"),code("LIMIT_EXCEEDED"));
  await assert.rejects(readZipProject(Buffer.alloc(10*1024*1024+1),"demo.zip"),code("LIMIT_EXCEEDED"));
});
