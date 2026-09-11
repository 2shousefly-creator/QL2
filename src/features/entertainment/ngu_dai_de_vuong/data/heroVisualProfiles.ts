export interface HeroVisualProfile {
  species: string; silhouette: string; palette: [string, string, string];
  width: number; height: number; headScale: number; float: number;
  weaponAnchor: [number, number]; projectile: string; secondary: string;
}
export const HERO_VISUAL_PROFILES: Record<string, HeroVisualProfile> = {
  H001: { species: 'Sơn thần', silhouette: 'mountain', palette: ['#767d72','#bc965b','#42644c'], width: 1.35, height: .95, headScale: .8, float: 0, weaponAnchor: [65,-112], projectile: 'stone', secondary: 'stone' },
  H002: { species: 'Thủy long hộ thần', silhouette: 'dragon', palette: ['#219c89','#c3e5e3','#25517c'], width: .94, height: 1.12, headScale: .9, float: 0, weaponAnchor: [58,-127], projectile: 'jadePulse', secondary: 'water' },
  H003: { species: 'Bạch hổ nhân', silhouette: 'tiger', palette: ['#eeeee2','#d0a244','#20272f'], width: 1.18, height: .92, headScale: 1.16, float: 0, weaponAnchor: [74,-102], projectile: 'claw', secondary: 'fur' },
  H004: { species: 'Thần quy cổ đại', silhouette: 'tortoise', palette: ['#557058','#a99a5b','#253e49'], width: 1.28, height: .83, headScale: .82, float: 0, weaponAnchor: [67,-98], projectile: 'runePulse', secondary: 'shell' },
  H005: { species: 'Long huyết kiếm sĩ', silhouette: 'dragonKnight', palette: ['#982c3c','#eeb75b','#24212e'], width: 1.02, height: 1.06, headScale: .95, float: 0, weaponAnchor: [71,-152], projectile: 'dragonFlame', secondary: 'cape' },
  H006: { species: 'Lôi quỷ', silhouette: 'oni', palette: ['#493453','#84e1f2','#111d35'], width: 1.13, height: 1.01, headScale: 1.02, float: 0, weaponAnchor: [66,-119], projectile: 'lightning', secondary: 'electric' },
  H007: { species: 'Thiên tướng', silhouette: 'celestialGeneral', palette: ['#ece4ce','#ceac61','#78b5db'], width: .97, height: 1.17, headScale: .87, float: 0, weaponAnchor: [56,-147], projectile: 'goldBlade', secondary: 'banner' },
  H008: { species: 'Hồ yêu hỏa linh', silhouette: 'fox', palette: ['#e28c49','#a5528c','#592b51'], width: .88, height: 1.03, headScale: 1.04, float: 0, weaponAnchor: [72,-127], projectile: 'foxFlame', secondary: 'tails' },
  H009: { species: 'Miêu yêu bóng tối', silhouette: 'cat', palette: ['#283a61','#53a7ad','#111e30'], width: .76, height: .86, headScale: 1.13, float: 0, weaponAnchor: [62,-101], projectile: 'shadowDagger', secondary: 'catTail' },
  H010: { species: 'Huyết tộc quý tộc', silhouette: 'vampire', palette: ['#861c39','#c6c8d5','#211c30'], width: .81, height: 1.23, headScale: .85, float: 0, weaponAnchor: [57,-138], projectile: 'bloodCrescent', secondary: 'batCape' },
  H011: { species: 'Hồn ma vô diện', silhouette: 'specter', palette: ['#738f9b','#a9efdf','#263e4e'], width: .84, height: 1.07, headScale: .91, float: 18, weaponAnchor: [77,-120], projectile: 'spectralDagger', secondary: 'smoke' },
  H012: { species: 'Thiên sứ cung thủ', silhouette: 'wingedArcher', palette: ['#e5e4cd','#debc75','#549f9a'], width: .85, height: 1.11, headScale: .92, float: 0, weaponAnchor: [80,-143], projectile: 'arrow', secondary: 'lightWings' },
  H013: { species: 'Điểu nhân', silhouette: 'harpy', palette: ['#389991','#916ac0','#cfbd91'], width: .9, height: .98, headScale: 1, float: 0, weaponAnchor: [73,-125], projectile: 'featherArrow', secondary: 'wings' },
  H014: { species: 'Chiến binh thái dương', silhouette: 'solarConstruct', palette: ['#dbae39','#f0943b','#2c2e38'], width: 1.08, height: 1.13, headScale: .79, float: 0, weaponAnchor: [84,-145], projectile: 'solarArrow', secondary: 'halo' },
  H015: { species: 'Tinh linh tuyết', silhouette: 'snowFairy', palette: ['#94d9e8','#f5fbff','#7196b9'], width: .72, height: .94, headScale: 1.07, float: 27, weaponAnchor: [59,-165], projectile: 'frostBolt', secondary: 'crystal' },
  H016: { species: 'Tinh tú lôi tiên', silhouette: 'astral', palette: ['#493a80','#73bded','#d9b774'], width: .86, height: 1.18, headScale: .86, float: 15, weaponAnchor: [66,-173], projectile: 'starBolt', secondary: 'astral' },
  H017: { species: 'Phượng hỏa ma', silhouette: 'phoenix', palette: ['#a93242','#ffad48','#302a35'], width: 1.04, height: 1.08, headScale: .96, float: 9, weaponAnchor: [77,-165], projectile: 'fireball', secondary: 'flameWings' },
  H018: { species: 'Nguyệt thần', silhouette: 'moonPriestess', palette: ['#c4ccdf','#8b79b9','#263556'], width: .8, height: 1.16, headScale: .89, float: 7, weaponAnchor: [60,-133], projectile: 'moonArc', secondary: 'moonVeil' },
  H019: { species: 'Liên hoa tinh linh', silhouette: 'lotus', palette: ['#71b688','#f1b8c6','#edf0d6'], width: .87, height: .9, headScale: 1.1, float: 12, weaponAnchor: [66,-115], projectile: 'petal', secondary: 'petals' },
  H020: { species: 'Hạc thần gió', silhouette: 'tengu', palette: ['#d8d9d1','#408d93','#b44d49'], width: .93, height: 1.2, headScale: .98, float: 0, weaponAnchor: [85,-155], projectile: 'windFeather', secondary: 'feathers' },
};
