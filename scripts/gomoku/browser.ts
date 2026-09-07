import {AiWorkerClient} from '../../src/features/training/gomoku-v13/ai/AiWorkerClient';
import {GOMOKU_RULE_ID} from '../../src/features/training/gomoku-v13/domain/GomokuRules';
import type {AiRequest} from '../../src/features/training/gomoku-v13/ai/aiTypes';
const result=document.querySelector('#result')!,button=document.querySelector<HTMLButtonElement>('#run')!;
const stones=(X:number[][],O:number[][]=[])=>[...X.map(([x,y])=>({x,y,mark:'X' as const})),...O.map(([x,y])=>({x,y,mark:'O' as const}))];
const request=(id:string,ss:AiRequest['stones']):AiRequest=>({protocolVersion:1,ruleId:GOMOKU_RULE_ID,matchId:'browser-smoke',requestId:id,boardRevision:ss.length,sideToMove:'X',aiMark:'X',playerMark:'O',difficulty:'hard',seed:id,stones:ss});
button.onclick=async()=>{
 button.disabled=true;const client=new AiWorkerClient(),rows:unknown[]=[];let beats=0,maxGap=0,previous=performance.now();
 const timer=setInterval(()=>{const t=performance.now();maxGap=Math.max(maxGap,t-previous);previous=t;document.querySelector('#heartbeat')!.textContent=String(++beats);},16);
 const check=(value:boolean,message:string)=>{if(!value)throw Error(message);};
 try{
  result.textContent='Đang chạy…';
  for(const [id,ss] of [['win',stones([[0,0],[1,0],[3,0],[4,0]])],['block',stones([[20,20]],[[0,0],[1,0],[3,0],[4,0]])]] as const){
   const r=await client.computeMove(request(id,ss));check(r.move?.x===2&&r.move?.y===0,id);rows.push({test:id,status:r.status,move:r.move});
  }
  const mid=stones([[0,0],[2,1],[1,3],[3,2]],[[1,0],[3,-1],[2,3],[0,2]]);
  const baseline=beats,started=performance.now(),r=await client.computeMove(request('search',mid));
  check(!!r.move,'no move');check(beats>baseline+5,'main-thread heartbeat stalled');rows.push({test:'responsive-search',elapsed:performance.now()-started,beats:beats-baseline,maxGap,depth:r.completedDepth,nodes:r.nodes,status:r.status,move:r.move});
  for(let i=0;i<3;i++){
   const pending=client.computeMove(request('cancel'+i,mid));await new Promise(resolve=>setTimeout(resolve,50));const start=performance.now();client.cancelActiveRequest();
   const cancelled=await pending;check(cancelled.status==='cancelled','cancel');rows.push({test:'cancel'+i,elapsed:performance.now()-start,status:cancelled.status});
  }
  const pending=client.computeMove(request('unmount',mid));client.dispose();check((await pending).status==='cancelled','dispose');
  rows.push({test:'dispose',status:'pass'});result.textContent='PASS\n'+JSON.stringify(rows,null,2);
 }catch(error){result.textContent='FAIL\n'+String(error)+'\n'+JSON.stringify(rows,null,2);}finally{clearInterval(timer);client.dispose();button.disabled=false;}
};
