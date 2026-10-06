import { EQUIPMENT_CATALOG } from "./airCombatEquipmentCatalog";
import type { AircraftCombatState } from "./airCombatTypes";
import { releaseState } from "./airCombatReleaseState";
import { equipmentRewardsLocked, grantEquipmentReward, randomEquipmentId } from "./airCombatEquipmentState";

export const WAITING_CHEST_REWARDS = [
  {chance:.40, completed:3, legendary:0, magnet:false, label:"3 Hoàn Chỉnh"},
  {chance:.30, completed:4, legendary:0, magnet:false, label:"4 Hoàn Chỉnh"},
  {chance:.20, completed:2, legendary:1, magnet:false, label:"1 Huyền Thoại + 2 Hoàn Chỉnh"},
  {chance:.08, completed:0, legendary:2, magnet:false, label:"2 Huyền Thoại"},
  {chance:.02, completed:0, legendary:3, magnet:true, label:"3 Huyền Thoại + 1 Nam Châm Ma Thuật"},
] as const;
export const WAITING_CHEST_DESCRIPTION = "Đếm ngược 500 giây giao chiến; mỗi quái thường bị hạ giảm 1 giây, mỗi Tinh Anh bị hạ giảm 8 giây, Boss không giảm. Đồng hồ chỉ chạy khi giao chiến đang diễn ra. Khi hết giờ: " + WAITING_CHEST_REWARDS.map(r=>`${r.chance*100}%: ${r.label}`).join("; ");
export function advanceWaitingChest(s:AircraftCombatState,seconds:number) {
  const chest=releaseState(s).waitingChest;
  if(chest&&!chest.claimed&&!chest.cancelled)chest.remaining=Math.max(0,chest.remaining-seconds);
}
export function claimWaitingChest(s:AircraftCombatState,random:()=>number):string|undefined {
  const chest=releaseState(s).waitingChest;
  if(!chest||chest.claimed||chest.cancelled||chest.remaining>0)return;
  if(equipmentRewardsLocked(s)){chest.cancelled=true;return;}
  let roll=random();
  const reward=WAITING_CHEST_REWARDS.find(r=>(roll-=r.chance)<0)??WAITING_CHEST_REWARDS[4];
  chest.claimed=true;
  const names:string[]=[],transactionId=s.coreState.nextAcquisitionId;
  for(const [prefix,count] of [["TH",reward.completed],["HL",reward.legendary]] as const)for(let i=0;i<count;i++){const id=randomEquipmentId(prefix,random);if(grantEquipmentReward(s,id,"core_227",undefined,transactionId))names.push(EQUIPMENT_CATALOG[id].name);}
  chest.rewardLabel=`${reward.label} (${names.join(", ")})`;
  if(reward.magnet)grantEquipmentReward(s,"VP01","core_227",undefined,transactionId);
  return `Đã nhận phần thưởng: ${chest.rewardLabel}`;
}
