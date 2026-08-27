import assert from "node:assert";
import { COUPON_CATALOG, redeemCoupon, sanitizeCouponState, isCouponRedeemed } from "./couponEngine";
import { createInitialGameState } from "../../storage/GameRepository";
import { getSharedGold } from "../../features/entertainment/chien_tuyen/sharedGold";

console.log("=== Testing Coupon Engine ===");

// 1. Check Catalog Definitions
assert(COUPON_CATALOG["QL2026"], "QL2026 must exist");
assert.strictEqual(COUPON_CATALOG["QL2026"].rewardGold, 2000);

assert(COUPON_CATALOG["GOLD3K"], "GOLD3K must exist");
assert.strictEqual(COUPON_CATALOG["GOLD3K"].rewardGold, 3000);

// 2. Test Redeeming GOLD3K
const state = createInitialGameState();
const initialGold = getSharedGold(state);

const res1 = redeemCoupon(state, "gold3k");
assert.strictEqual(res1.success, true);
if (res1.success) {
  assert.strictEqual(res1.rewardGold, 3000);
  assert.strictEqual(res1.code, "GOLD3K");
  assert(res1.message.includes("3.000 Vàng"));
}

const currentGold = getSharedGold(state);
assert.strictEqual(currentGold, initialGold + 3000, "Should credit 3000 Gold");
assert.strictEqual(isCouponRedeemed(state, "GOLD3K"), true);

// 3. Test 1-time usage constraint
const res2 = redeemCoupon(state, "GOLD3K");
assert.strictEqual(res2.success, false);
if (!res2.success) {
  assert.strictEqual(res2.reason, "already_used");
}

// 4. Test Invalid & Empty Codes
const res3 = redeemCoupon(state, "INVALID_CODE_999");
assert.strictEqual(res3.success, false);
if (!res3.success) {
  assert.strictEqual(res3.reason, "invalid_code");
}

const res4 = redeemCoupon(state, "   ");
assert.strictEqual(res4.success, false);
if (!res4.success) {
  assert.strictEqual(res4.reason, "empty_input");
}

// 5. Test QL2026 redemption
const res5 = redeemCoupon(state, "QL2026");
assert.strictEqual(res5.success, true);
if (res5.success) {
  assert.strictEqual(res5.rewardGold, 2000);
}
assert.strictEqual(getSharedGold(state), initialGold + 3000 + 2000);

// 6. Test sanitizeCouponState
const sanitized = sanitizeCouponState({
  redeemedCodes: ["gold3k", "QL2026", "gold3k", ""],
  redeemedAt: { gold3k: 12345, ql2026: "67890" },
});
assert.deepStrictEqual(sanitized.redeemedCodes, ["GOLD3K", "QL2026"]);
assert.strictEqual(sanitized.redeemedAt["GOLD3K"], 12345);
assert.strictEqual(sanitized.redeemedAt["QL2026"], 67890);

console.log(" All coupon engine tests passed successfully!");
