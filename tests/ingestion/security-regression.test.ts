import assert from "node:assert/strict";
import test from "node:test";
import { ingestGithubRepository, ingestZipProject } from "@/lib/ingestion/ingestion-service";
import { containsPossibleSecret, isRelevantPath, normalizeProjectPath } from "@/lib/ingestion/file-filter";
import { projectFileSchema } from "@/types/ingestion";
import { githubFixture, makeZip } from "./fixtures";

const syntheticAuth = JSON.stringify({ auths: { "registry.example.invalid": { auth: Buffer.from("fixture-user:fixture-password").toString("base64") } } });
const sensitiveFiles = [
  ".docker/config.json", "nested/.docker/config.json", ".npmrc", ".pypirc", ".netrc", ".aws/credentials",
  ".git-credentials", "private.pem", ".env.local", ".config/gcloud/application_default_credentials.json", "credentials/settings.json",
];

test("P1: known credential paths never enter ZIP or GitHub output", async () => {
  const files = sensitiveFiles.map(path => ({ path, content: syntheticAuth }));
  files.push({ path: "src/config.json", content: '{"theme":"blue"}' });
  const fixture = githubFixture({ files });
  const results = [await ingestGithubRepository("https://github.com/acme/demo", fixture), await ingestZipProject(makeZip(files), "synthetic.zip")];
  for (const result of results) {
    assert.deepEqual(result.files.map(file => file.path), ["src/config.json"]);
    assert.equal(JSON.stringify(result).includes(syntheticAuth), false);
    assert.equal(JSON.stringify(result).includes("fixture-password"), false);
  }
  assert.equal(fixture.calls.length, 4); // Credential blobs are never downloaded.
});

test("P1: copied registry auth and auth tokens are detected by content", async () => {
  assert.ok(containsPossibleSecret(syntheticAuth));
  assert.ok(containsPossibleSecret('_authToken=fixture-not-real'));
  const result = await ingestZipProject(makeZip([{path:"src/config.json",content:syntheticAuth}]),"synthetic.zip");
  assert.equal(result.files.length,0);
  assert.ok(result.warnings.every(warning => !warning.includes("fixture")));
});

test("P2: schema and normalizer share safe canonical path policy", () => {
  for (const path of ["CON.ts","../secret.env","/app.ts","C:\\app.ts","a?.ts","x\u202e.ts","src/main.ts "]) {
    assert.throws(() => normalizeProjectPath(path));
    assert.equal(projectFileSchema.safeParse({path,content:"x",sizeBytes:1}).success,false);
  }
  for (const input of ["src\\main.ts","./src/main.ts","src//main.ts","src/./main.ts"]) {
    const normalized = normalizeProjectPath(input);
    assert.equal(normalized,"src/main.ts");
    assert.equal(projectFileSchema.safeParse({path:input,content:"x",sizeBytes:1}).success,false);
    assert.ok(projectFileSchema.safeParse({path:normalized,content:"x",sizeBytes:1}).success);
  }
});

test("P3: common lockfiles excluded, manifests retained on both readers", async () => {
  const paths=["npm-shrinkwrap.json","packages.lock.json","pnpm-lock.yml","deno.lock","Pipfile.lock"];
  for (const path of paths) assert.equal(isRelevantPath(path),false);
  const files=[...paths.map(path=>({path,content:"{}"})),{path:"package.json",content:"{}"}];
  for (const result of [await ingestGithubRepository("https://github.com/acme/demo",githubFixture({files})),await ingestZipProject(makeZip(files),"locks.zip")]) {
    assert.deepEqual(result.files.map(file=>file.path),["package.json"]);
  }
});
