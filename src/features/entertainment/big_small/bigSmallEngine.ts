import { BigSmallBetId, BigSmallBets, BigSmallRound, BigSmallWinType } from "../types";

export const BIG_SMALL_BET_IDS: readonly BigSmallBetId[] = [
  "small",
  "big",
] as const;

export type BigSmallDoorMeta = {
  id: BigSmallBetId;
  name: string;
  shortName: string;
  category: "main";
  scoreRange: string;
  payoutText: string;
  profitRatio: number; // e.g. 1
  returnMultiplier: number; // profitRatio + 1 = 2
  description: string;
};

export const BIG_SMALL_DOOR_INFO: Record<BigSmallBetId, BigSmallDoorMeta> = {
  small: {
    id: "small",
    name: "SỐ NHỎ",
    shortName: "Số Nhỏ",
    category: "main",
    scoreRange: "3–10",
    payoutText: "1 ăn 1",
    profitRatio: 1,
    returnMultiplier: 2,
    description: "Tổng 3 viên xúc xắc từ 3 đến 10 điểm.",
  },
  big: {
    id: "big",
    name: "SỐ LỚN",
    shortName: "Số Lớn",
    category: "main",
    scoreRange: "11–18",
    payoutText: "1 ăn 1",
    profitRatio: 1,
    returnMultiplier: 2,
    description: "Tổng 3 viên xúc xắc từ 11 đến 18 điểm.",
  },
};

/**
 * Creates an empty betting record initialized to 0 for both doors (small & big).
 */
export function createEmptyBigSmallBets(): BigSmallBets {
  return {
    small: 0,
    big: 0,
  };
}

/**
 * Calculates the sum of all draft bets across the doors.
 */
export function calculateTotalBigSmallBets(bets: BigSmallBets): number {
  let sum = 0;
  for (const id of BIG_SMALL_BET_IDS) {
    sum += bets[id] || 0;
  }
  return sum;
}

/**
 * Calculates remaining available gold for new bets.
 */
export function calculateAvailableGold(
  currentGold: number,
  bets: BigSmallBets
): number {
  const total = calculateTotalBigSmallBets(bets);
  return Math.max(0, currentGold - total);
}

/**
 * Calculates max bet allowable on a specific door:
 * - Unbetted door: currentGold - totalBets
 * - Already betted door: currentGold - totalBets + currentDoorBet
 */
export function getMaxBetForBigSmallDoor(
  currentGold: number,
  bets: BigSmallBets,
  door: BigSmallBetId
): number {
  const total = calculateTotalBigSmallBets(bets);
  const currentDoorBet = bets[door] || 0;
  return Math.max(0, currentGold - total + currentDoorBet);
}

export type BetValidationResult = {
  valid: boolean;
  error?: string;
  sanitizedAmount?: number;
};

/**
 * Strict bet input validator.
 */
export function validateBet(
  input: string | number,
  maxBet: number
): BetValidationResult {
  const trimmed = typeof input === "string" ? input.trim() : String(input);
  if (!trimmed) {
    return { valid: false, error: "Vui lòng nhập số Vàng cược." };
  }

  // Reject decimals, commas, exponents, signs
  if (!/^\d+$/.test(trimmed)) {
    return { valid: false, error: "Vui lòng nhập số nguyên hợp lệ." };
  }

  const num = parseInt(trimmed, 10);
  if (isNaN(num) || num < 1) {
    return { valid: false, error: "Tối thiểu 1 Vàng." };
  }

  if (num > maxBet) {
    return {
      valid: false,
      error: `Bạn chỉ còn ${maxBet.toLocaleString("vi-VN")} Vàng khả dụng.`,
    };
  }

  return { valid: true, sanitizedAmount: num };
}

/**
 * Generates unbiased 3-dice roll using crypto.getRandomValues() (values 1..6).
 */
export function rollThreeDice(): [number, number, number] {
  const randomBuffer = new Uint32Array(3);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(randomBuffer);
  } else {
    randomBuffer[0] = Math.floor(Math.random() * 0xffffffff);
    randomBuffer[1] = Math.floor(Math.random() * 0xffffffff);
    randomBuffer[2] = Math.floor(Math.random() * 0xffffffff);
  }

  const d1 = (randomBuffer[0] % 6) + 1;
  const d2 = (randomBuffer[1] % 6) + 1;
  const d3 = (randomBuffer[2] % 6) + 1;

  return [d1, d2, d3];
}

/**
 * Calculates sum total of 3 dice.
 */
export function getDiceTotal(dice: [number, number, number]): number {
  return dice[0] + dice[1] + dice[2];
}

/**
 * Checks if the 3 dice form any triple (111, 222, 333, 444, 555, 666).
 */
export function isTripleResult(dice: [number, number, number]): boolean {
  return dice[0] === dice[1] && dice[1] === dice[2];
}

/**
 * Returns the value of the triple (1..6) if result is a triple, else null.
 */
export function getTripleValue(dice: [number, number, number]): number | null {
  if (isTripleResult(dice)) {
    return dice[0];
  }
  return null;
}

/**
 * SỐ NHỎ win check:
 * Total score between 3 and 10.
 */
export function isSmallWin(dice: [number, number, number]): boolean {
  const total = getDiceTotal(dice);
  return total >= 3 && total <= 10;
}

/**
 * SỐ LỚN win check:
 * Total score between 11 and 18.
 */
export function isBigWin(dice: [number, number, number]): boolean {
  const total = getDiceTotal(dice);
  return total >= 11 && total <= 18;
}

/**
 * Checks if a particular bet door has won given the 3 dice.
 */
export function isBetWon(
  door: BigSmallBetId,
  dice: [number, number, number]
): boolean {
  switch (door) {
    case "small":
      return isSmallWin(dice);
    case "big":
      return isBigWin(dice);
  }
}

/**
 * Gets the profit ratio for a door.
 */
export function getBetProfitRatio(door: BigSmallBetId): number {
  return BIG_SMALL_DOOR_INFO[door].profitRatio;
}

/**
 * Calculates the total return (payout) for a single door:
 * If won: bet * (profitRatio + 1) = bet * 2
 * If lost: 0
 */
export function calculateDoorReturn(
  door: BigSmallBetId,
  betAmount: number,
  dice: [number, number, number]
): number {
  if (betAmount <= 0) return 0;
  if (!isBetWon(door, dice)) return 0;
  const multiplier = BIG_SMALL_DOOR_INFO[door].returnMultiplier;
  return betAmount * multiplier;
}

/**
 * Settles a full Big-Small round deterministically.
 */
export function settleBigSmallRound(
  currentGold: number,
  bets: BigSmallBets,
  providedDice?: [number, number, number]
): {
  round: BigSmallRound;
  postRoundGold: number;
} {
  const totalBet = calculateTotalBigSmallBets(bets);
  if (totalBet <= 0) {
    throw new Error("Không thể lắc khi chưa đặt cược!");
  }
  if (totalBet > currentGold) {
    throw new Error("Tổng tiền cược vượt quá số Vàng hiện có!");
  }

  const dice = providedDice || rollThreeDice();
  const total = getDiceTotal(dice);
  const isTriple = isTripleResult(dice);
  const tripleValue = getTripleValue(dice);
  const winningDoor: BigSmallBetId = total <= 10 ? "small" : "big";

  let totalReturn = 0;
  for (const id of BIG_SMALL_BET_IDS) {
    const bet = bets[id] || 0;
    if (bet > 0) {
      const doorReturn = calculateDoorReturn(id, bet, dice);
      totalReturn += doorReturn;
    }
  }

  const net = totalReturn - totalBet;
  const postRoundGold = Math.max(0, currentGold - totalBet + totalReturn);

  const round: BigSmallRound = {
    id: `bs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    bets: { ...bets },
    dice,
    total,
    isTriple,
    tripleValue,
    winningDoor,
    totalBet,
    totalReturn,
    net,
    preGold: currentGold,
    postGold: postRoundGold,
  };

  return { round, postRoundGold };
}

/**
 * Classifies outcome tier for animation, sound & modal styling.
 */
export function getBigSmallWinType(round: BigSmallRound): BigSmallWinType {
  if (round.net < 0) return "loss";
  if (round.net === 0) return "draw";
  if (round.net >= round.totalBet * 2) return "big_win";
  return "regular_win";
}
