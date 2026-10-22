import "server-only";
import { GeminiError, generateGeminiText } from "./gemini";
import { MAX_MODEL_RESPONSE_BYTES } from "./skill-output-validator";
import { containsPossibleSecret } from "@/lib/ingestion/file-filter";

export type SkillProviderRequest={systemInstruction:string;contents:string;responseJsonSchema:unknown};
export interface SkillProvider {
  readonly model:string;
  generate(request:SkillProviderRequest):Promise<{model:string;text:string}>;
}

export function createGeminiSkillProvider(options:{
  generate?:typeof generateGeminiText;sleep?:(ms:number)=>Promise<void>;
  model?:string;maxAttempts?:1|2|3;
}={}):SkillProvider {
  const configured=options.model?.trim()||process.env.GEMINI_MODEL?.trim()||"gemini-3.8-flash";
  const model=/^[a-zA-Z0-9._/-]{1,100}$/.test(configured)&&!containsPossibleSecret(configured)?configured:"invalid-model-configuration";
  const attempts=options.maxAttempts??2;
  return {
    model,
    async generate(request){
      if(model==="invalid-model-configuration"||![1,2,3].includes(attempts))throw new GeminiError("Konfigurasi provider tidak valid.",500);
      for(let attempt=1;attempt<=attempts;attempt++){
        try{
          const response=await (options.generate??generateGeminiText)(request.contents,{
            model,systemInstruction:request.systemInstruction,responseJsonSchema:request.responseJsonSchema,maxOutputTokens:8192,
          });
          if(!response.result.trim()||Buffer.byteLength(response.result)>MAX_MODEL_RESPONSE_BYTES)throw new GeminiError("Respons provider kosong atau melampaui batas.",502);
          if(!/^[a-zA-Z0-9._/-]{1,100}$/.test(response.model))throw new GeminiError("Identitas model tidak valid.",502);
          return {model:response.model,text:response.result};
        }catch(error){
          const safe=error instanceof GeminiError?error:new GeminiError("Provider gagal.",502);
          if(![503,504].includes(safe.status)||attempt===attempts)throw safe;
          const delay=250*2**(attempt-1);
          await (options.sleep??(ms=>new Promise(resolve=>setTimeout(resolve,ms))))(delay);
        }
      }
      throw new GeminiError("Provider gagal.",502);
    },
  };
}
