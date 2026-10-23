import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { z } from "zod";

function mockedTransport(status?:number){
  const calls:Record<string,unknown>[]=[];
  class ApiError extends Error{constructor(public status:number){super("PRIVATE_SDK_DETAILS");}}
  class GoogleGenAI{
    models={generateContent:async(request:Record<string,unknown>)=>{calls.push(request);if(status)throw new ApiError(status);return {text:'{"skills":[]}'};}};
  }
  const exports:Record<string,unknown>={};
  const source=ts.transpileModule(readFileSync("src/lib/ai/gemini.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(source,{exports,process:{env:{GEMINI_API_KEY:"synthetic-not-real",GEMINI_MODEL:"gemini-test"}},require(name:string){
    if(name==="server-only")return {};if(name==="zod")return {z};if(name==="@google/genai")return {ApiError,GoogleGenAI};throw new Error("Unexpected dependency");
  }});
  return {calls,generate:exports.generateGeminiText as typeof import("@/lib/ai/gemini").generateGeminiText};
}
test("SDK receives JSON MIME/schema and trusted system instruction via existing gemini module",async()=>{
  const transport=mockedTransport();const schema={type:"object"};
  await transport.generate("data",{systemInstruction:"trusted",responseJsonSchema:schema});
  const config=transport.calls[0].config as Record<string,unknown>;
  assert.equal(config.responseMimeType,"application/json");assert.equal(config.systemInstruction,"trusted");assert.deepEqual(config.responseJsonSchema,schema);
});
test("structured path preserves 503/504/429 without SDK raw messages",async()=>{
  for(const status of [503,504,429]){
    const transport=mockedTransport(status);
    await assert.rejects(transport.generate("data",{responseJsonSchema:{type:"object"}}),(error:unknown)=>{
      const safe=error as {status:number;message:string};return safe.status===status&&!safe.message.includes("PRIVATE");
    });
  }
});
