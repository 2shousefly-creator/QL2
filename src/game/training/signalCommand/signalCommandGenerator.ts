import { TrainingDifficulty } from "../../types";
import { getSignalCommandConfig } from "./signalCommandConfig";
import {
  PairSignalToken,
  SignalCommandProtocol,
  SignalCommandRound,
  SignalCommandScenario,
  SignalCommandToken,
  SignalId,
  SingleSignalToken,
} from "./signalCommandTypes";

const ALL_SIGNAL_IDS: SignalId[] = [
  "circle",
  "triangle",
  "diamond",
  "square",
  "hexagon",
  "hollow_circle",
  "star_8",
  "chevron",
  "rounded_plus",
];

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash) || 123456789;
}

function createPrng(seedStr: string) {
  let a = hashSeed(seedStr);
  return function random() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSignalCommandScenario(
  difficulty: TrainingDifficulty,
  seed: string
): SignalCommandScenario {
  const config = getSignalCommandConfig(difficulty);
  const rng = createPrng(seed);

  const availableSignals = ALL_SIGNAL_IDS.slice(0, config.signalCount);

  const rounds: SignalCommandRound[] = [];

  if (difficulty === "easy") {
    // Easy: Cumulative sequence of single tokens, protocol always "forward"
    // Build master sequence of length 7
    const masterTokens: SingleSignalToken[] = [];
    let lastSignalId: SignalId | null = null;

    for (let i = 0; i < config.sequenceLengths[config.sequenceLengths.length - 1]; i++) {
      let candidate: SignalId;
      do {
        const idx = Math.floor(rng() * availableSignals.length);
        candidate = availableSignals[idx];
      } while (candidate === lastSignalId);

      lastSignalId = candidate;
      masterTokens.push({ type: "single", signalId: candidate });
    }

    for (let r = 0; r < config.roundCount; r++) {
      const len = config.sequenceLengths[r];
      const tokens = masterTokens.slice(0, len);
      const inputUnits = len;
      const inputDeadlineMs = config.inputBaseTimeMs + inputUnits * config.inputTimePerUnitMs;

      rounds.push({
        index: r,
        protocol: "forward",
        tokens,
        presentationFlashMs: config.presentationFlashMs,
        presentationGapMs: config.presentationGapMs,
        inputDeadlineMs,
        pairInputWindowMs: config.pairInputWindowMs,
      });
    }
  } else if (difficulty === "medium") {
    // Medium: Cumulative sequence of tokens, rounds 1-4 single, rounds 5-7 include 1 pair
    const masterTokens: SignalCommandToken[] = [];
    let lastSignalId: SignalId | null = null;
    let repeatCount = 0;

    const maxLen = config.sequenceLengths[config.sequenceLengths.length - 1]; // 10
    for (let i = 0; i < maxLen; i++) {
      let candidate: SignalId;
      do {
        const idx = Math.floor(rng() * availableSignals.length);
        candidate = availableSignals[idx];
      } while (candidate === lastSignalId && repeatCount >= config.maxImmediateRepeat);

      if (candidate === lastSignalId) {
        repeatCount++;
      } else {
        lastSignalId = candidate;
        repeatCount = 1;
      }
      masterTokens.push({ type: "single", signalId: candidate });
    }

    // Insert 1 pair token at index 5 for rounds 5..7
    const pairIdx1 = Math.min(availableSignals.length - 1, Math.floor(rng() * availableSignals.length));
    let pairIdx2 = Math.min(availableSignals.length - 1, Math.floor(rng() * availableSignals.length));
    if (pairIdx2 === pairIdx1) pairIdx2 = (pairIdx1 + 1) % availableSignals.length;

    const pairToken: PairSignalToken = {
      type: "pair",
      signalIds: [availableSignals[pairIdx1], availableSignals[pairIdx2]],
    };
    masterTokens[4] = pairToken; // index 4 (5th token) is pair token

    for (let r = 0; r < config.roundCount; r++) {
      const len = config.sequenceLengths[r];
      const tokens = masterTokens.slice(0, len);

      let inputUnits = 0;
      for (const t of tokens) {
        inputUnits += t.type === "single" ? 1 : 2;
      }
      const inputDeadlineMs = config.inputBaseTimeMs + inputUnits * config.inputTimePerUnitMs;

      rounds.push({
        index: r,
        protocol: "forward",
        tokens,
        presentationFlashMs: config.presentationFlashMs,
        presentationGapMs: config.presentationGapMs,
        inputDeadlineMs,
        pairInputWindowMs: config.pairInputWindowMs,
      });
    }
  } else {
    // Hard: Independent sequence per round, forward & reverse protocols, pair tokens per round [0,0,1,1,1,2,2,3]
    // Reverse schedule: rounds 0, 1 always forward. Out of rounds 2..7, at least 3 are reverse.
    const reverseRoundsSet = new Set<number>();
    const eligibleReverseRounds = [2, 3, 4, 5, 6, 7];
    // Pick 3 or 4 reverse rounds randomly
    const reverseCount = rng() > 0.5 ? 4 : 3;
    while (reverseRoundsSet.size < reverseCount) {
      const idx = Math.floor(rng() * eligibleReverseRounds.length);
      reverseRoundsSet.add(eligibleReverseRounds[idx]);
    }

    for (let r = 0; r < config.roundCount; r++) {
      const targetLen = config.sequenceLengths[r];
      const pairCount = config.pairTokenCountByRound[r] || 0;
      const protocol: SignalCommandProtocol = reverseRoundsSet.has(r) ? "reverse" : "forward";

      const tokens: SignalCommandToken[] = [];
      const pairPositions = new Set<number>();

      if (pairCount > 0) {
        // Pick pair positions ensuring no two pair tokens are adjacent
        const validIndices = Array.from({ length: targetLen }, (_, i) => i).filter(
          (i) => i > 0 && i < targetLen - 1
        );
        for (let p = 0; p < pairCount; p++) {
          const filtered = validIndices.filter((idx) => !pairPositions.has(idx) && !pairPositions.has(idx - 1) && !pairPositions.has(idx + 1));
          if (filtered.length > 0) {
            const chosen = filtered[Math.floor(rng() * filtered.length)];
            pairPositions.add(chosen);
          }
        }
      }

      let lastSignalId: SignalId | null = null;
      let repeatCount = 0;

      for (let i = 0; i < targetLen; i++) {
        if (pairPositions.has(i)) {
          const s1 = availableSignals[Math.floor(rng() * availableSignals.length)];
          let s2 = availableSignals[Math.floor(rng() * availableSignals.length)];
          if (s2 === s1) s2 = availableSignals[(availableSignals.indexOf(s1) + 1) % availableSignals.length];
          tokens.push({ type: "pair", signalIds: [s1, s2] });
          lastSignalId = null;
          repeatCount = 0;
        } else {
          let candidate: SignalId;
          do {
            const idx = Math.floor(rng() * availableSignals.length);
            candidate = availableSignals[idx];
          } while (candidate === lastSignalId && repeatCount >= config.maxImmediateRepeat);

          if (candidate === lastSignalId) {
            repeatCount++;
          } else {
            lastSignalId = candidate;
            repeatCount = 1;
          }
          tokens.push({ type: "single", signalId: candidate });
        }
      }

      let inputUnits = 0;
      for (const t of tokens) {
        inputUnits += t.type === "single" ? 1 : 2;
      }
      const inputDeadlineMs = config.inputBaseTimeMs + inputUnits * config.inputTimePerUnitMs;

      rounds.push({
        index: r,
        protocol,
        tokens,
        presentationFlashMs: config.presentationFlashMs,
        presentationGapMs: config.presentationGapMs,
        inputDeadlineMs,
        pairInputWindowMs: config.pairInputWindowMs,
      });
    }
  }

  const scenario: SignalCommandScenario = {
    id: `scen_${difficulty}_${seed}`,
    seed,
    difficulty,
    signalIds: availableSignals,
    rounds,
  };

  const validation = validateSignalCommandScenario(scenario, difficulty);
  if (!validation.valid) {
    // If invalid, generate a safe deterministic fallback
    return createFallbackScenario(difficulty, seed);
  }

  return scenario;
}

export function validateSignalCommandScenario(
  scenario: SignalCommandScenario,
  difficulty: TrainingDifficulty
): { valid: boolean; reason?: string } {
  const config = getSignalCommandConfig(difficulty);

  if (scenario.rounds.length !== config.roundCount) {
    return { valid: false, reason: `Invalid round count: ${scenario.rounds.length}` };
  }

  if (scenario.signalIds.length !== config.signalCount) {
    return { valid: false, reason: `Invalid signal count: ${scenario.signalIds.length}` };
  }

  let reverseRoundCount = 0;

  for (let r = 0; r < config.roundCount; r++) {
    const round = scenario.rounds[r];
    if (round.tokens.length !== config.sequenceLengths[r]) {
      return { valid: false, reason: `Round ${r} sequence length mismatch` };
    }

    if (round.protocol === "reverse") reverseRoundCount++;

    if (difficulty === "easy" && round.protocol === "reverse") {
      return { valid: false, reason: "Easy difficulty cannot have reverse protocol" };
    }

    if (difficulty === "medium" && round.protocol === "reverse") {
      return { valid: false, reason: "Medium difficulty cannot have reverse protocol" };
    }

    let roundPairCount = 0;
    for (let i = 0; i < round.tokens.length; i++) {
      const token = round.tokens[i];
      if (token.type === "pair") {
        roundPairCount++;
        if (token.signalIds[0] === token.signalIds[1]) {
          return { valid: false, reason: `Round ${r} pair token has identical signals` };
        }
      }
    }

    if (difficulty === "easy" && roundPairCount > 0) {
      return { valid: false, reason: "Easy difficulty cannot have pair tokens" };
    }
  }

  if (difficulty === "hard" && reverseRoundCount < 3) {
    return { valid: false, reason: "Hard difficulty must have at least 3 reverse rounds" };
  }

  return { valid: true };
}

function createFallbackScenario(
  difficulty: TrainingDifficulty,
  seed: string
): SignalCommandScenario {
  const config = getSignalCommandConfig(difficulty);
  const availableSignals = ALL_SIGNAL_IDS.slice(0, config.signalCount);
  const rounds: SignalCommandRound[] = [];

  for (let r = 0; r < config.roundCount; r++) {
    const len = config.sequenceLengths[r];
    const tokens: SignalCommandToken[] = [];

    for (let i = 0; i < len; i++) {
      const s = availableSignals[i % availableSignals.length];
      tokens.push({ type: "single", signalId: s });
    }

    const protocol: SignalCommandProtocol =
      difficulty === "hard" && (r === 2 || r === 4 || r === 6) ? "reverse" : "forward";

    rounds.push({
      index: r,
      protocol,
      tokens,
      presentationFlashMs: config.presentationFlashMs,
      presentationGapMs: config.presentationGapMs,
      inputDeadlineMs: config.inputBaseTimeMs + len * config.inputTimePerUnitMs,
      pairInputWindowMs: config.pairInputWindowMs,
    });
  }

  return {
    id: `scen_${difficulty}_${seed}_fb`,
    seed,
    difficulty,
    signalIds: availableSignals,
    rounds,
  };
}
