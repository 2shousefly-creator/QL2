import test from 'node:test';
import assert from 'node:assert/strict';
import { BoardCore, otherMark, pointKey } from '../../src/features/training/gomoku-v13/ai/BoardCore';
import { analyzeThreats, winningMoves, independentThreats } from '../../src/features/training/gomoku-v13/ai/ThreatAnalyzer';
import { oracleWins, verifyProof } from '../../src/features/training/gomoku-v13/ai/ProofVerifier';
import { TacticalSolver, proofPV, type WinProof } from '../../src/features/training/gomoku-v13/ai/TacticalSolver';
import { SearchBudget } from '../../src/features/training/gomoku-v13/ai/SearchBudget';
import { orderedMoves } from '../../src/features/training/gomoku-v13/ai/CandidateGenerator';
import { search } from '../../src/features/training/gomoku-v13/ai/SearchEngine';
import { seededRandom } from '../../src/features/training/gomoku-v13/ai/DifficultyProfiles';
import { TranspositionTable, scoreToTT, scoreFromTT } from '../../src/features/training/gomoku-v13/ai/TranspositionTable';
import { MATE } from '../../src/features/training/gomoku-v13/ai/PositionEvaluator';
import { checkWinAt, GOMOKU_RULE_ID, DIRECTIONS } from '../../src/features/training/gomoku-v13/domain/GomokuRules';
import { SparseGomokuBoard } from '../../src/features/training/gomoku-v13/domain/SparseBoard';
import type { AiRequest, SearchResult } from '../../src/features/training/gomoku-v13/ai/aiTypes';
import { FIXTURES, stones, p } from './fixtures';
const keys=(ps:readonly {x:number;y:number}[])=>ps.map(pointKey).sort();
const request=(ss:AiRequest['stones'],difficulty:AiRequest['difficulty']='hard'):AiRequest=>({protocolVersion:1,ruleId:GOMOKU_RULE_ID,matchId:'t',requestId:'r',boardRevision:ss.length,aiMark:'X',sideToMove:'X',playerMark:'O',difficulty,seed:'repeatable',stones:ss});

for(const mark of ['X','O'] as const) for(const [dx,dy] of DIRECTIONS) for(const length of [5,6,9]) test(`rule ${mark} ${dx},${dy} >=${length}`,()=>{
 const ss=Array.from({length},(_,i)=>({x:-100000+dx*i,y:900000+dy*i,mark,actor:'ai' as const,ply:i+1}));
 assert.equal(checkWinAt(new SparseGomokuBoard(ss),ss[0],mark)?.length,length);
});
test('safe integer domain: no aliases, virtual-center wins, or arbitrary world edge',()=>{
 assert.throws(()=>new BoardCore(stones([[NaN,0]])));assert.throws(()=>new BoardCore(stones([[1.2,0]])));
 assert.throws(()=>new BoardCore(stones([[Number.MAX_SAFE_INTEGER+1,0]])));
 const ss=stones(Array.from({length:4},(_,i)=>[Number.MAX_SAFE_INTEGER-i,20]));const b=new BoardCore(ss);
 assert.deepEqual(keys(winningMoves(b,'X')),keys([p(Number.MAX_SAFE_INTEGER-4,20)]));
 assert.equal(checkWinAt(b,p(Number.MAX_SAFE_INTEGER-4,20),'X'),null);
});
test('broken four has one completion; open four has two; overlapping windows deduplicate',()=>{
 const broken=new BoardCore(stones([[0,0],[1,0],[3,0],[4,0]]));
 assert.deepEqual(keys(winningMoves(broken,'X')),['2:0']);
 assert.equal(analyzeThreats(broken,'X').filter(t=>t.kind==='open_four').length,0);
 const open=new BoardCore(stones([[0,0],[1,0],[2,0],[3,0]]));
 const threats=analyzeThreats(open,'X').filter(t=>t.kind==='open_four');
 assert.equal(threats.length,1);assert.deepEqual(keys(threats[0].winningSquares),['-1:0','4:0']);
});
test('three continuations and actual cost sets, blocked and fake patterns',()=>{
 const b=new BoardCore(stones([[0,0],[1,0],[2,0]]));
 const t=analyzeThreats(b,'X').find(t=>t.kind==='open_three')!;
 assert.deepEqual(keys(t.continuations.map(c=>c.move)),['-1:0','3:0']);assert.deepEqual(keys(t.defensiveSquares),['-1:0','3:0']);
 b.make(p(-1,0),'O');assert.equal(analyzeThreats(b,'X').some(t=>t.kind==='open_three'),false);
 const gap=new BoardCore(stones([[0,0],[2,0],[4,0]]));assert.equal(analyzeThreats(gap,'X').some(t=>t.kind==='open_three'),false);
 const cross=new BoardCore(stones([[-1,0],[0,0],[1,0],[0,-1],[0,1]]));
 const ts=analyzeThreats(cross,'X').filter(t=>t.kind==='open_three');assert.equal(ts.length,2);assert.ok(independentThreats(ts[0],ts[1]));
});
for(let sample=0;sample<60;sample++) test(`independent oracle + transforms ${sample}`,()=>{
 const rnd=seededRandom('oracle'+sample),cells=new Map<string,ReturnType<typeof stones>[number]>();
 for(let i=0;i<18;i++){const s={x:Math.floor(rnd()*9)-4,y:Math.floor(rnd()*9)-4,mark:rnd()<.5?'X' as const:'O' as const};cells.set(pointKey(s),s);}
 const initial=[...cells.values()],base=new BoardCore(initial);
 for(const mark of ['X','O'] as const){const expected=oracleWins(base,mark);assert.deepEqual(keys(winningMoves(base,mark)),keys(expected));
  for(const [rotate,mirror,shift] of [[0,1,0],[1,1,-10000],[1,-1,100000],[0,-1,7]]){
   const transform=(v:{x:number;y:number})=>({x:(rotate?-v.y:v.x)*mirror+shift,y:(rotate?v.x:v.y)-shift});
   const transformed=new BoardCore(initial.map(s=>({...transform(s),mark:otherMark(s.mark)})));
   assert.deepEqual(keys(winningMoves(transformed,otherMark(mark))),keys(expected.map(transform)));
  }
 }
});
test('make/unmake, order-independent hash, side and TT collision verification',()=>{
 const ss=stones([[0,0],[1,2]],[[-2,3]]),b=new BoardCore(ss),key=b.key('X'),sig=b.signature();
 assert.equal(new BoardCore([...ss].reverse()).key('X'),key);assert.notEqual(b.key('O'),key);
 b.make(p(9,-8),'O');assert.equal(b.key('X'),new BoardCore([...ss,{...p(9,-8),mark:'O'}]).key('X'));b.unmake(p(9,-8));assert.equal(b.key('X'),key);assert.equal(b.signature(),sig);
 const tt=new TranspositionTable(1);tt.set(b,'X',{depth:4,score:15,bound:'LOWER'});assert.equal(tt.get(b,'X')?.bound,'LOWER');assert.equal(tt.get(b,'O'),undefined);
 const collision=new BoardCore(stones([[55,44]]));collision.key=()=>key;assert.equal(tt.get(collision,'X'),undefined);
 tt.set(b,'O',{depth:1,score:-5,bound:'UPPER'});assert.equal(tt.size,1);assert.equal(tt.get(b,'X'),undefined);
 for(const score of [MATE-9,-MATE+12,17])assert.equal(scoreFromTT(scoreToTT(score,7),7),score);
 assert.equal(scoreFromTT(scoreToTT(MATE-9,7),2),MATE-4);
});
for(const fixture of FIXTURES) test(`fixture oracle ${fixture.id}`,()=>{
 const b=new BoardCore(fixture.stones);assert.equal(b.terminal(),false);
 if(fixture.certificate)assert.ok(verifyProof(b,fixture.side,fixture.certificate));
 if(fixture.difficulty==='immediate'||fixture.difficulty==='overline'||fixture.difficulty==='counter-kill')assert.deepEqual(keys(oracleWins(b,'X')),keys(fixture.accepted!));
});
for(const difficulty of ['easy','medium','hard'] as const) test(`${difficulty}: mandatory tactical safety across all clusters`,()=>{
 for(const f of FIXTURES.filter(f=>f.accepted&&f.difficulty!=='VCT')){
  const r=search(request(f.stones,difficulty));assert.ok(f.accepted!.some(p=>pointKey(p)===pointKey(r.move!)),f.id);assert.ok(Number.isFinite(r.score));
 }
 const f=FIXTURES.find(f=>f.id==='block-far-cluster')!,b=new BoardCore(f.stones);
 assert.deepEqual(keys(orderedMoves(b,'X',1).map(c=>c.move)),keys(f.accepted!));
 const loss=search(request(stones([[20,20]],[[0,0],[1,0],[2,0],[3,0]]),difficulty));assert.equal(loss.proofStatus,'proven_loss');
});
test('VCF goes beyond general search; independently replay every forced reply',()=>{
 const f=FIXTURES.find(f=>f.id==='seven-ply-ladder')!,b=new BoardCore(f.stones),sig=b.signature();
 const r=new TacticalSolver(new SearchBudget(performance.now()+5000,30000)).solve(b,'X',25,false);
 assert.equal(r.status,'proven_win');assert.ok(proofPV(r.proof!).length>=7);assert.ok(verifyProof(b,'X',r.proof!));assert.equal(b.signature(),sig);
});
test('VCT covers alternative defenses and the outside class, not just one PV',()=>{
 const f=FIXTURES.find(f=>f.id==='cross-three')!,b=new BoardCore(f.stones);
 const vcf=new TacticalSolver(new SearchBudget(performance.now()+3000,10000)).solve(b,'X',15,false);assert.equal(vcf.status,'unknown');
 const r=new TacticalSolver(new SearchBudget(performance.now()+5000,30000)).solve(b,'X',15,true);
 assert.equal(r.status,'proven_win');assert.equal(r.proof?.kind,'three');assert.ok(verifyProof(b,'X',r.proof!));
 if(r.proof?.kind==='three'){assert.ok(r.proof.overrides.length>0);const bad={...r.proof,overrides:[]};assert.equal(verifyProof(b,'X',bad),false);}
 const hard=search(request(f.stones));assert.equal(hard.proofStatus,'proven_win');assert.ok(verifyProof(b,'X',hard.proof!));
});
test('counter-kill invalidates apparent fork; timeout/cutoff never proves loss',()=>{
 const b=new BoardCore(stones([[0,0],[1,0],[2,0]],[[20,0],[21,0],[22,0],[23,0]]));
 const bad:WinProof={kind:'fork',move:p(3,0),wins:[p(-1,0),p(4,0)]};assert.equal(verifyProof(b,'X',bad),false);
 const r=new TacticalSolver(new SearchBudget(Infinity,0)).solve(b,'X',25,true);assert.equal(r.status,'unknown');
 const c=new BoardCore(stones([[-1,0],[1,0],[0,-1],[0,1]],[[0,2],[0,3],[0,4]]));
 const solve=new TacticalSolver(new SearchBudget(performance.now()+500,2000)).solve(c,'X',9,true);
 if(solve.proof)assert.ok(verifyProof(c,'X',solve.proof));else assert.equal(solve.status,'unknown');
});
test('aborted iterative deepening retains exact last completed root result',()=>{
 const ss=stones([[0,0],[2,1]],[[1,0],[3,-1]]),progress:SearchResult[]=[];
 const r=search({...request(ss,'medium'),searchBudget:{timeMs:800,nodes:70}},{onProgress:p=>progress.push(p)});
 const completed=progress.at(-1)!;assert.deepEqual(r.move,completed.move);assert.equal(r.score,completed.score);assert.equal(r.completedDepth,completed.completedDepth);assert.ok(Number.isFinite(r.score));
 const a=search({...request(ss,'easy'),searchBudget:{timeMs:200,nodes:50}}),b=search({...request(ss,'easy'),searchBudget:{timeMs:200,nodes:50}});
 assert.deepEqual(a.move,b.move);
 const cancelled=search(request(ss),{cancelled:()=>true});assert.equal(cancelled.status,'cancelled');assert.equal(cancelled.proofStatus,'unknown');
});

test('incremental winning sets and evaluation match full rebuild across make/unmake branches',()=>{
 const b=new BoardCore(),stack:{x:number;y:number;mark:'X'|'O'}[]=[],rnd=seededRandom('incremental');
 const slow=(mark:'X'|'O')=>{
  const windows=new Set<string>();let sum=0;
  for(const stone of stack.filter(s=>s.mark===mark))for(let d=0;d<DIRECTIONS.length;d++){
   const [dx,dy]=DIRECTIONS[d];for(let start=-4;start<=0;start++){
    const x=stone.x+dx*start,y=stone.y+dy*start,key=`${d}:${x}:${y}`;if(windows.has(key))continue;windows.add(key);
    let count=0,blocked=false;for(let k=0;k<5;k++){const s=stack.find(s=>s.x===x+k*dx&&s.y===y+k*dy);if(s&&s.mark!==mark){blocked=true;break;}if(s)count++;}
    if(!blocked)sum+=[0,1,12,180,3500,0][count];
   }
  }return sum;
 };
 for(let i=0;i<100;i++){
  if(stack.length&&rnd()<.4){const s=stack.pop()!;b.unmake(s);}else{
   let move;do{move={x:Math.floor(rnd()*12)-6,y:Math.floor(rnd()*12)-6,mark:rnd()<.5?'X' as const:'O' as const};}while(!b.legal(move));
   b.make(move,move.mark);stack.push(move);
  }
  const fresh=new BoardCore(stack);assert.equal(b.key('X'),fresh.key('X'));assert.equal(b.evaluate('X'),slow('X')-slow('O'));
  for(const side of ['X','O'] as const){assert.deepEqual(keys(winningMoves(b,side)),keys(oracleWins(b,side)));assert.deepEqual(keys(winningMoves(b,side)),keys(winningMoves(fresh,side)));}
 }
 while(stack.length)b.unmake(stack.pop()!);assert.equal(b.size,0);assert.equal(b.evaluate('X'),0);assert.deepEqual(winningMoves(b,'X'),[]);
});
test('search threat scores and TT never turn a selective result into a proof',()=>{
 const f=FIXTURES.find(f=>f.id==='cross-three')!,r=search(request(f.stones,'easy'));
 assert.equal(r.proofStatus,'unknown');assert.equal(r.proof,undefined);
});

test('multi-win loss includes independently checkable witness',()=>{
 const ss=stones([[20,20]],[[0,0],[1,0],[2,0],[3,0]]),b=new BoardCore(ss),r=search(request(ss));
 assert.equal(r.proofStatus,'proven_loss');assert.deepEqual(keys(r.lossWitness!.opponentWinningSquares),keys(oracleWins(b,'O')));assert.deepEqual(oracleWins(b,'X'),[]);
});
