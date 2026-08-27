import { adjustIntegerQuantity } from "./quantityInput";

function assertEqual(actual: number, expected: number, message: string): void {
  if (!Object.is(actual, expected)) {
    throw new Error(`FAILED: ${message}; expected ${expected}, got ${actual}`);
  }
  console.log(`✓ ${message}`);
}

console.log("=== INTEGER QUANTITY INPUT TESTS ===\n");

assertEqual(adjustIntegerQuantity(7, 5, 1, 100), 12, "+5 is relative");
assertEqual(adjustIntegerQuantity(7, 10, 1, 100), 17, "+10 is relative");
assertEqual(adjustIntegerQuantity(17, -5, 1, 100), 12, "-5 is relative");
assertEqual(adjustIntegerQuantity(12, -10, 1, 100), 2, "-10 is relative");
assertEqual(adjustIntegerQuantity(3, -10, 1, 100), 1, "minus clamps at the minimum");
assertEqual(adjustIntegerQuantity(97, 10, 1, 100), 100, "plus clamps at the maximum");
assertEqual(adjustIntegerQuantity(7, 5, 1, 10), 10, "an oversized plus remains useful before max");

let rapidQuantity = 1;
for (let index = 0; index < 4; index += 1) {
  rapidQuantity = adjustIntegerQuantity(rapidQuantity, 5, 1, 100);
}
assertEqual(rapidQuantity, 21, "rapid +5 taps accumulate without stale state");
assertEqual(adjustIntegerQuantity(Number.NaN, 5, 1, 20), 6, "invalid draft falls back safely");
assertEqual(adjustIntegerQuantity(7.9, 5.8, 1, 20), 12, "quantity and delta stay integer-only");

console.log("\nALL INTEGER QUANTITY INPUT TESTS PASSED");
