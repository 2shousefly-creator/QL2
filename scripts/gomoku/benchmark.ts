import { writeFileSync, mkdirSync } from 'node:fs';
import { cpus, platform } from 'node:os';
import { search } from '../../src/features/training/gomoku-v13/ai/SearchEngine';
import { SearchEngine as Baseline } from './baseline/SearchEngine';
import { BoardCore, otherMark, pointKey } from '../../src/features/training/gomoku-v13/ai/BoardCore';
import { verifyProof } from '../../src/features/training/gomoku-v13/ai/ProofVerifier';
import { seededRandom, DIFFICULTY_PROFILES } from '../../src/features/training/gomoku-v13/ai/DifficultyProfiles';
import { GOMOKU_RULE_ID } from '../../src/features/training/gomoku-v13/domain/GomokuRules';
import type { Stone, GomokuMark } from '../../src/features/training/gomoku-v13/domain/gomokuTypes';
import type { AiRequest } from '../../src/features/training/gomoku-v13/ai/aiTypes';
import { FIXTURES, stones } from './fixtures';
const arg=(name:string,fallback:string)=>process.argv.find(a=>a.startsWith('--'+name+'='))?.split('=')[1]??fallback;
const mode=arg('mode','fixtures'),cap=Number(arg('time','0')),pairs=Number(arg('pairs','2')),maxPlies=Number(arg('plies','80'));
const out=arg('out',`docs/benchmarks/gomoku-${mode}.json`);
const engines=['old-hard','easy','medium','hard'] as const;
type Engine=typeof engines[number];
const metrics:{engine:Engine;ms:number;nodes:number|null;depth:number|null;proof:boolean;timeout:boolean;fallback:boolean;ttEntries:number|null;heap:number}[]=[];
const choose=(engine:Engine,ss:readonly {x:number;y:number;mark:GomokuMark}[],side:GomokuMark,seed:string)=>{
 const start=performance.now();let result;
 if(engine==='old-hard'){
  const saved=Math.random;Math.random=seededRandom(seed);
  try{const converted:Stone[]=ss.map((s,i)=>({...s,actor:s.mark===side?'ai':'player',ply:i+1}));
   result={move:Baseline.selectMove(converted,side,otherMark(side),'hard',cap||2800),proofStatus:'unknown',proof:undefined};
  }finally{Math.random=saved;}
  metrics.push({engine,ms:performance.now()-start,nodes:null,depth:null,proof:false,timeout:false,fallback:false,ttEntries:null,heap:process.memoryUsage().heapUsed});
 }else{
  const request:AiRequest={protocolVersion:1,ruleId:GOMOKU_RULE_ID,matchId:'bench',requestId:seed,boardRevision:ss.length,sideToMove:side,aiMark:side,playerMark:otherMark(side),difficulty:engine,seed,stones:ss,searchBudget:cap?{timeMs:cap}:undefined};
  result=search(request);metrics.push({engine,ms:performance.now()-start,nodes:result.nodes,depth:result.completedDepth,proof:result.proofStatus==='proven_win',timeout:result.status==='timeout',fallback:result.completedDepth===0&&result.proofStatus==='unknown',ttEntries:result.ttEntries,heap:process.memoryUsage().heapUsed});
 }
 if(!result.move||!new BoardCore(ss).legal(result.move))throw Error(engine+': illegal/null move');return result;
};
const rows:unknown[]=[];
if(mode==='fixtures'){
 for(const f of FIXTURES)for(const engine of engines){
  const result=choose(engine,f.stones,f.side,f.id),board=new BoardCore(f.stones);
  const verified=result.proofStatus==='proven_win'&&result.proof?verifyProof(board,f.side,result.proof):false;
  const accepted=!!f.accepted?.some(p=>pointKey(p)===pointKey(result.move!))||!!(f.certificate&&pointKey(f.certificate.move)===pointKey(result.move!)&&verifyProof(board,f.side,f.certificate));
  rows.push({fixture:f.id,split:f.split,engine,move:result.move,accepted,verifiedProof:verified,solved:accepted||verified,...metrics.at(-1)});
 }
}else{
 const matchups:readonly [Engine,Engine][]=[['hard','old-hard'],['hard','medium'],['medium','easy']];
 const openings=[stones([[0,0],[1,1]],[[1,0],[0,1]]),stones([[0,0],[2,1]],[[1,0],[1,2]])];
 for(const [a,b] of matchups)for(let pair=0;pair<pairs;pair++)for(let swap=0;swap<2;swap++){
  const assigned=swap?[b,a]:[a,b],ss=[...openings[pair%openings.length]].map(s=>pair%2?{...s,mark:otherMark(s.mark)}:s);
  let side:GomokuMark=pair%2?'O':'X',winner:Engine|null=null,moves=0;
  for(;moves<maxPlies;moves++){
   const engine=assigned[side==='X'?0:1],r=choose(engine,ss,side,`${pair}:${moves}:${swap}`);
   ss.push({...r.move!,mark:side});const board=new BoardCore(ss);
   if(board.winningAt(r.move!,side)){winner=engine;break;}side=otherMark(side);
  }
  const row={a,b,pair,swap,assigned,starter:pair%2?'O':'X',winner,result:winner?'win':'unresolved_move_cap',moves:Math.min(moves+1,maxPlies),stones:ss};rows.push(row);console.log(JSON.stringify({a,b,pair,swap,winner,result:row.result,moves:row.moves}));
 }
}
const summary=engines.map(engine=>{const m=metrics.filter(m=>m.engine===engine),times=m.map(m=>m.ms).sort((a,b)=>a-b);return {engine,moves:m.length,meanMs:m.reduce((s,r)=>s+r.ms,0)/(m.length||1),p95Ms:times[Math.floor(times.length*.95)]??0,maxMs:times.at(-1)??0,nodes:m.reduce((s,r)=>s+(r.nodes??0),0),maxDepth:Math.max(0,...m.map(r=>r.depth??0)),proofs:m.filter(r=>r.proof).length,timeouts:m.filter(r=>r.timeout).length,depthZeroUnknownMoves:m.filter(r=>r.fallback).length,maxTTEntries:Math.max(0,...m.map(r=>r.ttEntries??0)),maxProcessHeapMiB:Math.max(0,...m.map(r=>r.heap))/1048576};});
const report={date:new Date().toISOString(),mode,ruleId:GOMOKU_RULE_ID,platform:platform(),cpu:cpus()[0]?.model,node:process.version,capMs:cap||'profile defaults',profiles:DIFFICULTY_PROFILES,pairs,maxPlies,notes:['Fixtures are small independent oracle/certificate regressions, NOT expert-rated puzzles. Holdout frozen before benchmark tuning.','Unknown alternative moves are not automatically wrong; solved counts are lower bounds when acceptable set is incomplete.','Move-cap outcomes are unresolved, never game-rule draws. Opening pairs are swapped, not externally balance-certified.','Old engine lacks telemetry and a strict deadline; its timing is measured, not assumed. Heap is sampled process-wide, not isolated engine peak memory.','depthZeroUnknownMoves includes mandatory blocks returned immediately and is not the Worker fallback count. This direct engine harness does not exercise the Worker watchdog.'],summary,rows};
mkdirSync(out.replace(/[\\/][^\\/]+$/,''),{recursive:true});writeFileSync(out,JSON.stringify(report,null,2)+'\n');console.table(summary);console.log(out);
