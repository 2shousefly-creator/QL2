export const BATTLE = { width: 1920, height: 1080, rangeUnit: 190, moveSpeed: 160, minInterval: .4, maxInterval: 2.5, aiCadence: .1, projectileSpeed: 1050, hitTolerance: 38, floorMin: 430, floorMax: 730, separation: 58 };
export const QUALITY = { high: { density: 1, dpr: 2, particles: 100 }, medium: { density: .7, dpr: 1.5, particles: 70 }, low: { density: .4, dpr: 1, particles: 40 } };
export const CLASSES = ['Đỡ Đòn', 'Đấu Sĩ', 'Sát Thủ', 'Xạ Thủ', 'Pháp Sư', 'Hỗ Trợ'] as const;
export const SLOTS = ['Mũ', 'Giáp', 'Vũ Khí', 'Giày'] as const;
export const CLASS_ICONS = { 'Đỡ Đòn': '◈', 'Đấu Sĩ': '⚔', 'Sát Thủ': '⌁', 'Xạ Thủ': '➶', 'Pháp Sư': '✧', 'Hỗ Trợ': '❋' };
export const REGIONS = [
  { id: 1, name: 'Đồng Bằng Thanh Phong', subtitle: 'Linh lực thức giấc dưới thành cổ', color: '#6ba982', sky: '#82b6c8', ground: '#425e45', lore: 'Băng qua đồng cỏ và vọng lâu đá, mở lại con đường vận lương của triều đình.' },
  { id: 2, name: 'Hỏa Sơn Xích Diệm', subtitle: 'Lửa thiêng phủ bóng hoàng thành', color: '#e68a5d', sky: '#683c48', ground: '#412f37', lore: 'Pháo đài bazan giữa tro đỏ và dung nham. Hỏa Kỳ Lân đang thức giấc.' },
  { id: 3, name: 'Thiên Thành Vân Hải', subtitle: 'Chạm tới ngai vàng giữa biển mây', color: '#94bcea', sky: '#7a91b7', ground: '#525d7b', lore: 'Theo cầu đá xuyên tầng mây, đối diện thần long canh giữ lõi sấm của Thiên Thành.' },
];
