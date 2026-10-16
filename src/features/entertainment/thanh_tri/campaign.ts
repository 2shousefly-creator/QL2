import {ENEMIES} from './content';

type EnemyDefinition = typeof ENEMIES[number];
export interface CampaignStage {
 id:number; name:string; subtitle:string; theme:string; color:string;
 hp:number; damage:number; speed:number; armor:number; eliteWaves:readonly [number,number,number];
 roster:readonly string[]; enemies:EnemyDefinition[];
}
type StageInput=Omit<CampaignStage,'enemies'>;
const definitions:StageInput[]=[
 {id:1,name:'Cổng Thành Hoàng Hôn',subtitle:'Giữ ngọn lửa cuối cùng',theme:'Đạo quân xương và thiết giáp',color:'#edc487',hp:1,damage:1,speed:1,armor:0,eliteWaves:[4,7,12],roster:ENEMIES.map(e=>e.name)},
 {id:2,name:'Rừng Gai Độc',subtitle:'Khu rừng đã thức giấc',theme:'Mộc yêu, sói gai và cổ thụ',color:'#9ee1a5',hp:1.10,damage:1.07,speed:1.02,armor:0,eliteWaves:[4,7,11],roster:['Mộc Yêu Gai','Sói Gai','Sói Gai Đầu Đàn','Vệ Binh Mộc','Mộc Vệ Cổ Thụ','Vương Cổ Thụ','Vương Cổ Thụ Cuồng Nộ']},
 {id:3,name:'Hẻm Núi Tro Tàn',subtitle:'Băng qua dòng dung nham',theme:'Quỷ than, hỏa kỳ nhông và dung nham',color:'#ffac77',hp:1.22,damage:1.14,speed:1.04,armor:.01,eliteWaves:[3,6,10],roster:['Quỷ Than','Hỏa Kỳ Nhông','Kỳ Nhông Dung Nham','Vệ Binh Hắc Nham','Cự Vệ Hắc Nham','Bạo Chúa Dung Nham','Bạo Chúa Lò Lửa']},
 {id:4,name:'Pháo Đài Băng Giá',subtitle:'Không để ngọn lửa tắt',theme:'Hàn thi, sói tuyết và băng tinh',color:'#a1ddff',hp:1.35,damage:1.22,speed:1.06,armor:.02,eliteWaves:[3,6,9],roster:['Hàn Thi','Sói Tuyết','Sói Tuyết Đầu Đàn','Vệ Binh Băng Tinh','Cự Vệ Băng Tinh','Vua Băng Khổng Lồ','Vua Băng Vĩnh Cửu']},
 {id:5,name:'Đầm Lầy Oán Linh',subtitle:'Ánh đuốc giữa sương tà',theme:'Thủy thi, cóc độc và nấm quỷ',color:'#c6b1ef',hp:1.49,damage:1.31,speed:1.08,armor:.03,eliteWaves:[2,5,8],roster:['Thủy Thi','Cóc Độc','Cóc Chúa Độc','Nấm Quỷ','Nấm Quỷ Cổ Đại','Nữ Chúa Đầm Lầy','Nữ Chúa Oán Linh']},
 {id:6,name:'Vực Tối Hư Không',subtitle:'Trận chiến ở tận cùng',theme:'Tà giáo, trùng hư không và hắc thạch',color:'#c4a7ff',hp:1.65,damage:1.40,speed:1.10,armor:.04,eliteWaves:[2,5,7],roster:['Tín Đồ Hư Không','Trùng Hư Không','Trùng Chúa Hư Không','Hộ Vệ Hắc Thạch','Cự Vệ Hắc Thạch','Ma Vương Hư Không','Ma Vương Tận Thế']},
];

// Preserve counts, EXP, ally/core balance and the original stage. Later stages
// increase pressure through stats and earlier elite introductions.
export const CAMPAIGN:readonly CampaignStage[]=definitions.map(stage=>({...stage,enemies:ENEMIES.map((base,kind)=>({
 ...base,name:stage.roster[kind],hp:Math.round(base.hp*stage.hp),damage:Math.round(base.damage*stage.damage),
 speed:base.speed*stage.speed,armor:Math.min(.45,base.armor+stage.armor),
}))}));
export const stageById=(id:number)=>CAMPAIGN.find(stage=>stage.id===id)??CAMPAIGN[0];
export const stageEnemy=(stageId:number,kind:number)=>stageById(stageId).enemies[kind];
export const stageBackground=(id:number)=>id===1?'/games/thanh-tri/v1/background.webp':`/games/thanh-tri/v1.2/stage${stageById(id).id}-background.webp`;
const forms=['infantry','runner','runner','heavy','heavy','boss','boss'] as const;
export const enemyAtlas=(stageId:number,kind:number)=>stageId===1?'enemy'+kind:`s${stageById(stageId).id}-${forms[kind]}`;
export function enemyKind(stageId:number,wave:number,roll:number){
 const [runner,heavy,giant]=stageById(stageId).eliteWaves;
 return roll<.4?0:roll<.7?1:wave>=giant&&roll>.9?4:wave>=heavy&&roll>.8?3:wave>=runner?2:0;
}

export interface BattleResult {won:boolean;stageId?:number;wave:number;kills:number;level:number;hp:number;time:number;cores:number}
export interface StageRecord {hp:number;time:number;wins:number}
export interface CampaignProgress {version:1;cleared:number[];best:Partial<Record<number,StageRecord>>}
export const RESULT_KEY='ql2.thanh-tri.v1.last-result';
export const CAMPAIGN_KEY='ql2.thanh-tri.campaign.v1';
const emptyProgress=():CampaignProgress=>({version:1,cleared:[],best:{}});
const validNumber=(n:unknown,max:number)=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=max;
export function readLastResult():BattleResult|null {
 try {
  const r=JSON.parse(localStorage.getItem(RESULT_KEY)||'null');
  if(!r||typeof r.won!=='boolean'||!validNumber(r.wave,20)||!validNumber(r.kills,800)||!validNumber(r.time,86400)||!validNumber(r.hp,2000)||!validNumber(r.level,20)||!validNumber(r.cores,19))return null;
  if(r.stageId!==undefined&&(!Number.isInteger(r.stageId)||r.stageId<1||r.stageId>CAMPAIGN.length))return null;
  return r;
 }catch{return null;}
}
function sanitize(raw:unknown):CampaignProgress {
 const clean=emptyProgress();if(!raw||typeof raw!=='object')return clean;
 const value=raw as Partial<CampaignProgress>;if(value.version!==1||!Array.isArray(value.cleared))return clean;
 // A stored stage cannot jump over an uncleared prerequisite.
 for(const stage of CAMPAIGN){if(!value.cleared.includes(stage.id))break;clean.cleared.push(stage.id);
  const r=value.best?.[stage.id];if(r&&validNumber(r.hp,2000)&&validNumber(r.time,86400)&&validNumber(r.wins,Number.MAX_SAFE_INTEGER))clean.best[stage.id]={hp:r.hp,time:r.time,wins:Math.max(1,Math.floor(r.wins))};
 }return clean;
}
export function loadCampaign():CampaignProgress {
 let progress=emptyProgress();try{progress=sanitize(JSON.parse(localStorage.getItem(CAMPAIGN_KEY)||'null'));}catch{}
 // V1 only retained the last result. Preserve a known legacy victory; never
 // infer victories from a loss or reset the previous last-result save.
 const last=readLastResult();if(last?.won&&(last.stageId??1)===1&&!progress.cleared.includes(1)){
  progress.cleared=[1];progress.best[1]={hp:Math.max(0,Math.min(2000,last.hp||0)),time:last.time,wins:1};
 }return progress;
}
export const stageUnlocked=(progress:CampaignProgress,id:number)=>CAMPAIGN.some(stage=>stage.id===id)&&(id===1||progress.cleared.includes(id-1));
export const nextStage=(progress:CampaignProgress)=>CAMPAIGN.find(stage=>!progress.cleared.includes(stage.id))?.id??CAMPAIGN.length;
export function persistCampaign(current:CampaignProgress):{progress:CampaignProgress;saved:boolean} {
 const disk=loadCampaign();
 const progress=sanitize({version:1,cleared:[...new Set([...disk.cleared,...current.cleared])],best:{...disk.best,...current.best}});
 for(const id of progress.cleared){const a=current.best[id],b=disk.best[id];if(a&&b)progress.best[id]={hp:Math.max(a.hp,b.hp),time:Math.min(a.time,b.time),wins:Math.max(a.wins,b.wins)};}
 try{localStorage.setItem(CAMPAIGN_KEY,JSON.stringify(progress));return {progress,saved:true};}catch{return {progress,saved:false};}
}
export function recordVictory(current:CampaignProgress,result:BattleResult):{progress:CampaignProgress;saved:boolean} {
 if(!result.won)return {progress:current,saved:true};
 const disk=loadCampaign();const progress=sanitize({version:1,cleared:[...new Set([...current.cleared,...disk.cleared])],best:{...disk.best,...current.best}});
 const id=result.stageId??1;if(!stageUnlocked(progress,id))return {progress,saved:false};
 if(!progress.cleared.includes(id))progress.cleared.push(id);
 const previous=progress.best[id],external=disk.best[id];
 progress.best[id]={hp:Math.max(previous?.hp??0,external?.hp??0,result.hp),time:Math.min(previous?.time??Infinity,external?.time??Infinity,result.time),wins:Math.max(previous?.wins??0,external?.wins??0)+1};
 return persistCampaign(progress);
}
