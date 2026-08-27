import { BauCuaBets, BauCuaRound, BauCuaSymbol, BauCuaWinType } from "../types";

export const BAU_CUA_SYMBOLS: readonly BauCuaSymbol[] = [
  "bau",
  "cua",
  "tom",
  "ca",
  "ga",
  "nai",
] as const;

/**
 * Traditional 2 rows x 3 columns Bau Cua board layout:
 * Row 1 (Top): Nai, Bầu, Gà
 * Row 2 (Bottom): Tôm, Cua, Cá
 */
export const BAU_CUA_BOARD_LAYOUT: readonly BauCuaSymbol[] = [
  "nai",
  "bau",
  "ga",
  "tom",
  "cua",
  "ca",
] as const;

export type BauCuaSymbolInfo = {
  id: BauCuaSymbol;
  name: string;
  emoji: string;
  colorName: string;
  bgGradient: string;
  borderColor: string;
  activeBorderColor: string;
  glowColor: string;
  textColor: string;
};

// Uniform modern blue (xanh lam) theme for all 6 Bau Cua doors
const UNIFORM_BLUE_THEME = {
  colorName: "Xanh lam",
  bgGradient: "from-blue-950/60 via-slate-900/90 to-slate-950",
  borderColor: "border-blue-500/30 hover:border-blue-400/60",
  activeBorderColor:
    "border-blue-400 ring-2 ring-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.25)]",
  glowColor: "rgba(59, 130, 246, 0.4)",
  textColor: "text-blue-400",
};

export const BAU_CUA_SYMBOL_INFO: Record<BauCuaSymbol, BauCuaSymbolInfo> = {
  bau: {
    id: "bau",
    name: "Bầu",
    emoji: "🍐",
    ...UNIFORM_BLUE_THEME,
  },
  cua: {
    id: "cua",
    name: "Cua",
    emoji: "🦀",
    ...UNIFORM_BLUE_THEME,
  },
  tom: {
    id: "tom",
    name: "Tôm",
    emoji: "🦐",
    ...UNIFORM_BLUE_THEME,
  },
  ca: {
    id: "ca",
    name: "Cá",
    emoji: "🐟",
    ...UNIFORM_BLUE_THEME,
  },
  ga: {
    id: "ga",
    name: "Gà",
    emoji: "🐓",
    ...UNIFORM_BLUE_THEME,
  },
  nai: {
    id: "nai",
    name: "Nai",
    emoji: "🦌",
    ...UNIFORM_BLUE_THEME,
  },
};

/**
 * Creates an initial empty betting state (0 Gold on all 6 doors).
 */
export function createEmptyBets(): BauCuaBets {
  return {
    bau: 0,
    cua: 0,
    tom: 0,
    ca: 0,
    ga: 0,
    nai: 0,
  };
}

/**
 * Calculates total draft bets currently placed on the 6 doors.
 */
export function calculateTotalBets(bets: BauCuaBets): number {
  return (
    (bets.bau || 0) +
    (bets.cua || 0) +
    (bets.tom || 0) +
    (bets.ca || 0) +
    (bets.ga || 0) +
    (bets.nai || 0)
  );
}

/**
 * Calculates available Gold remaining for additional betting.
 */
export function calculateAvailableGold(
  currentGold: number,
  bets: BauCuaBets
): number {
  const total = calculateTotalBets(bets);
  return Math.max(0, currentGold - total);
}

/**
 * Calculates the maximum allowable bet for a specific door.
 * - If door has 0 bet: maxBet = currentGold - totalBets
 * - If door has an existing bet: maxBet = currentGold - totalBets + currentDoorBet
 */
export function getMaxBetForDoor(
  currentGold: number,
  bets: BauCuaBets,
  door: BauCuaSymbol
): number {
  const totalBets = calculateTotalBets(bets);
  const currentDoorBet = bets[door] || 0;
  return Math.max(0, currentGold - totalBets + currentDoorBet);
}

export type BetValidationResult = {
  valid: boolean;
  error?: string;
  sanitizedAmount?: number;
};

/**
 * Validates a bet input strictly:
 * - Integer only
 * - min >= 1
 * - no decimals, no negatives, no empty/NaN
 * - cannot exceed maxBet
 */
export function validateBet(
  input: string | number,
  maxBet: number
): BetValidationResult {
  const trimmed = typeof input === "string" ? input.trim() : String(input);
  if (!trimmed) {
    return { valid: false, error: "Vui lòng nhập số Vàng cược." };
  }

  // Reject decimal points, commas, scientific notation
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
 * Generates unbiased roll for 3 dice using crypto.getRandomValues().
 * No odds manipulation based on gold, bet, history, rank or pity.
 */
export function rollBauCuaDice(): [BauCuaSymbol, BauCuaSymbol, BauCuaSymbol] {
  const randomBuffer = new Uint32Array(3);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(randomBuffer);
  } else {
    // Fallback for non-crypto environments (e.g. basic unit tests)
    randomBuffer[0] = Math.floor(Math.random() * 0xffffffff);
    randomBuffer[1] = Math.floor(Math.random() * 0xffffffff);
    randomBuffer[2] = Math.floor(Math.random() * 0xffffffff);
  }

  const dice1 = BAU_CUA_SYMBOLS[randomBuffer[0] % 6];
  const dice2 = BAU_CUA_SYMBOLS[randomBuffer[1] % 6];
  const dice3 = BAU_CUA_SYMBOLS[randomBuffer[2] % 6];

  return [dice1, dice2, dice3];
}

/**
 * Counts the occurrences of each symbol in the 3-dice result.
 */
export function countOccurrences(
  result: [BauCuaSymbol, BauCuaSymbol, BauCuaSymbol]
): Record<BauCuaSymbol, number> {
  const counts: Record<BauCuaSymbol, number> = {
    bau: 0,
    cua: 0,
    tom: 0,
    ca: 0,
    ga: 0,
    nai: 0,
  };

  for (const sym of result) {
    counts[sym] = (counts[sym] || 0) + 1;
  }

  return counts;
}

/**
 * Calculates the payout return for a single door.
 * Standard Bau Cua Rules:
 * - 0 occurrences: return = 0, net = -bet
 * - 1 occurrence:  return = 2 * bet, net = +1 * bet
 * - 2 occurrences: return = 3 * bet, net = +2 * bet
 * - 3 occurrences: return = 4 * bet, net = +3 * bet
 */
export function calculateDoorReturn(doorBet: number, occurrences: number): number {
  if (doorBet <= 0 || occurrences <= 0) return 0;
  return doorBet * (occurrences + 1);
}

/**
 * Settles a full Bau Cua round deterministically.
 * @param currentGold Player's real gold before this round
 * @param bets The draft bets placed across the 6 doors
 * @param providedResult Optional pre-rolled dice result (for replaying or testing)
 */
export function settleBauCuaRound(
  currentGold: number,
  bets: BauCuaBets,
  providedResult?: [BauCuaSymbol, BauCuaSymbol, BauCuaSymbol]
): {
  round: BauCuaRound;
  postRoundGold: number;
} {
  const totalBet = calculateTotalBets(bets);
  if (totalBet <= 0) {
    throw new Error("Không thể lắc khi chưa đặt cược!");
  }
  if (totalBet > currentGold) {
    throw new Error("Tổng tiền cược vượt quá số Vàng hiện có!");
  }

  const result = providedResult || rollBauCuaDice();
  const occurrences = countOccurrences(result);

  let totalReturn = 0;
  for (const sym of BAU_CUA_SYMBOLS) {
    const bet = bets[sym] || 0;
    if (bet > 0) {
      const doorReturn = calculateDoorReturn(bet, occurrences[sym] || 0);
      totalReturn += doorReturn;
    }
  }

  const net = totalReturn - totalBet;
  const postRoundGold = Math.max(0, currentGold - totalBet + totalReturn);

  const round: BauCuaRound = {
    id: `bc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    bets: { ...bets },
    result,
    totalBet,
    totalReturn,
    net,
    preGold: currentGold,
    postGold: postRoundGold,
  };

  return { round, postRoundGold };
}

/**
 * Classifies the outcome category of a settled round:
 * - 'perfect_win': Win where 3 dice matched player's bets (or 3 betted doors hit)
 * - 'big_win': Win where 2 dice/doors matched with profit
 * - 'regular_win': Win where 1 door/die matched with profit (net > 0)
 * - 'draw': Break-even round (net === 0)
 * - 'loss': Lost gold (net < 0) or 0 hits
 */
export function getBauCuaWinType(round: BauCuaRound): BauCuaWinType {
  if (round.net < 0) return "loss";
  if (round.net === 0) return "draw";

  const occurrences = countOccurrences(round.result);
  let matchedDoorsCount = 0;
  let totalMatchedDice = 0;

  for (const sym of BAU_CUA_SYMBOLS) {
    const bet = round.bets[sym] || 0;
    if (bet > 0) {
      const hit = occurrences[sym] || 0;
      if (hit > 0) {
        matchedDoorsCount += 1;
        totalMatchedDice += hit;
      }
    }
  }

  // If 3 dice hit player's bets or 3 distinct doors hit
  if (totalMatchedDice >= 3 || matchedDoorsCount >= 3) return "perfect_win";
  // If 2 doors hit or 2 dice matched
  if (matchedDoorsCount >= 2 || totalMatchedDice >= 2) return "big_win";
  return "regular_win";
}

