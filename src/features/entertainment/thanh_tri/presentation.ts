import {FIGHTERS,FIELD,elementLabel,type Core} from './content';
import {cooldown,has,range,skillStats} from './rules';
import type {Actor,World} from './types';
const num=(n:number)=>n.toLocaleString('vi-VN',{maximumFractionDigits:2});
export function skillSummary(a:Actor){const f=FIGHTERS[a.owner],s=skillStats(a);if(a.owner==='archer')return `Vô hệ · ${num(100*(1+(has(a,1)?.25:0)+(has(a,10)?.2:0)+(has(a,11)?.1:0)))} sát thương/tên trước bonus theo tình huống · 30 tên · nạp 5s. Các bonus điều kiện cộng theo sát thương gốc.`;
 const lines=[`${elementLabel(a.owner)} · ${num(f.damage*s.damage*s.multi)} sát thương mỗi hit/nhịp trước giáp và ngũ hành.`,`Hồi chiêu ${num(cooldown(a))}s · tầm ${num(range(a)/FIELD.H)}H · ${num(s.critChance*100)}% crit, crit ×${num(s.critMultiplier)}.`];
 if(f.groups.includes('width'))lines.push(`Bề rộng ${num((a.owner==='stone_rhino'?.18:.2)*s.width)}W${a.owner==='stone_rhino'?' · chiều dài 0,40H':''}.`);
 if(f.groups.includes('count'))lines.push(`${s.count} tia/đạn/đợt mỗi lần dùng · hệ số mỗi tia/đợt ×${num(s.multi)}.`);
 if(a.owner==='thunder_bull')lines.push(`${s.chain} mục tiêu tổng cộng/tia · tê liệt 1s.`);
 if(a.owner==='venom_serpent')lines.push(`Độc ${num(25*s.damage*s.multi)}/giây/lớp trong ${s.duration}s.`);
 if(a.owner==='spirit_deer')lines.push(`3 nhịp · trói 1,5s ở nhịp đầu · hồi ${num(s.healing)} HP/cast có địch trúng.`);
 if(a.owner==='frost_fox')lines.push(`Xuyên ${s.pierce} địch/châm · đóng băng 1,5s.`);
 if(a.owner==='water_dragon')lines.push('Mỗi địch chỉ trúng một lần/đợt · đóng băng 1,5s.');
 if(a.owner==='flame_tiger')lines.push(`4 nhịp · nón ${num(s.angle*180/Math.PI)}° · burn ${num(20*s.burn)}/giây trong 3s.`);
 if(a.owner==='phoenix')lines.push(`Vùng lửa ${num(35*s.damage*s.multi)}/giây ×4 tick mỗi đợt.`);
 if(a.owner==='black_tortoise')lines.push(`Thêm ${num(s.shield)} HP khiên/cast có địch trúng · trần 400.`);
 return lines.join('\n');
}
export function corePreview(w:World,c:Core){if(c.kind==='wall')return c.index===1?`Sau khi chọn: ${w.blocks+5} lớp chặn.`:`Sau khi chọn: ${Math.min(2000,w.hp+400)} / 2.000 HP.`;if(c.kind==='summon')return 'Triệu hồi vào ô trống kế tiếp với 0 lõi nâng cấp.';const a=w.actors.find(a=>a.owner===c.owner);return a?'Sau khi chọn:\n'+skillSummary({...a,cores:[...a.cores,c.index]}):'';}
