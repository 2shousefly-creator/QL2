import { readFileSync } from "node:fs";
import {
  getFarmHarvestAllActionMode,
  getFarmWaterActionLabel,
  getFarmWaterActionMode,
} from "./farmPresentation";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`FAILED: ${message}`);
  console.log(`✓ ${message}`);
}

console.log("=== FARM UI POLISH CONTRACT TESTS ===\n");

const rewardSource = readFileSync(new URL("./components/RewardSummaryModal.tsx", import.meta.url), "utf8");
assert(rewardSource.includes("borderColor: config.color"), "sell-summary row border consumes the semantic quality color");
assert(rewardSource.includes("backgroundColor: config.surfaceColor"), "sell-summary row uses the semantic quality tint");
assert(rewardSource.includes("boxShadow: `0 0 12px ${config.glowColor}`"), "sell-summary row uses the semantic quality glow");

const livestockSource = readFileSync(new URL("./components/LivestockPen2D.tsx", import.meta.url), "utf8");
assert(livestockSource.includes("Compact, unboxed animal label"), "animal overlay uses the compact unboxed label path");
assert(livestockSource.includes("text-[10px] font-black"), "animal name stays at a compact mobile size");
assert(livestockSource.includes("text-[9px] font-extrabold"), "animal status and timer stay subordinate to the name");
assert(!livestockSource.includes("bg-slate-950/90 text-amber-300 font-black text-[9px]"), "animal timer no longer has a boxed background");
assert(!livestockSource.includes("bg-slate-950/80 text-amber-100 border-slate-800/80"), "animal name no longer has a bordered badge");
assert(livestockSource.includes('data-animal-life-bar="true"'), "living animal overlay exposes the lifespan bar");
assert(livestockSource.includes('data-animal-egg-countdown="true"'), "living animal overlay exposes the canonical egg countdown row");
assert(livestockSource.includes('feedBuffActive && <span aria-label="Đang tăng tốc">⚡</span>'), "lightning appears only for a real active egg-speed cycle");
assert(livestockSource.includes('<span aria-hidden="true">🥚</span>'), "living animal countdown always uses the egg icon");
assert(livestockSource.includes('text-red-400">Chết</span>'), "dead animal overlay renders the single red Chết status");
assert(!livestockSource.includes("animalStatus"), "animal overlay no longer renders generic numbered or hungry status text");
assert(livestockSource.includes('data-animal-facing-wrapper="true"'), "facing owns an isolated instant-flip wrapper");
assert(livestockSource.includes('className="flex items-center justify-center transition-none"'), "facing wrapper has no tween");
assert(livestockSource.includes('data-anchor="head"'), "life bar anchors to the computed visual head");
assert(livestockSource.includes('data-anchor="feet"'), "name and timer anchor to the computed visual feet");
assert(livestockSource.includes('grid-cols-[1fr_auto_1fr]'), "timer value uses symmetric columns so leading icons cannot shift its center");
assert(livestockSource.includes('data-animal-timer-value="true"'), "timer number exposes its independently centered value node");

const troughSource = readFileSync(new URL("./components/TroughInfoModal.tsx", import.meta.url), "utf8");
assert(troughSource.includes("getLivingAnimalCount(penAnimals)"), "trough calculations use only living livestock");
assert(troughSource.includes("NGUY HIỂM KHI HẾT THỨC ĂN"), "trough help explains the fixed starvation danger window");
assert(troughSource.includes('isDangerMode ? "Nguy Hiểm Còn Lại"'), "danger progress replaces the normal trough-status label");
assert(troughSource.includes('isDangerMode ? "Thời gian nguy hiểm còn lại:"'), "danger countdown uses an unambiguous time label");
assert(troughSource.includes("TUỔI THỌ VẬT NUÔI"), "trough help explains livestock lifespan and cleanup");

const screenSource = readFileSync(new URL("./TangGiaScreen.tsx", import.meta.url), "utf8");
assert(screenSource.includes('title: dead ? "Dọn Vật Nuôi" : "Đuổi Vật Nuôi"'), "dead livestock uses the dedicated cleanup confirmation");
assert(screenSource.includes('confirmLabel: dead ? "Dọn" : "Đuổi Thú"'), "dead livestock toolbar action is labeled Dọn");
assert(screenSource.includes("Hành động này không hoàn Trứng, Vàng hoặc XP"), "cleanup explicitly grants no refund or reward");
assert(
  screenSource.includes("const pendingOfflineDeaths = consumePendingAnimalDeathNotification(") &&
    screenSource.includes("getAnimalDeathNotificationCopy(pendingOfflineDeaths, true)"),
  "returning from a backgrounded tab consumes and displays one grouped offline death notice",
);
assert(
  screenSource.includes('if (selectedAnimalId !== null) {') &&
    screenSource.includes('setContextMode("none")') &&
    screenSource.includes("setSelectedAnimalId(null)"),
  "blank farm or pen taps clear the selected animal toolbar",
);
assert(!screenSource.includes("Tổng Kết Thu Hoạch"), "single and batch harvest never open a summary popup");
assert(screenSource.includes("plotRewards: ["), "single harvest presents the exact engine reward at its plot");
assert(screenSource.includes("plotRewards: res.details.map"), "Harvest All presents each canonical per-plot engine reward");
assert(screenSource.includes('data-harvest-action="all"'), "Harvest All replaces the clear-plot slot at two or more ready crops");
assert(screenSource.includes('data-water-action={waterActionMode}'), "watering button exposes its disabled, single, or all mode");
assert(screenSource.includes("<PlotDetailPanel"), "selected garden plots render the compact detail panel");
assert(screenSource.includes("setNow(Date.now())"), "the one-second ticker updates presentation time");
assert(!screenSource.includes("handleHarvestSinglePlotForIndex(index);"), "tapping a Ready plot never auto-harvests it");

const plotDetailSource = readFileSync(new URL("./components/PlotDetailPanel.tsx", import.meta.url), "utf8");
assert(plotDetailSource.includes("Tỷ lệ phẩm chất"), "growing details show a quality forecast without revealing the roll");
assert(plotDetailSource.includes("getCropHarvestPreview"), "Ready details use the canonical reward preview");

const canvasSource = readFileSync(new URL("./components/TangGiaCanvas2D.tsx", import.meta.url), "utf8");
assert(canvasSource.includes('data-floating-harvest-reward="true"'), "plot canvas renders the non-blocking floating Gold and XP reward");
assert(canvasSource.includes("HARVEST_CROP_QUALITY_COLORS"), "floating reward consumes the engine quality semantic color map");
assert(canvasSource.includes('data-harvest-glow="true"'), "Harvest All keeps a one-second per-crop glow presentation");

const xpBarSource = readFileSync(new URL("./components/FarmXpProgressBar.tsx", import.meta.url), "utf8");
assert(xpBarSource.includes("getRequiredXpTicksForTransition"), "farm XP bar reuses the global rank XP curve helper");
assert(xpBarSource.includes('data-farm-xp-fill="yellow"'), "farm XP bar always uses the requested yellow fill");
assert(screenSource.includes("<FarmXpProgressBar gameState={gameState} />"), "farm XP bar reads the live global GameState after each transaction");

const storeSource = readFileSync(new URL("./components/FarmStoreModal.tsx", import.meta.url), "utf8");
assert(storeSource.includes('data-animal-store-stats="compact-two-column"'), "animal store uses a compact two-column stat grid");
assert(storeSource.includes('data-animal-lifespan="hours"'), "each animal store card displays its catalog lifespan in hours");

assert(getFarmWaterActionMode(0) === "disabled", "zero eligible crops dims Tưới Nước");
assert(getFarmWaterActionMode(1) === "single", "one eligible crop uses single Tưới Nước");
assert(getFarmWaterActionMode(2) === "all", "two eligible crops use Tưới Tất Cả");
assert(getFarmWaterActionLabel("all") === "Tưới Tất Cả", "Water All label is canonical");
assert(getFarmHarvestAllActionMode(1) === "clear_plot", "Harvest All stays hidden below two ready crops");
assert(getFarmHarvestAllActionMode(2) === "harvest_all", "Harvest All replaces Xúc Đất at two ready crops");

console.log("\nALL FARM UI POLISH CONTRACT TESTS PASSED");
