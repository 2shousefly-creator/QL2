import {
  CROP_NAME_FONT_SIZE_PX,
  FARM_VISUAL_LAYERS,
  HARVEST_CROP_QUALITY_COLORS,
  createSoilFurrowPaths,
  getAnimalVisualLayer,
  getCropVisualScale,
  getCropVisualStage,
  getDisplayedNestEggCount,
  getFarmVisualTheme,
} from "./farmVisualTheme";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAILED: ${message}`);
  console.log(`✓ ${message}`);
}

console.log("=== FARM VISUAL THEME TESTS ===\n");

assert(getCropVisualStage(0) === "seed", "0% growth renders as seed");
assert(getCropVisualStage(0.1999) === "seed", "under 20% growth renders as seed");
assert(getCropVisualStage(0.2) === "sprout", "20% growth renders as sprout");
assert(getCropVisualStage(0.4999) === "sprout", "under 50% growth renders as sprout");
assert(getCropVisualStage(0.5) === "young", "50% growth renders as a young plant");
assert(getCropVisualStage(0.7999) === "young", "under 80% growth renders as a young plant");
assert(getCropVisualStage(0.8) === "mature", "80% growth renders as a mature plant");
assert(getCropVisualStage(1) === "mature", "ready crop renders as mature plant");
assert(Math.abs(getCropVisualScale(0.5) - 0.95) < 1e-9, "young sprite uses restrained runtime scaling");
assert(Math.abs(getCropVisualScale(0.75) - 0.975) < 1e-9, "late young sprite grows gently");
assert(getCropVisualScale(1) === 1, "mature sprite reaches its authored size at harvest");
assert(
  CROP_NAME_FONT_SIZE_PX === 10,
  "crop name keeps one fixed 10px size throughout growth and harvest",
);

const firstPlotFurrows = createSoilFurrowPaths(101);
const repeatedFirstPlotFurrows = createSoilFurrowPaths(101);
const secondPlotFurrows = createSoilFurrowPaths(202);
assert(firstPlotFurrows.length === 5, "soil renders five irregular furrows");
assert(
  JSON.stringify(firstPlotFurrows) === JSON.stringify(repeatedFirstPlotFurrows),
  "soil furrows remain visually stable between renders",
);
assert(
  JSON.stringify(firstPlotFurrows) !== JSON.stringify(secondPlotFurrows),
  "different plots receive different furrow shapes",
);
assert(
  firstPlotFurrows.some((path) => path.includes(" Q ") && path.includes(" L ")),
  "furrows mix soft waves with angular kinks",
);
assert(getDisplayedNestEggCount(0) === 0, "empty inventory renders no nest egg");
assert(getDisplayedNestEggCount(2) === 2, "nest renders the available eggs up to three");
assert(getDisplayedNestEggCount(12) === 3, "nest display caps at three eggs");
assert(
  FARM_VISUAL_LAYERS.eggNest < getAnimalVisualLayer(0),
  "egg nest always stays below animals",
);
assert(
  getAnimalVisualLayer(100) < FARM_VISUAL_LAYERS.frontFence,
  "animals always stay below the front fence",
);
assert(HARVEST_CROP_QUALITY_COLORS.thuong === "#f8fafc", "Thường crop name is white");
assert(HARVEST_CROP_QUALITY_COLORS.tot === "#38bdf8", "Tốt crop name is blue");
assert(HARVEST_CROP_QUALITY_COLORS.hiem === "#c084fc", "Hiếm crop name is purple");
assert(HARVEST_CROP_QUALITY_COLORS.hoan_my === "#fb923c", "Hoàn Mỹ crop name is orange");

const sunny = getFarmVisualTheme({ phase: "day", weather: "sunny" });
const rain = getFarmVisualTheme({ phase: "day", weather: "rain" });
const cool = getFarmVisualTheme({ phase: "day", weather: "cool" });
const nightRain = getFarmVisualTheme({ phase: "night", weather: "rain" });

assert(sunny.plotBackground !== rain.plotBackground, "rain changes plot color");
assert(rain.plotBackground !== cool.plotBackground, "cool weather has its own plot color");
assert(sunny.penBackground !== rain.penBackground, "rain changes livestock pen color");
assert(rain.sceneBackground !== nightRain.sceneBackground, "night rain has a distinct scene palette");

console.log("\nALL FARM VISUAL THEME TESTS PASSED");
