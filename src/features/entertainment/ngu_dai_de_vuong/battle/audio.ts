import { soundManager } from '../../../../game/audio';
export interface BattleAudio { play(event: string): void; destroy(): void; }
const tones:Record<string,[OscillatorType,number,number,number]>={earth:['triangle',95,38,.2],shield:['sine',420,680,.2],water:['sine',710,180,.18],claw:['sawtooth',230,75,.08],slash:['triangle',530,140,.08],lightning:['sawtooth',870,120,.1],metal:['square',1100,430,.09],buff:['sine',460,920,.22],fire:['sawtooth',165,43,.18],shadow:['sine',190,55,.12],blood:['triangle',240,80,.18],arrow:['triangle',1100,370,.07],ice:['sine',1450,770,.17],heal:['sine',520,1040,.3],cleanse:['sine',740,1480,.28],wind:['triangle',670,230,.19]};
export function createBattleAudio(): BattleAudio {
  let last=0,disposed=false,ctx:AudioContext|undefined;
  const active=new Set<OscillatorNode>();
  return {play(event){
    if(disposed||!soundManager.isEnabled())return;
    const now=performance.now();if(now-last<100)return;
    if(event==='victory'){last=now;soundManager.playSuccess();return;}
    if(event==='defeat'||event==='telegraph'){last=now;soundManager.playError();return;}
    const tone=tones[event]||(event==='crit'?tones.metal:undefined);if(!tone)return;
    last=now;
    try{
      ctx??=new AudioContext();if(ctx.state==='suspended')void ctx.resume().catch(()=>{});
      const t=ctx.currentTime,osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=tone[0];osc.frequency.setValueAtTime(tone[1],t);osc.frequency.exponentialRampToValueAtTime(tone[2],t+tone[3]);
      gain.gain.setValueAtTime(.001,t);gain.gain.linearRampToValueAtTime(.025,t+.012);gain.gain.exponentialRampToValueAtTime(.001,t+tone[3]);
      osc.connect(gain);gain.connect(ctx.destination);active.add(osc);osc.onended=()=>{active.delete(osc);osc.disconnect();gain.disconnect();};osc.start(t);osc.stop(t+tone[3]+.01);
    }catch{/* Audio availability never blocks combat. */}
  },destroy(){disposed=true;for(const osc of active){try{osc.stop();}catch{}osc.disconnect();}active.clear();void ctx?.close().catch(()=>{});ctx=undefined;}};
}
