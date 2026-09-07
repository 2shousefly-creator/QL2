import {writeFileSync} from 'node:fs';
import {BoardCore} from '../../src/features/training/gomoku-v13/ai/BoardCore';
import {search} from '../../src/features/training/gomoku-v13/ai/SearchEngine';
import {GOMOKU_RULE_ID} from '../../src/features/training/gomoku-v13/domain/GomokuRules';
const rows=[];
for(const count of [64,512,2048]){
 const ss=Array.from({length:count},(_,i)=>({x:(i%32)*1000-100000,y:Math.floor(i/32)*1000+20000,mark:i%2?'X' as const:'O' as const}));
 const start=performance.now(),r=search({protocolVersion:1,ruleId:GOMOKU_RULE_ID,matchId:'stress',requestId:'r',boardRevision:ss.length,sideToMove:'X',aiMark:'X',playerMark:'O',difficulty:'hard',seed:'stress',stones:ss,searchBudget:{timeMs:120,nodes:1000}});
 if(!r.move||!new BoardCore(ss).legal(r.move))throw Error('illegal move');
 rows.push({stones:count,elapsedMs:performance.now()-start,searchElapsedMs:r.elapsedMs,status:r.status,depth:r.completedDepth,nodes:r.nodes,move:r.move,heapMiB:process.memoryUsage().heapUsed/1048576});
}
writeFileSync('docs/benchmarks/gomoku-sparse-stress.json',JSON.stringify({date:new Date().toISOString(),note:'Scattered-board workload on current desktop; not a low-end-device test. Initial mandatory scan can exceed search budget; host watchdog remains independent.',rows},null,2)+'\n');console.table(rows);
