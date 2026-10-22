import { analysisInputSchema, type AnalysisInput } from "@/types/analysis-input";
import type { SkillProvider, SkillProviderRequest } from "@/lib/ai/gemini-skill-provider";
import type { EvidenceIndexEntry } from "@/types/skill-extraction";
import analysisFixture from "../analysis/analysis-input.fixture.json";

export const IMPLEMENTATION="export function identity<T>(value: T): T { return value; }\n";
export function aiInput():AnalysisInput {
  const input=analysisInputSchema.parse(structuredClone(analysisFixture));
  return withFiles(input,[{path:"src/identity.ts",content:IMPLEMENTATION}]);
}
export function withFiles(input:AnalysisInput,files:{path:string;content:string}[],partial=false):AnalysisInput {
  const evidence=input.evidences[0];
  if(!("normalizedProject" in evidence))throw new Error("Expected normalized fixture");
  evidence.normalizedProject.files=files.map(file=>({...file,sizeBytes:Buffer.byteLength(file.content),language:"TypeScript"}));
  evidence.normalizedProject.stats={discoveredFiles:files.length+(partial?1:0),includedFiles:files.length,skippedFiles:partial?1:0,totalContentBytes:files.reduce((n,f)=>n+Buffer.byteLength(f.content),0)};
  evidence.normalizedProject.status=partial?"partial":"complete";
  if(!files.length)evidence.normalizedProject.status="partial";
  evidence.status=evidence.normalizedProject.status;
  input.processingStatus=evidence.status;
  return input;
}
export function responseFor(request:SkillProviderRequest){
  const payload=JSON.parse(request.contents) as {officialSkills:{skillId:string}[];evidenceIndex:EvidenceIndexEntry[]};
  const file=payload.evidenceIndex[0];
  return {skills:payload.officialSkills.map(skill=>({skillId:skill.skillId,
    evidenceStatus:file?(file.kind==="source"||file.kind==="test"?"implementation_evidence":"observed_technology"):"insufficient_evidence",
    evidenceRefs:file?[{evidenceId:file.evidenceId,fileRef:file.fileRef,filePath:file.filePath,quote:file.content.slice(0,200)}]:[],
    reason:file?"Kutipan menunjukkan bukti pada file yang tersedia.":"Bukti tidak cukup.",
  }))};
}
/** TEST ONLY. Never used as a production/provider fallback. */
export function mockProvider(change?:(response:ReturnType<typeof responseFor>)=>unknown){
  const requests:SkillProviderRequest[]=[];
  const provider:SkillProvider={model:"mock-fixture",async generate(request){requests.push(request);const response=responseFor(request);return {model:"mock-fixture",text:JSON.stringify(change?change(response):response)};}};
  return {provider,requests};
}
