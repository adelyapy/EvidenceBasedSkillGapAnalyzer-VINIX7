import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeProject } from "@/lib/ingestion/project-normalizer";
import type { ingestGithubRepository } from "@/lib/ingestion/ingestion-service";

export const USER_ID="11111111-1111-4111-8111-111111111111";
export const OTHER_USER_ID="22222222-2222-4222-8222-222222222222";
export const ANALYSIS_ID="33333333-3333-4333-8333-333333333333";
export const EVIDENCE_ID="44444444-4444-4444-8444-444444444444";
export const CV_ID="55555555-5555-4555-8555-555555555555";
export const SECOND_EVIDENCE_ID="66666666-6666-4666-8666-666666666666";
export const ROLE_ID="9007199254740993";
export const SKILL_ID="9007199254740995";
export type Tables = Record<string,Record<string,unknown>[]>;
type Result = {data:unknown;error:unknown};
type QueryLog = {table:string;columns:string;filters:[string,unknown][];limit?:number;single:boolean};

export function createMock(options: {
  tables?:Partial<Tables>; auth?:"valid"|"missing"|"invalid"|"throw";
  errorTable?:string;throwTable?:string;ignoreFilters?:boolean;
} = {}) {
  const tables: Tables = {
    analyses:[{id:ANALYSIS_ID,user_id:USER_ID,status:"draft",target_role:"frontend-developer",created_at:"2026-10-22T00:00:00Z",updated_at:"2026-10-22T00:00:00Z"}],
    project_evidences:[{id:EVIDENCE_ID,analysis_id:ANALYSIS_ID,user_id:USER_ID,evidence_type:"github",title:"Demo",url:"https://github.com/acme/demo",storage_path:null,description:null}],
    cv_files:[],
    target_roles:[{id:ROLE_ID,name:"Frontend Developer",slug:"frontend-developer",description:"Frontend engineering",is_active:true}],
    role_benchmarks:[{id:"10",target_role_id:ROLE_ID,skill_id:SKILL_ID,required_level:3,priority:"high",source_name:"Synthetic benchmark",source_url:"https://example.invalid/benchmark"}],
    skills:[{id:SKILL_ID,name:"TypeScript",category:"Engineering",description:"Typed JavaScript"}],
    ...structuredClone(options.tables ?? {}),
  };
  const queries:QueryLog[]=[];
  let authCalls=0;
  class Query implements PromiseLike<Result> {
    readonly log:QueryLog;
    private inclusion?:{column:string;values:unknown[]};
    constructor(table:string) {this.log={table,columns:"",filters:[],single:false};queries.push(this.log);}
    select(columns:string) {this.log.columns=columns;return this;}
    eq(column:string,value:unknown) {this.log.filters.push([column,value]);return this;}
    order() {return this;}
    limit(value:number) {this.log.limit=value;return this;}
    maybeSingle() {this.log.single=true;return this;}
    in(column:string,values:unknown[]) {this.inclusion={column,values};return this;}
    then<TResult1=Result,TResult2=never>(onfulfilled?:((value:Result)=>TResult1|PromiseLike<TResult1>)|null,onrejected?:((reason:unknown)=>TResult2|PromiseLike<TResult2>)|null):PromiseLike<TResult1|TResult2> {
      const run = async ():Promise<Result> => {
        if(options.throwTable===this.log.table)throw new Error("PRIVATE_DATABASE_DETAIL");
        if(options.errorTable===this.log.table)return {data:null,error:{message:"PRIVATE_DATABASE_DETAIL"}};
        let rows=[...(tables[this.log.table]??[])];
        if(!options.ignoreFilters) rows=rows.filter(row=>this.log.filters.every(([key,value])=>String(row[key])===String(value)));
        if(this.inclusion) rows=rows.filter(row=>this.inclusion!.values.map(String).includes(String(row[this.inclusion!.column])));
        rows.sort((a,b)=>String(a.id)<String(b.id)?-1:String(a.id)>String(b.id)?1:0);
        if(this.log.limit!==undefined)rows=rows.slice(0,this.log.limit);
        return {data:this.log.single?rows[0]??null:rows,error:null};
      };
      return run().then(onfulfilled,onrejected);
    }
  }
  const client={
    from(table:string){return new Query(table);},
    auth:{
      async getUser(){
        authCalls++;
        if(options.auth==="throw")throw new Error("PRIVATE_AUTH_DETAIL");
        if(options.auth==="invalid")return {data:{user:{id:USER_ID}},error:{message:"PRIVATE_AUTH_DETAIL"}};
        return {data:{user:options.auth==="missing"?null:{id:USER_ID}},error:null};
      },
      async getSession(){throw new Error("getSession must not be used for authorization");},
    },
    storage:{from(){throw new Error("Storage must not be downloaded in this milestone");}},
  } as unknown as SupabaseClient;
  return {client,tables,queries,get authCalls(){return authCalls;}};
}

export function cvRow() {
  return {id:CV_ID,analysis_id:ANALYSIS_ID,user_id:USER_ID,storage_path:`${USER_ID}/cv.pdf`,original_filename:"cv.pdf",mime_type:"application/pdf",file_size_bytes:200};
}
export function githubProject(reference="https://github.com/acme/demo") {
  return normalizeProject({sourceType:"github",projectName:"demo",sourceReference:reference,revision:"a".repeat(40),discoveredFiles:1,files:[{path:"src/main.ts",content:"export const answer = 42;\n"}]});
}
export const mockIngestGithub:typeof ingestGithubRepository=async(reference)=>githubProject(reference);
