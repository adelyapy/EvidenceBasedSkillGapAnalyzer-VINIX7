import assert from "node:assert/strict";
import test from "node:test";
import { createGeminiSkillProvider } from "@/lib/ai/gemini-skill-provider";
import { GeminiError, type GeminiTextOptions } from "@/lib/ai/gemini";

const request={contents:"synthetic data",systemInstruction:"trusted rules",responseJsonSchema:{type:"object"}};
test("adapter uses structured transport settings and returns original provider text",async()=>{
  let captured:GeminiTextOptions|undefined;
  const provider=createGeminiSkillProvider({model:"gemini-test",generate:async(prompt,options)=>{
    assert.equal(prompt,request.contents);captured=options;return {model:"gemini-test",result:'{"skills":[]}'};
  }});
  assert.equal((await provider.generate(request)).text,'{"skills":[]}');
  assert.equal(captured?.systemInstruction,request.systemInstruction);assert.deepEqual(captured?.responseJsonSchema,request.responseJsonSchema);
  assert.equal(captured?.maxOutputTokens,8192);
});
test("503 uses bounded exponential backoff and no dummy fallback",async()=>{
  const delays:number[]=[];let calls=0;
  const provider=createGeminiSkillProvider({model:"gemini-test",maxAttempts:3,sleep:async ms=>{delays.push(ms);},generate:async()=>{
    calls++;if(calls<3)throw new GeminiError("safe temporary error",503);return {model:"gemini-test",result:"{}"};
  }});
  await provider.generate(request);assert.equal(calls,3);assert.deepEqual(delays,[250,500]);
});
test("504 exhausts finite retries and preserves status",async()=>{
  let calls=0;
  const provider=createGeminiSkillProvider({model:"gemini-test",sleep:async()=>{},generate:async()=>{calls++;throw new GeminiError("safe timeout",504);}});
  await assert.rejects(provider.generate(request),e=>e instanceof GeminiError&&e.status===504);assert.equal(calls,2);
});
test("429 and permanent errors are not retried",async()=>{
  for(const status of [429,400,401,403]){
    let calls=0;
    const provider=createGeminiSkillProvider({model:"gemini-test",generate:async()=>{calls++;throw new GeminiError("safe",status);}});
    await assert.rejects(provider.generate(request),e=>e instanceof GeminiError&&e.status===status);assert.equal(calls,1);
  }
});
test("empty and oversized responses are rejected without retries",async()=>{
  for(const result of ["", " ","x".repeat(65537)]){
    let calls=0;
    const provider=createGeminiSkillProvider({model:"gemini-test",generate:async()=>{calls++;return {model:"gemini-test",result};}});
    await assert.rejects(provider.generate(request),e=>e instanceof GeminiError&&e.status===502);assert.equal(calls,1);
  }
});
test("unexpected provider exceptions are sanitized",async()=>{
  const provider=createGeminiSkillProvider({model:"gemini-test",generate:async()=>{throw new Error("PRIVATE_REQUEST_DETAILS");}});
  await assert.rejects(provider.generate(request),e=>e instanceof GeminiError&&!e.message.includes("PRIVATE"));
});
