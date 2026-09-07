import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSync } from 'esbuild';
import { Worker as NodeWorker } from 'node:worker_threads';
import { AiWorkerClient, type WorkerPort } from '../../src/features/training/gomoku-v13/ai/AiWorkerClient';
import { emptyResult, validResponse } from '../../src/features/training/gomoku-v13/ai/WorkerProtocol';
import { identityOf, type AiRequest, type AiResponse } from '../../src/features/training/gomoku-v13/ai/aiTypes';
import { GOMOKU_RULE_ID } from '../../src/features/training/gomoku-v13/domain/GomokuRules';
import { createInitialMatchState, matchReducer } from '../../src/features/training/gomoku-v13/domain/MatchReducer';
import type { GomokuMatchState } from '../../src/features/training/gomoku-v13/domain/gomokuTypes';
import { p, stones } from './fixtures';
const request=(id='r'):AiRequest=>({protocolVersion:1,ruleId:GOMOKU_RULE_ID,matchId:'m',requestId:id,boardRevision:4,
 sideToMove:'X',aiMark:'X',playerMark:'O',difficulty:'hard',seed:'s',stones:stones([[0,0],[1,0],[3,0],[4,0]])});
const response=(r:AiRequest,kind:AiResponse['kind']='result'):AiResponse=>({...identityOf(r),...emptyResult('ok'),move:p(2,0),score:999999,safety:'win',proofStatus:'proven_win',kind});
class FakeWorker implements WorkerPort {
 onmessage:WorkerPort['onmessage']=null;onerror:WorkerPort['onerror']=null;onmessageerror:WorkerPort['onmessageerror']=null;
 sent:AiRequest[]=[];terminated=false;postMessage(r:AiRequest){this.sent.push(r);}terminate(){this.terminated=true;}
 emit(r:AiResponse){this.onmessage?.({data:r} as MessageEvent<AiResponse>);}
}
const fakeClient=()=>{const workers:FakeWorker[]=[];return {workers,client:new AiWorkerClient(()=>{const w=new FakeWorker();workers.push(w);return w;},5)};};
test('cancel and replace settle both requests; stale messages/errors cannot affect replacement',async()=>{
 const {client,workers}=fakeClient(),a=client.computeMove(request('a')),oldMessage=workers[0].onmessage!,oldError=workers[0].onerror!;
 const b=client.computeMove(request('b'));assert.equal((await a).status,'cancelled');assert.ok(workers[0].terminated);
 oldMessage({data:response(request('a'))} as MessageEvent<AiResponse>);oldError({} as ErrorEvent);
 workers[1].emit(response(request('b')));assert.equal((await b).requestId,'b');assert.equal(workers[1].terminated,false);client.dispose();assert.ok(workers[1].terminated);
});
test('success reuses worker and duplicate callbacks are ignored',async()=>{
 const {client,workers}=fakeClient(),r=request(),a=client.computeMove(r);workers[0].emit(response(r));assert.equal((await a).status,'ok');
 workers[0].emit(response(r));const r2=request('next'),b=client.computeMove(r2);assert.equal(workers.length,1);workers[0].emit(response(r));workers[0].emit(response(r2));assert.equal((await b).requestId,'next');client.dispose();
});
for(const fault of ['error','messageerror','illegal','null','schema'] as const)test(`fault ${fault} settles finitely without awarding an outcome`,async()=>{
 const {client,workers}=fakeClient(),r=request(),pending=client.computeMove(r),w=workers[0];
 if(fault==='error')w.onerror?.({} as ErrorEvent);
 else if(fault==='messageerror')w.onmessageerror?.({} as MessageEvent);
 else w.emit({...response(r),...(fault==='illegal'?{move:p(0,0)}:fault==='null'?{move:null}:{protocolVersion:99})} as AiResponse);
 const result=await pending;assert.equal(result.status,'error');assert.equal(result.move,null);assert.ok(w.terminated);client.dispose();
});
test('watchdog returns verified best-completed fallback; no search on UI thread',async()=>{
 const {client,workers}=fakeClient(),r={...request(),searchBudget:{timeMs:1}},pending=client.computeMove(r);
 workers[0].emit(response(r,'progress'));const result=await pending;assert.equal(result.status,'timeout');assert.deepEqual(result.move,p(2,0));assert.equal(result.safety,'win');assert.ok(workers[0].terminated);client.dispose();
});
test('timeout without verified fallback enters recoverable error; dispose settles and stops',async()=>{
 const {client,workers}=fakeClient();const r={...request(),searchBudget:{timeMs:1}};const result=await client.computeMove(r);assert.equal(result.move,null);assert.equal(result.status,'timeout');
 const pending=client.computeMove(request('dispose'));client.dispose();assert.equal((await pending).status,'cancelled');assert.ok(workers.every(w=>w.terminated));
});
test('worker creation/post errors settle and immutable input snapshot is retained',async()=>{
 const unavailable=new AiWorkerClient(()=>{throw Error('no worker');});assert.equal((await unavailable.computeMove(request())).status,'error');
 const {client,workers}=fakeClient(),r=request(),pending=client.computeMove(r);(r.stones as {x:number;y:number;mark:'X'}[])[0].x=800;
 assert.equal(workers[0].sent[0].stones[0].x,0);workers[0].emit(response(workers[0].sent[0]));assert.deepEqual((await pending).move,p(2,0));client.dispose();
});
test('response identities, malformed metrics and coordinates are rejected',()=>{
 const r=request(),good=response(r);assert.ok(validResponse(good,r));
 for(const fields of [{boardRevision:3},{sideToMove:'O'},{aiMark:'O'},{matchId:'old'},{ruleId:'renju'},{move:p(NaN,0)},{move:p(.1,2)},{score:Infinity},{nodes:-1},{completedDepth:NaN}])assert.equal(validResponse({...good,...fields} as AiResponse,r),false);
});
const initial=():GomokuMatchState=>({...createInitialMatchState('hard','O','test'),matchId:'m',phase:'ai_turn',startingActor:'ai'});
const identity=(s:GomokuMatchState,id='r')=>({...identityOf(request(id)),boardRevision:s.stones.length});
test('reducer identity gate rejects stale/wrong-mark/revision results and duplicate moves',()=>{
 let state=initial(),id=identity(state);state=matchReducer(state,{type:'AI_BEGIN',identity:id});
 for(const fields of [{requestId:'old'},{boardRevision:10},{matchId:'old'},{sideToMove:'O'},{aiMark:'O'},{ruleId:'renju'},{protocolVersion:2}])assert.equal(matchReducer(state,{type:'AI_PLACE',point:p(0,0),identity:{...id,...fields} as typeof id}),state);
 for(const point of [p(NaN,1),p(.5,1)])assert.equal(matchReducer(state,{type:'AI_PLACE',point,identity:id}),state);
 const placed=matchReducer(state,{type:'AI_PLACE',point:p(0,0),identity:id});assert.equal(placed.stones.length,1);assert.equal(placed.phase,'player_turn');assert.equal(placed.aiRequest,null);
 assert.equal(matchReducer(placed,{type:'AI_PLACE',point:p(1,0),identity:id}),placed);
 const restarted={...initial(),matchId:'new'};assert.equal(matchReducer(restarted,{type:'AI_PLACE',point:p(1,0),identity:id}),restarted);
});
test('pause/retry/terminal identity cleanup; errors never become wins or rewards',()=>{
 let s=initial();for(let i=0;i<3;i++){
  const id=identity(s,'r'+i);s=matchReducer(s,{type:'AI_BEGIN',identity:id});s=matchReducer(s,{type:'AI_FAILED',identity:id});
  assert.equal(s.phase,'error');assert.equal(s.stones.length,0);assert.equal(s.resultCommitted,false);
  const next=matchReducer(s,{type:'AI_RETRY'});if(i===2)assert.equal(next,s);else {assert.equal(next.phase,'ai_turn');s=next;}
 }
 let a=initial(),id=identity(a);a=matchReducer(a,{type:'AI_BEGIN',identity:id});a=matchReducer(a,{type:'PAUSE'});assert.equal(a.aiRequest,null);
 assert.equal(matchReducer(a,{type:'AI_PLACE',point:p(0,0),identity:id}),a);
 const terminal={...initial(),phase:'ai_won' as const};assert.equal(matchReducer(terminal,{type:'AI_PLACE',point:p(0,0),identity:id}),terminal);
});
test('actual worker thread runs bundled production entry and cancellation kills computation',async()=>{
 const code=buildSync({entryPoints:['src/features/training/gomoku-v13/ai/GomokuWorker.ts'],bundle:true,write:false,format:'cjs',platform:'node',logLevel:'silent'}).outputFiles[0].text;
 const factory=():WorkerPort=>{
  const worker=new NodeWorker(`const {parentPort}=require('node:worker_threads');global.self={postMessage:m=>parentPort.postMessage(m)};${code};parentPort.on('message',data=>self.onmessage({data}));`,{eval:true});
  const port:WorkerPort={onmessage:null,onerror:null,onmessageerror:null,postMessage:r=>worker.postMessage(r),terminate:()=>{void worker.terminate();}};
  worker.on('message',data=>port.onmessage?.({data} as MessageEvent<AiResponse>));worker.on('error',()=>port.onerror?.({} as ErrorEvent));return port;
 };
 const client=new AiWorkerClient(factory),r=await client.computeMove(request());assert.deepEqual(r.move,p(2,0));assert.equal(r.proofStatus,'proven_win');
 const long={...request('long'),stones:stones([[0,0],[2,1]],[[1,0],[3,-1]]),boardRevision:4};
 const pending=client.computeMove(long);const start=performance.now();client.cancelActiveRequest();assert.equal((await pending).status,'cancelled');assert.ok(performance.now()-start<100);
 const again=await client.computeMove(request('again'));assert.deepEqual(again.move,p(2,0));client.dispose();
});

test('malformed request settles without allocating a worker',async()=>{
 let allocations=0;const client=new AiWorkerClient(()=>{allocations++;return new FakeWorker();});
 const bad={...request(),stones:undefined} as unknown as AiRequest;assert.equal((await client.computeMove(bad)).status,'error');assert.equal(allocations,0);client.dispose();
});
test('verified winning fallback cannot be replaced by a weaker progress message',async()=>{
 const {client,workers}=fakeClient(),r={...request(),searchBudget:{timeMs:1}},pending=client.computeMove(r);
 workers[0].emit(response(r,'progress'));workers[0].emit({...response(r,'progress'),move:p(8,8),proofStatus:'unknown',safety:'legal',completedDepth:8});
 const result=await pending;assert.deepEqual(result.move,p(2,0));assert.equal(result.proofStatus,'proven_win');client.dispose();
});
