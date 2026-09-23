import { EQUIPMENT_CATALOG } from "./airCombatEquipmentCatalog";
import type { AircraftCombatState } from "./airCombatTypes";
import { releaseState } from "./airCombatReleaseState";
import { equipmentRewardsLocked, grantEquipmentReward, randomEquipmentId } from "./airCombatEquipmentState";

export const WAITING_CHEST_REWARDS = [
  {chance:.045, prefix:"TP", count:1, magnet:false, label:"1 Thành Phần"},
  {chance:.08, prefix:"TH", count:1, magnet:false, label:"1 Hoàn Chỉnh"},
  {chance:.18, prefix:"TP", count:2, magnet:false, label:"2 Thành Phần"},
  {chance:.23, prefix:"TH", count:2, magnet:false, label:"2 Hoàn Chỉnh"},
  {chance:.20, prefix:"TP", count:3, magnet:false, label:"3 Thành Phần"},
  {chance:.15, prefix:"TP", count:4, magnet:true, label:"4 Thành Phần + 1 Nam Châm Ma Thuật"},
  {chance:.07, prefix:"TH", count:3, magnet:true, label:"3 Hoàn Chỉnh + 1 Nam Châm Ma Thuật"},
  {chance:.04, prefix:"HL", count:1, magnet:true, label:"1 Huyền Thoại + 1 Nam Châm Ma Thuật"},
  {chance:.005, prefix:"HL", count:3, magnet:true, label:"3 Huyền Thoại + 1 Nam Châm Ma Thuật"},
] as const;
export const WAITING_CHEST_DESCRIPTION = "Đếm ngược 600 giây thời gian chiến đấu; dừng khi tạm dừng, mở Kho, chọn Lõi hoặc modal. Hạ quái thường giảm 0,5 giây; Tinh Anh giảm 5 giây; Boss không giảm. Mở thưởng một lần khi về 0.\n\n" + WAITING_CHEST_REWARDS.map(r=>`${(r.chance*100).toLocaleString("vi-VN",{maximumFractionDigits:1})}%: ${r.label}`).join("\n");
export function advanceWaitingChest(s:AircraftCombatState,seconds:number) {
  const chest=releaseState(s).waitingChest;
  if(chest&&!chest.claimed&&!chest.cancelled)chest.remaining=Math.max(0,chest.remaining-seconds);
}
export function claimWaitingChest(s:AircraftCombatState,random:()=>number):string|undefined {
  const chest=releaseState(s).waitingChest;
  if(!chest||chest.claimed||chest.cancelled||chest.remaining>0)return;
  if(equipmentRewardsLocked(s)){chest.cancelled=true;return;}
  let roll=random();
  const reward=WAITING_CHEST_REWARDS.find(r=>(roll-=r.chance)<0)??WAITING_CHEST_REWARDS[8];
  chest.claimed=true;
  const names:string[]=[];
  for(let i=0;i<reward.count;i++){const id=randomEquipmentId(reward.prefix,random);grantEquipmentReward(s,id,"core_227");names.push(EQUIPMENT_CATALOG[id].name);}
  chest.rewardLabel=`${reward.label} (${names.join(", ")})`;
  if(reward.magnet)grantEquipmentReward(s,"VP01","core_227");
  return `Đã nhận phần thưởng: ${chest.rewardLabel}`;
}
