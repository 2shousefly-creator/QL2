export const STATUS_CLIPS: Record<string,{clip:string;scale:number;y:number;rotate?:boolean;ground?:boolean}> = {
  shield:{clip:'statusShield',scale:.85,y:-105}, burn:{clip:'statusBurn',scale:.35,y:-48}, freeze:{clip:'statusFreeze',scale:.8,y:-102},
  stun:{clip:'statusStun',scale:.3,y:-284,rotate:true}, silence:{clip:'statusSilence',scale:.23,y:-284,rotate:true}, taunt:{clip:'statusTaunt',scale:.23,y:-284},
  armorPct:{clip:'statusArmorBreak',scale:.2,y:-210}, armor:{clip:'statusArmorBreak',scale:.2,y:-210}, mark:{clip:'statusMark',scale:.27,y:-150,rotate:true},
  attackSpeed:{clip:'statusSpeed',scale:.3,y:-120}, reduction:{clip:'statusReduction',scale:.23,y:-165}, damageDown:{clip:'statusDamageDown',scale:.22,y:-220},
  knockup:{clip:'statusDust',scale:.6,y:0,ground:true}, knockback:{clip:'statusSpeed',scale:.4,y:-30,ground:true},
};
