import { adjustBetInput, clampBetInput, getInitialBetInput } from "./betAmountInput";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAILED: ${message}`);
  console.log(`✓ ${message}`);
}

console.log("=== BET AMOUNT INPUT TESTS ===\n");

assert(
  getInitialBetInput(0, 35, 100) === "35",
  "a new bet is prefilled from the previous round",
);
assert(
  getInitialBetInput(15, 35, 100) === "15",
  "an existing draft bet takes priority while editing",
);
assert(
  getInitialBetInput(0, 35, 20) === "20",
  "a remembered bet is clamped to the available maximum",
);
assert(adjustBetInput("10", -5, 100) === "5", "-5 decreases the bet");
assert(adjustBetInput("7", -10, 100) === "", "-10 never creates a negative bet");
assert(adjustBetInput("10", 5, 100) === "15", "+5 increases the bet");
assert(adjustBetInput("95", 10, 100) === "100", "+10 stops at the maximum bet");
assert(adjustBetInput("", 5, 100) === "5", "+5 starts from an empty input");
assert(clampBetInput("15", 10) === "10", "a lower maximum only clamps the current draft");
assert(clampBetInput("7", 100) === "7", "a higher maximum keeps the current draft");

let rapidBet = "7";
for (const delta of [5, 5, 5]) rapidBet = adjustBetInput(rapidBet, delta, 100);
assert(rapidBet === "22", "rapid functional adjustments accumulate every tap");

console.log("\nALL BET AMOUNT INPUT TESTS PASSED");
