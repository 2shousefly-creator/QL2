import { readFileSync } from "node:fs";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`FAILED: ${message}`);
  console.log(`✓ ${message}`);
}

function source(relativeUrl: string): string {
  return readFileSync(new URL(relativeUrl, import.meta.url), "utf8");
}

console.log("=== QUICK QUANTITY COMPONENT CONTRACT TESTS ===\n");

const betControl = source("../features/entertainment/BetAmountControl.tsx");
assert(
  ["Giảm 10 Vàng", "Giảm 5 Vàng", "Tăng 5 Vàng", "Tăng 10 Vàng"].every((label) => betControl.includes(label)),
  "BetAmountControl exposes the canonical -10/-5/+5/+10 accessible buttons",
);
assert(!betControl.includes("20 Vàng"), "BetAmountControl no longer exposes ±20 shortcuts");

for (const [relativeUrl, quickHandler, pristineRef] of [
  ["../features/tang_gia/components/FarmStoreModal.tsx", "handleBuyQuantityQuickAdjust", "buyQuantityPristineRef"],
  ["../features/tang_gia/components/FeedModal.tsx", "handleQuantityQuickAdjust", "quantityPristineRef"],
  ["../features/tang_gia/components/KhoModal.tsx", "handleSellQuantityQuickAdjust", "sellQuantityPristineRef"],
]) {
  const componentSource = source(relativeUrl);
  assert(componentSource.includes("[-10, -5, 5, 10]"), `${relativeUrl} renders all canonical deltas`);
  assert(componentSource.includes(`const ${quickHandler}`), `${relativeUrl} handles quick deltas explicitly`);
  assert(componentSource.includes(`${pristineRef}.current = false`), `${relativeUrl} records the first user adjustment`);
  assert(
    componentSource.includes("wasPristine && delta > 0 ? 0 : current"),
    `${relativeUrl} ignores the untouched starter value for the first positive quick delta`,
  );
  assert(componentSource.includes("Tối đa ("), `${relativeUrl} retains an explicit absolute maximum shortcut`);
  assert(!componentSource.includes("[1, 5, 10].map"), `${relativeUrl} removes the old absolute 1/5/10 presets`);
  assert(!componentSource.includes("[1, 2, 5].map"), `${relativeUrl} removes the old absolute 1/2/5 presets`);
}

for (const relativeUrl of [
  "../features/entertainment/big_small/BigSmallBetModal.tsx",
  "../features/entertainment/bau_cua/BauCuaBetModal.tsx",
]) {
  const componentSource = source(relativeUrl);
  assert(
    componentSource.includes("setInputValue((currentValue) => adjustBetInput(currentValue, delta, maxBet))"),
    `${relativeUrl} uses a functional controlled-input update`,
  );
  assert(
    componentSource.includes("setInputValue((currentValue) => clampBetInput(currentValue, maxBet))"),
    `${relativeUrl} clamps max changes without resetting the local draft`,
  );
}

console.log("\nALL QUICK QUANTITY COMPONENT CONTRACT TESTS PASSED");
