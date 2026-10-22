import assert from "node:assert/strict";
import test from "node:test";
import { parseGithubRepositoryUrl, readGithubRepository } from "@/lib/ingestion/github-reader";
import { IngestionError } from "@/lib/ingestion/errors";
import { normalizedProjectSchema } from "@/types/ingestion";
import { COMMIT_SHA, githubFixture, fixtureContent } from "./fixtures";

const url = "https://github.com/acme/demo";
const code = (expected: string) => (e: unknown) => e instanceof IngestionError && e.code === expected;

test("accepts canonical public repo URLs with optional .git and trailing slash", () => {
  for (const input of [url, `${url}.git`, `${url}/`, `${url}.git/`]) assert.equal(parseGithubRepositoryUrl(input).reference, url);
});

test("rejects fake host, local/private IP, userinfo, ports and ambiguous URL forms before fetch", async () => {
  for (const input of ["https://github.com.evil.test/a/b", "https://www.github.com/a/b", "https://localhost/a/b", "https://127.0.0.1/a/b", "https://10.0.0.1/a/b", "https://user:pass@github.com/a/b", "http://github.com/a/b", "https://github.com:443/a/b", "https://github.com:8080/a/b", `${url}?token=private`, `${url}#readme`, `${url}/tree/main`, "https://github.com/a/../b", "https://github.com/a/%62", ` ${url}`, `${url}\n`]) {
    const fixture = githubFixture();
    await assert.rejects(readGithubRepository(input, fixture), code("INVALID_GITHUB_URL"));
    assert.equal(fixture.calls.length, 0);
  }
});

test("reads a commit snapshot, bounded raw blobs and official API headers only", async () => {
  const fixture = githubFixture();
  const result = await readGithubRepository(url, fixture);
  assert.ok(normalizedProjectSchema.safeParse(result).success);
  assert.equal(result.revision, COMMIT_SHA);
  assert.equal(result.files[0].content, fixtureContent);
  assert.equal(result.stats.totalContentBytes, Buffer.byteLength(fixtureContent));
  assert.equal(fixture.calls.length, 4);
  for (const call of fixture.calls) {
    assert.equal(new URL(call.url).hostname, "api.github.com");
    assert.equal(call.init?.redirect, "manual");
    assert.equal(new Headers(call.init?.headers).has("authorization"), false);
    assert.ok(new Headers(call.init?.headers).has("x-github-api-version"));
  }
  assert.equal(new Headers(fixture.calls[3].init?.headers).get("accept"), "application/vnd.github.raw+json");
});

test("maps 404, 403, 429, server and redirect errors without upstream body leakage", async () => {
  for (const [status, expected, headers] of [
    [404,"NOT_FOUND",{}], [403,"GITHUB_FORBIDDEN",{}], [429,"RATE_LIMITED",{}],
    [403,"RATE_LIMITED",{"x-ratelimit-remaining":"0"}], [503,"UPSTREAM_ERROR",{}],
    [302,"UPSTREAM_ERROR",{location:"http://127.0.0.1/secret"}],
  ] as const) {
    const fixture = githubFixture({status, headers});
    await assert.rejects(readGithubRepository(url, fixture), code(expected));
    assert.equal(fixture.calls.length, 1);
  }
});

test("rejects private repository metadata and truncated trees", async () => {
  await assert.rejects(readGithubRepository(url, githubFixture({private:true})), code("PRIVATE_REPOSITORY"));
  await assert.rejects(readGithubRepository(url, githubFixture({truncated:true})), code("TRUNCATED_TREE"));
});

test("network failures and timeout are bounded even for a stalled fetch", async () => {
  await assert.rejects(readGithubRepository(url, {fetch:async () => {throw new Error("private detail");}}), code("NETWORK_ERROR"));
  await assert.rejects(readGithubRepository(url, {fetch:async () => new Promise<Response>(() => {}),limits:{networkTimeoutMs:10}}), code("TIMEOUT"));
});

test("timeout includes stalled body consumption, not only response headers", async () => {
  await assert.rejects(readGithubRepository(url, {
    fetch:async () => new Response(new ReadableStream({start() { /* Deliberately never produces a chunk. */ }})),
    limits:{networkTimeoutMs:10},
  }), code("TIMEOUT"));
});

test("skips oversized files, binary content, secrets, dependencies and symlinks explicitly", async () => {
  const fixture = githubFixture({files:[
    {path:"src/large.ts",content:"x",size:65537}, {path:"src/binary.ts",content:Buffer.from([0,1])},
    {path:"src/config.ts",content:'const password = "fixture-private";'},
    {path:"node_modules/a.js",content:"ignored"}, {path:"link.ts",content:"target",mode:"120000"},
  ]});
  const result = await readGithubRepository(url, fixture);
  assert.equal(result.files.length, 0);
  assert.equal(result.stats.skippedFiles, 5);
  assert.equal(result.status, "partial");
  assert.ok(result.warnings.includes("NO_RELEVANT_FILES"));
  assert.equal(fixture.calls.length, 5); // metadata, commit, tree, two candidate blobs
});

test("reports a repo without relevant source rather than pretending it was analyzed", async () => {
  const result = await readGithubRepository(url, githubFixture({files:[{path:"image.png",content:"image"}]}));
  assert.equal(result.files.length, 0);
  assert.ok(result.warnings.includes("NO_RELEVANT_FILES"));
});

test("request, file-count, output-byte and tree-entry limits produce explicit outcomes", async () => {
  const fixture = githubFixture({files:[{path:"a.ts",content:"a"},{path:"b.ts",content:"b"}]});
  const result = await readGithubRepository(url, {...fixture,limits:{maxGithubRequests:4}});
  assert.equal(fixture.calls.length, 4);
  assert.equal(result.files.length, 1);
  assert.equal(result.status, "partial");
  await assert.rejects(readGithubRepository(url,{...githubFixture(),limits:{maxGithubRequests:2}}),code("LIMIT_EXCEEDED"));
  await assert.rejects(readGithubRepository(url,{...githubFixture({files:[{path:"a.ts",content:"a"},{path:"b.ts",content:"b"}]}),limits:{maxTreeEntries:1}}),code("LIMIT_EXCEEDED"));
  const limited = await readGithubRepository(url,{...githubFixture({files:[{path:"a.ts",content:"a"},{path:"b.ts",content:"b"}]}),limits:{maxContentBytes:1}});
  assert.equal(limited.stats.totalContentBytes,1);
});

test("bounds declared and streamed response sizes before parsing JSON", async () => {
  await assert.rejects(readGithubRepository(url,{fetch:async () => new Response("",{headers:{"content-length":"9999999"}})}),code("LIMIT_EXCEEDED"));
  let cancelled = false;
  const fetcher: typeof fetch = async () => new Response(new ReadableStream({
    start(controller) {controller.enqueue(new Uint8Array(70000));},
    cancel() {cancelled=true;},
  }));
  await assert.rejects(readGithubRepository(url,{fetch:fetcher}),code("LIMIT_EXCEEDED"));
  assert.ok(cancelled);
});

test("rejects malformed provider responses instead of trusting their types", async () => {
  await assert.rejects(readGithubRepository(url,{fetch:async () => new Response("not JSON")}),code("INVALID_RESPONSE"));
  await assert.rejects(readGithubRepository(url,{fetch:async () => Response.json({private:false})}),code("INVALID_RESPONSE"));
});

test("rejects unsafe tree paths and blob-size inconsistencies", async () => {
  await assert.rejects(readGithubRepository(url,githubFixture({files:[{path:"../a.ts",content:"x"}]})),code("UNSAFE_PATH"));
  await assert.rejects(readGithubRepository(url,githubFixture({files:[{path:"a.ts",content:"more than declared",size:1}]})),code("INVALID_RESPONSE"));
});

test("prioritizes README and manifest before source while respecting included-file cap", async () => {
  const fixture=githubFixture({files:[{path:"src/main.ts",content:"code"},{path:"package.json",content:"{}"},{path:"README.md",content:"readme"}]});
  const result=await readGithubRepository(url,{...fixture,limits:{maxIncludedFiles:2}});
  assert.deepEqual(result.files.map(f=>f.path),["README.md","package.json"]);
  assert.equal(result.stats.skippedFiles,1);
});
