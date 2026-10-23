// Deterministic tests: no network, credentials or API quota used.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const prompt = "Kamu adalah asisten AI untuk aplikasi BUKTIVA, sebuah Evidence-Based Skill Gap Analyzer. Sebutkan tiga keterampilan penting untuk Frontend Developer dalam bahasa Indonesia secara singkat.";

function loadModule(file, environment, dependencies) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    process: { env: environment },
    Response,
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      if (name === "zod") return require(name);
      throw new Error(`Unexpected dependency: ${name}`);
    },
  }, { filename: file });
  return exports;
}

function transport({ env = {}, response = { text: "Respons asli uji" }, failure } = {}) {
  const calls = [];
  class ApiError extends Error {
    constructor(status) { super("PRIVATE SDK DETAIL"); this.status = status; }
  }
  class GoogleGenAI {
    constructor(options) {
      calls.push({ options });
      this.models = { generateContent: async (request) => {
        calls.push({ request });
        if (failure) throw new ApiError(failure);
        return response;
      } };
    }
  }
  const transportModule = loadModule("src/lib/ai/gemini.ts", env, {
    "server-only": {}, "@google/genai": { ApiError, GoogleGenAI },
  });
  return { ...transportModule, calls };
}

test("import without secrets succeeds; call without key fails before SDK construction", async () => {
  const transportModule = transport();
  assert.equal(transportModule.calls.length, 0);
  await assert.rejects(transportModule.generateGeminiText("hello"), (e) => e.status === 500);
  assert.equal(transportModule.calls.length, 0);
});

test("fallback, explicit model, original text, timeout and no automatic retries", async () => {
  for (const model of [undefined, "", "  ", "configured-model"]) {
    const transportModule = transport({ env: { GEMINI_API_KEY: "test-only", GEMINI_MODEL: model } });
    const result = await transportModule.generateGeminiText("fixed prompt");
    assert.equal(result.model, model?.trim() || "gemini-3.8-flash");
    assert.equal(result.result, "Respons asli uji");
    assert.equal(transportModule.calls[1].request.contents, "fixed prompt");
    assert.equal(transportModule.calls[0].options.httpOptions.timeout, 30_000);
    assert.equal(transportModule.calls[0].options.httpOptions.retryOptions.attempts, 1);
  }
});

test("quota, timeout and upstream errors become safe messages", async () => {
  for (const [failure, expected] of [[429, 429], [504, 504], [408, 504], [403, 502], [404, 502], [500, 502]]) {
    const transportModule = transport({ env: { GEMINI_API_KEY: "test-only" }, failure });
    await assert.rejects(transportModule.generateGeminiText("hello"), (e) => {
      assert.equal(e.status, expected);
      assert.ok(!e.message.includes("PRIVATE"));
      assert.ok(!e.message.includes("test-only"));
      return true;
    });
  }
});

test("empty responses fail; no dummy result is returned", async () => {
  const transportModule = transport({ env: { GEMINI_API_KEY: "test-only" }, response: { text: " " } });
  await assert.rejects(transportModule.generateGeminiText("hello"), (e) => e.status === 502);
});

test("development POST uses fixed prompt and returns real transport text", async () => {
  const transportModule = transport({ env: { GEMINI_API_KEY: "test-only" } });
  const route = loadModule("src/app/api/ai/test/route.ts", { NODE_ENV: "development" }, {
    "@/lib/ai/gemini": transportModule,
  });
  const response = await route.POST(new Request("http://localhost/api/ai/test", {
    method: "POST", body: JSON.stringify({ prompt: "UNTRUSTED PROMPT" }),
  }));
  assert.equal(route.runtime, undefined); // Default Node.js; cacheComponents forbids an explicit export.
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(transportModule.calls[1].request.contents, prompt);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.result, "Respons asli uji");
});

test("production and other environments return 404 without calling SDK", async () => {
  for (const environment of ["production", "test", undefined]) {
    const transportModule = transport({ env: { GEMINI_API_KEY: "test-only" } });
    const route = loadModule("src/app/api/ai/test/route.ts", { NODE_ENV: environment }, {
      "@/lib/ai/gemini": transportModule,
    });
    assert.equal((await route.POST()).status, 404);
    assert.equal(transportModule.calls.length, 0);
    assert.equal(route.GET, undefined);
  }
});

test("route JSON sanitizes both known and unexpected failures", async () => {
  const { GeminiError } = transport();
  for (const error of [new GeminiError("Pesan aman", 429), new Error("PRIVATE SDK DETAIL")]) {
    const route = loadModule("src/app/api/ai/test/route.ts", { NODE_ENV: "development" }, {
      "@/lib/ai/gemini": { GeminiError, generateGeminiText: async () => { throw error; } },
    });
    const response = await route.POST();
    const body = await response.json();
    assert.equal(response.status, error instanceof GeminiError ? 429 : 500);
    assert.equal(body.success, false);
    assert.ok(!JSON.stringify(body).includes("PRIVATE"));
    assert.equal(body.stack, undefined);
  }
});
