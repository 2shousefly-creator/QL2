import { useState } from 'react';
import type { FarmPrimaryModal } from '../TangGiaScreen';
import type { RankStep } from '../../../game/types';
import type { AnimalTypeId, CropId, EggTypeId, FarmSaveState, FeedTypeId, FertilizerTypeId } from '../farmTypes';
import { ANIMAL_CATALOG, CROP_CATALOG, EGG_INFO_MAP, FARM_PLOT_UNLOCKS, FEED_CATALOG, FERTILIZER_CATALOG } from '../farmCatalog';
import { calculateMaxFeedQuantity, getItemSellPrice, getRankNameForDisplay, rankAtLeast } from '../farmEngine';
import { QUALITY_CONFIG } from '../weatherEngine';
import { TANG_GIA_ASSETS } from '../tangGiaAssetManifest';
import type { FarmMobileSnapshot, MobileAction, MobileRow, MobileSheet } from './mobileTypes';

type Category = 'crop' | 'fertilizer' | 'animal' | 'feed' | 'egg';
export type FarmMobileBridge = {
  farm: FarmSaveState; rank: RankStep; snapshot: FarmMobileSnapshot;
  modal: FarmPrimaryModal | null; closeModal(): void; openModal(modal: FarmPrimaryModal): void;
  selectedPlot: number | null; selectedAnimal: string | null;
  selectPlot(index: number): void; selectAnimal(id: string): void;
  canWater: boolean; canTreat: boolean; canFertilize: boolean; harvesting: boolean;
  plantOpen(): void; plant(crop: CropId, fertilizer: FertilizerTypeId | null): void;
  water(): void; treat(): void; fertilize(id: FertilizerTypeId): void;
  harvest(): void; harvestAll(): void; clearPlot(): void; unlock(index: number): void;
  enter(id: AnimalTypeId): void; dismiss(): void; feed(id: FeedTypeId, count: number): void;
  buyCrop(id: CropId, count: number): void; buyAnimal(id: AnimalTypeId, count: number): void;
  buyFeed(id: FeedTypeId, count: number): void; buyFertilizer(id: FertilizerTypeId, count: number): void;
  sell(category: 'seeds' | 'fertilizer' | 'animals' | 'feed', id: string, count: number): void;
  sellEggs(id: EggTypeId, count: number): void; sellAllEggs(): void;
};
const categories: { id: Category; title: string }[] = [
  { id: 'crop', title: 'Hạt giống' }, { id: 'fertilizer', title: 'Phân bón' },
  { id: 'animal', title: 'Vật nuôi' }, { id: 'feed', title: 'Thức ăn' }, { id: 'egg', title: 'Trứng' },
];
const categoryKey = { crop: 'seeds', fertilizer: 'fertilizer', animal: 'animals', feed: 'feed', egg: 'eggs' } as const;
const action = (id: string, label: string, run: () => void, reason?: string, primary = false): MobileAction => ({ id, label, run, reason, primary });
const row = (id: string, title: string, detail?: string, run?: () => void, reason?: string, icon?: string): MobileRow => ({
  id, title, detail: [detail, reason].filter(Boolean).join('\n'), icon,
  action: run ? action(id, title, run, reason) : undefined,
});

type LocalSheet = { kind: 'plot' | 'animal' | 'pen' } | { kind: 'item'; category: Category; id: string; mode: 'buy' | 'sell' | 'feed' }
  | { kind: 'apply-confirm'; id: FertilizerTypeId }
  | { kind: 'seed-fertilizer'; cropId: CropId; plotIndex: number };
export function useFarmMobileSheets(b: FarmMobileBridge) {
  const [local, setLocal] = useState<LocalSheet | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [fertilizer, setFertilizer] = useState<FertilizerTypeId | null>(null);
  const close = () => { setLocal(null); b.closeModal(); };
  const open = (modal: FarmPrimaryModal) => { setLocal(null); setQuantity(1); b.openModal(modal); };
  const selectPlot = (index: number) => { b.closeModal(); b.selectPlot(index); setLocal({ kind: 'plot' }); };
  const selectAnimal = (id: string) => { b.closeModal(); b.selectAnimal(id); setLocal({ kind: 'animal' }); };
  const openPen = () => { b.closeModal(); setLocal({ kind: 'pen' }); };
  const itemSheet = (category: Category, id: string, mode: 'buy' | 'sell' | 'feed') => { setQuantity(1); setLocal({ kind: 'item', category, id, mode }); };
  let sheet: MobileSheet | null = null;
  const make = (id: string, title: string, rows: MobileRow[], description?: string, actions?: MobileAction[]): MobileSheet => ({ id, title, rows, description, actions, close });
  const s = b.snapshot, modal = b.modal;
  const metadata = (category: Category) => {
    switch (category) {
      case 'crop': return CROP_CATALOG.map(x => ({ id: x.id, title: x.name, price: x.seedCostGold, rank: x.requiredRank, icon: TANG_GIA_ASSETS.crops[x.id].seed, detail: `Thu hoạch cơ bản: ${x.harvestGold} Vàng · ${x.harvestXp} XP` }));
      case 'fertilizer': return FERTILIZER_CATALOG.map(x => ({ id: x.id, title: x.name, price: x.purchaseGold, rank: x.requiredRank, icon: TANG_GIA_ASSETS.fertilizer[x.id], detail: `XP +${Math.round(x.xpBonusPct * 100)}% · Thời gian -${Math.round(x.growthTimeReductionPct * 100)}%` }));
      case 'animal': return ANIMAL_CATALOG.map(x => ({ id: x.id, title: x.name, price: x.purchaseGold, rank: x.requiredRank, icon: undefined, detail: `${EGG_INFO_MAP[x.eggTypeId].name}: ${x.eggSellGold} Vàng · ${x.eggSellXp} XP cơ bản` }));
      case 'feed': return FEED_CATALOG.map(x => ({ id: x.id, title: x.name, price: x.costGold, rank: x.requiredRank, icon: TANG_GIA_ASSETS.feed[x.id], detail: `Nạp ${x.buffAmount}% · Tăng tốc ${x.speedBonusPercent}%` }));
      case 'egg': return Object.entries(EGG_INFO_MAP).map(([id, x]) => ({ id, title: x.name, price: x.sellGold, rank: null, icon: undefined, detail: `${x.sellGold} Vàng · ${x.sellXp} XP cơ bản; giá thực theo phẩm chất` }));
    }
  };
  const countOf = (category: Category, id: string) => (b.farm.inventory[categoryKey[category]] as Record<string, number>)[id] || 0;

  // Authoritative transaction results/confirmations always take precedence.
  if (modal?.type === 'dialog') {
    sheet = make('dialog', modal.dialog.title, [], modal.dialog.message,
      [action('confirm', modal.dialog.confirmLabel || 'Xác nhận', () => { setLocal(null); modal.dialog.onConfirm ? modal.dialog.onConfirm() : close(); }, undefined, true)]);
  } else if (modal?.type === 'reward') {
    const reward = modal.summary;
    const rows = (reward.itemsSummary ?? []).map((item, index) => row(`reward-${index}`, `${item.name ?? 'Vật phẩm'} ×${item.count ?? 0}`));
    for (const [quality, data] of Object.entries(reward.qualityBreakdown ?? {})) {
      if (data.quantity) rows.push({ ...row(`quality-${quality}`, QUALITY_CONFIG[quality as keyof typeof QUALITY_CONFIG].name,
        `${data.quantity} vật phẩm · ${data.gold} Vàng · ${data.xp} XP`), accent: QUALITY_CONFIG[quality as keyof typeof QUALITY_CONFIG].color });
    }
    rows.push(row('reward-total', `${reward.goldEarned} Vàng · ${reward.xpEarned} XP`, reward.message));
    for (const [id, name, value] of [['fertilizer', 'XP từ phân bón', reward.fertilizerBonusXp], ['rain', 'Vàng từ mưa', reward.rainBonusGold], ['drought', 'Giảm Vàng do khô hạn', reward.droughtPenaltyGold]] as const) {
      if (value) rows.push(row(id, `${name}: ${value}`));
    }
    sheet = make('reward', reward.title, rows);
  } else if (local?.kind === 'apply-confirm' && modal?.type === 'apply-fertilizer') {
    const item = FERTILIZER_CATALOG.find(item => item.id === local.id)!;
    sheet = make(`apply-confirm-${item.id}`, 'Xác nhận bón phân', [row('fertilizer-detail', item.name,
      `Dùng 1 bao · XP +${Math.round(item.xpBonusPct * 100)}% · Thời gian còn lại -${Math.round(item.growthTimeReductionPct * 100)}%`, undefined, undefined, TANG_GIA_ASSETS.fertilizer[item.id])], undefined,
      [action('apply-confirm', 'Bón phân', () => { setLocal(null); b.fertilize(item.id); }, countOf('fertilizer', item.id) < 1 ? 'Hết phân bón' : undefined, true)]);
  } else if (local?.kind === 'item' && (modal?.type === 'store' || modal?.type === 'inventory' || modal?.type === 'feed')) {
    const { category, id, mode } = local;
    const item = metadata(category).find(item => item.id === id);
    if (item) {
      const stock = countOf(category, id);
      const max = mode === 'buy' ? Math.floor(b.farm.gold / Math.max(1, item.price)) : mode === 'feed'
        ? calculateMaxFeedQuantity({ ...b.farm, penFeedBuffValue: s.feed }, id as FeedTypeId) : stock;
      const qty = Math.max(1, Math.min(quantity, Math.max(1, max)));
      const price = mode === 'sell' && category !== 'egg' ? getItemSellPrice(categoryKey[category], id) : item.price;
      const reason = mode === 'buy' && !rankAtLeast(b.rank, item.rank) ? `Cần ${getRankNameForDisplay(item.rank)}` : max < 1 ? (mode === 'buy' ? 'Không đủ Vàng' : mode === 'feed' && s.feed >= 100 ? 'Máng đã đầy' : 'Không còn trong kho') : undefined;
      const rows = [row('item-detail', item.title, `${item.detail}\nTrong kho: ${stock}`, undefined, undefined, item.icon),
        row('quantity', `Số lượng: ${qty}`, `Tối đa: ${Math.max(0, max)}`),
        row('minus', 'Giảm 1', undefined, () => setQuantity(Math.max(1, qty - 1)), qty <= 1 ? 'Đã ở mức tối thiểu' : undefined),
        row('plus', 'Tăng 1', undefined, () => setQuantity(Math.min(max, qty + 1)), qty >= max ? 'Đã ở mức tối đa' : undefined),
        row('all', 'Chọn tối đa', undefined, () => setQuantity(Math.max(1, max)), max < 1 ? reason : undefined)];
      if (category === 'egg') {
        for (const [quality, data] of Object.entries(b.farm.eggQualityInventory?.[id as EggTypeId] ?? {})) {
          if (data.count > 0) rows.push({ ...row(`egg-quality-${quality}`, `${QUALITY_CONFIG[quality as keyof typeof QUALITY_CONFIG].name}: ${data.count}`, `Thưởng mưa đã lưu: ${data.rainGoldBonus} Vàng`), accent: QUALITY_CONFIG[quality as keyof typeof QUALITY_CONFIG].color });
        }
      }
      const commit = () => {
        if (reason) return;
        setLocal(null);
        if (mode === 'feed') b.feed(id as FeedTypeId, qty);
        else if (mode === 'sell') category === 'egg' ? b.sellEggs(id as EggTypeId, qty) : b.sell(categoryKey[category], id, qty);
        else if (category === 'crop') b.buyCrop(id as CropId, qty);
        else if (category === 'fertilizer') b.buyFertilizer(id as FertilizerTypeId, qty);
        else if (category === 'animal') b.buyAnimal(id as AnimalTypeId, qty);
        else if (category === 'feed') b.buyFeed(id as FeedTypeId, qty);
      };
      sheet = make(`item-${mode}-${id}`, mode === 'buy' ? 'Xác nhận mua' : mode === 'feed' ? 'Nạp thức ăn' : 'Xác nhận bán', rows,
        category === 'egg' ? 'Bán theo thứ tự phẩm chất hiện có; kết quả hiển thị sau giao dịch.' : undefined,
        [action('item-confirm', mode === 'feed' ? `Nạp ${qty} bao` : category === 'egg' ? `Bán ${qty} trứng` : `${mode === 'buy' ? 'Mua' : 'Bán'} ${qty} · ${qty * price} Vàng`, commit, reason, true)]);
    }
  } else if (local?.kind === 'seed-fertilizer' && modal?.type === 'plant' && modal.plotIndex === local.plotIndex) {
    const crop = CROP_CATALOG.find(item => item.id === local.cropId)!;
    const seedAvailable = countOf('crop', crop.id) > 0;
    const selected = fertilizer && countOf('fertilizer', fertilizer) > 0 ? fertilizer : null;
    const rows = [row('no-fertilizer', `${selected === null ? 'Đã chọn · ' : ''}Không dùng phân bón`, undefined, () => setFertilizer(null)),
      ...FERTILIZER_CATALOG.map(item => row(`seed-fert-${item.id}`, `${selected === item.id ? 'Đã chọn · ' : ''}${item.name}`,
        `Còn ${countOf('fertilizer', item.id)} · XP +${Math.round(item.xpBonusPct * 100)}% · Thời gian -${Math.round(item.growthTimeReductionPct * 100)}%`,
        () => setFertilizer(item.id), countOf('fertilizer', item.id) < 1 ? 'Hết phân bón' : undefined, TANG_GIA_ASSETS.fertilizer[item.id]))];
    sheet = make(`seed-fert-${local.plotIndex}`, `Gieo ${crop.name}`, rows, 'Chọn phân bón cho lần gieo này.',
      [action('plant-confirm', 'Xác nhận gieo', () => { setLocal(null); b.plant(crop.id, selected); }, seedAvailable ? undefined : 'Hết hạt giống', true)]);
  } else if (modal?.type === 'store' || modal?.type === 'inventory') {
    const buying = modal.type === 'store';
    const category = modal.tab;
    const rows = categories.filter(item => !buying || item.id !== 'egg').map(item => row(`category-${item.id}`, `${item.id === category ? 'Đang xem · ' : ''}${item.title}`, undefined,
      () => open(buying ? { type: 'store', tab: item.id as Exclude<Category, 'egg'> } : { type: 'inventory', tab: item.id })));
    rows.push(...metadata(category).map(item => {
      const stock = countOf(category, item.id);
      const reason = buying ? !rankAtLeast(b.rank, item.rank) ? `Cần ${getRankNameForDisplay(item.rank)}` : b.farm.gold < item.price ? 'Không đủ Vàng' : undefined : stock < 1 ? 'Chưa có trong kho' : undefined;
      return row(`catalog-${item.id}`, item.title, `${stock} trong kho${buying ? ` · ${item.price} Vàng` : ''}\n${item.detail}`,
        () => itemSheet(category, item.id, buying ? 'buy' : 'sell'), reason, item.icon);
    }));
    sheet = make(`${modal.type}-${category}`, buying ? 'Cửa hàng' : 'Kho', rows, undefined,
      !buying && category === 'egg' ? [action('sell-all-eggs', 'Bán tất cả trứng', () => open({ type: 'dialog', dialog: { title: 'Bán tất cả trứng', message: `Bán ${s.eggs} trứng đang có trong kho theo phẩm chất thực tế?`, onConfirm: b.sellAllEggs } }), s.eggs ? undefined : 'Kho trứng trống', true)] : undefined);
  } else if (modal?.type === 'plant') {
    sheet = make(`plant-${modal.plotIndex}`, 'Chọn hạt giống', CROP_CATALOG.map(crop => row(`seed-${crop.id}`, crop.name, `Còn ${countOf('crop', crop.id)} hạt`, () => {
      const plot = b.farm.plots[modal.plotIndex];
      const remembered = plot?.status === 'empty' ? plot.lastFertilizerId : null;
      setFertilizer(remembered && countOf('fertilizer', remembered) > 0 ? remembered : null);
      setLocal({ kind: 'seed-fertilizer', cropId: crop.id, plotIndex: modal.plotIndex });
    }, countOf('crop', crop.id) < 1 ? 'Hết hạt giống' : undefined, TANG_GIA_ASSETS.crops[crop.id].seed)), undefined,
    [action('buy-seeds', 'Mua hạt giống', () => open({ type: 'store', tab: 'crop' }))]);
  } else if (modal?.type === 'apply-fertilizer') {
    sheet = make(`fertilizer-${modal.plotIndex}`, 'Bón phân', FERTILIZER_CATALOG.map(item => row(`apply-${item.id}`, item.name,
      `Còn ${countOf('fertilizer', item.id)} · XP +${Math.round(item.xpBonusPct * 100)}% · Thời gian -${Math.round(item.growthTimeReductionPct * 100)}%`,
      () => setLocal({ kind: 'apply-confirm', id: item.id }), countOf('fertilizer', item.id) < 1 ? 'Hết phân bón' : undefined, TANG_GIA_ASSETS.fertilizer[item.id])), undefined,
      [action('buy-fert', 'Mua phân bón', () => open({ type: 'store', tab: 'fertilizer' }))]);
  } else if (modal?.type === 'enter-pen') {
    sheet = make('enter-pen', 'Thả vật nuôi', ANIMAL_CATALOG.map(item => row(`enter-${item.id}`, item.name, `Còn ${countOf('animal', item.id)}`,
      () => b.enter(item.id), !countOf('animal', item.id) ? 'Chưa có trong kho' : s.animals.length >= s.capacity ? 'Chuồng đã đầy' : undefined)), `${s.animals.length}/${s.capacity} chỗ`,
      [action('buy-animal', 'Mua vật nuôi', () => open({ type: 'store', tab: 'animal' }))]);
  } else if (modal?.type === 'feed') {
    sheet = make('feed', 'Chọn thức ăn', FEED_CATALOG.map(item => row(`feed-${item.id}`, item.name,
      `Còn ${countOf('feed', item.id)} · Tăng tốc ${item.speedBonusPercent}%`, () => itemSheet('feed', item.id, 'feed'),
      !countOf('feed', item.id) ? 'Hết thức ăn' : s.feed >= 100 ? 'Máng đã đầy' : undefined, TANG_GIA_ASSETS.feed[item.id])), `Máng: ${s.feedLabel}`,
      [action('buy-feed', 'Mua thức ăn', () => open({ type: 'store', tab: 'feed' }))]);
  } else if (modal?.type === 'trough') {
    sheet = make('trough', 'Máng ăn', [row('feed-amount', `Lượng thức ăn: ${s.feedLabel}`, 'Dung lượng 100%'),
      row('feed-speed', `Tăng tốc hiện tại: ${s.feedBonus}%`), row('feed-end', 'Dự kiến hết thức ăn', s.feedRemaining),
      ...(s.dangerRemaining ? [row('danger', 'Thời gian nguy hiểm còn lại', s.dangerRemaining)] : []),
      ...metadata('feed').map(item => row(`feed-help-${item.id}`, item.title, item.detail))], undefined,
      [action('open-feed', 'Nạp thức ăn', () => open({ type: 'feed' }), undefined, true)]);
  } else if (modal?.type === 'weather') {
    sheet = make('weather', 'Mùa và thời tiết', [row('weather-current', s.weatherLabel, s.weatherDescription)],
      'Thời tiết và ngày/đêm được lấy từ lịch hiện có. Đất, thời gian và phần thưởng tiếp tục dùng quy tắc Tăng Gia.');
  } else if (local?.kind === 'plot' && b.selectedPlot !== null) {
    const plot = s.plots[b.selectedPlot];
    if (plot) {
      const rows: MobileRow[] = [];
      if (plot.status === 'locked') {
        const unlock = FARM_PLOT_UNLOCKS.find(config => config.plotIndex === plot.index);
        if (unlock) rows.push(row('unlock', `Mở khóa · ${unlock.gold} Vàng`, getRankNameForDisplay(unlock.requiredRank), () => b.unlock(plot.index),
          !rankAtLeast(b.rank, unlock.requiredRank) ? 'Chưa đủ quân hàm' : b.farm.gold < unlock.gold ? 'Không đủ Vàng' : undefined));
      } else {
        rows.push(row('plot-state', plot.title, `${plot.timer}\nĐộ ẩm ${Math.round(plot.moisture)}% · ${plot.moistureLabel}\n${plot.fertilizer ? 'Đã có phân bón' : 'Chưa dùng phân bón'}`));
        if (plot.quality) rows.push({ ...row('plot-quality', `Phẩm chất: ${QUALITY_CONFIG[plot.quality].name}`), accent: QUALITY_CONFIG[plot.quality].color });
        rows.push(row('water', 'Tưới nước', undefined, b.water, b.canWater ? undefined : 'Chưa thể tưới ô này'));
        if (plot.status === 'empty') rows.push(row('plant-open', 'Gieo hạt', undefined, b.plantOpen));
        if (plot.status === 'growing') rows.push(row('fert-open', 'Bón phân', undefined, () => open({ type: 'apply-fertilizer', plotIndex: plot.index }), b.canFertilize ? undefined : 'Đã có phân bón'));
        if (plot.pest) rows.push(row('pest', 'Trị sâu', undefined, b.treat, b.canTreat ? undefined : 'Chưa thể trị sâu'));
        if (plot.status === 'ready') rows.push(row('harvest', 'Thu hoạch', undefined, b.harvest));
        if (plot.status === 'growing' || plot.status === 'ready') rows.push(row('clear-plot', 'Xúc đất dọn cây', 'Cần xác nhận trước khi dọn', b.clearPlot));
      }
      sheet = make(`plot-${plot.index}`, `Ô đất ${plot.index + 1}`, rows);
    }
  } else if (local?.kind === 'animal' && b.selectedAnimal) {
    const animal = s.animals.find(item => item.id === b.selectedAnimal);
    if (animal) sheet = make(`animal-${animal.id}`, animal.title,
      [row('animal-state', animal.dead ? 'Đã chết' : animal.weak ? 'Đang thiếu thức ăn' : 'Đang nuôi', animal.dead ? 'Cần dọn để giải phóng chỗ.' : `Trứng tiếp theo: ${animal.timer}\nTuổi thọ còn: ${animal.lifeRemaining}`),
        row('animal-dismiss', animal.dead ? 'Dọn vật nuôi' : 'Đuổi vật nuôi', 'Cần xác nhận', b.dismiss)], undefined,
      [action('herd-list', 'Danh sách vật nuôi', openPen)]);
  } else if (local?.kind === 'pen') {
    sheet = make('pen', 'Đàn vật nuôi', s.animals.map(animal => row(`select-${animal.id}`, animal.title, animal.timer, () => selectAnimal(animal.id))),
      `${s.animals.length}/${s.capacity} chỗ · ${s.eggs} trứng trong kho`,
      [action('enter-open', 'Thả vật nuôi', () => open({ type: 'enter-pen' }), undefined, true), action('trough-open', 'Máng ăn', () => open({ type: 'trough' }))]);
  }
  return { sheet, selectPlot, selectAnimal, openPen, open, close };
}
