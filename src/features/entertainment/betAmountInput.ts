import { adjustIntegerQuantity } from "../../utils/quantityInput";

function toNonNegativeInteger(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.trunc(value));
}

export function getInitialBetInput(
  currentBet: number,
  previousRoundBet: number,
  maxBet: number,
): string {
  const preferredBet = currentBet > 0 ? currentBet : previousRoundBet;
  const clampedBet = Math.min(
    toNonNegativeInteger(preferredBet),
    toNonNegativeInteger(maxBet),
  );
  return clampedBet > 0 ? String(clampedBet) : "";
}

export function adjustBetInput(
  inputValue: string,
  delta: number,
  maxBet: number,
): string {
  const parsedValue = /^\d+$/u.test(inputValue.trim())
    ? Number.parseInt(inputValue, 10)
    : 0;
  const adjustedValue = adjustIntegerQuantity(
    toNonNegativeInteger(parsedValue),
    delta,
    0,
    toNonNegativeInteger(maxBet),
  );
  return adjustedValue > 0 ? String(adjustedValue) : "";
}

export function clampBetInput(inputValue: string, maxBet: number): string {
  return adjustBetInput(inputValue, 0, maxBet);
}
