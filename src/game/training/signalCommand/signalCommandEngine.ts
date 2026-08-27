import { TrainingDifficulty } from "../../types";
import { getSignalCommandConfig } from "./signalCommandConfig";
import { createSignalCommandScenario } from "./signalCommandGenerator";
import {
  SignalCommandResult,
  SignalCommandRound,
  SignalCommandRun,
  SignalCommandScenario,
  SignalId,
} from "./signalCommandTypes";

export function createSignalCommandRun(
  difficulty: TrainingDifficulty,
  seed: string = String(Math.floor(Math.random() * 1_000_000)),
  nowPerfMs: number = performance.now()
): SignalCommandRun {
  const config = getSignalCommandConfig(difficulty);
  const scenario = createSignalCommandScenario(difficulty, seed);

  return {
    id: `run_${difficulty}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    seed,
    difficulty,
    status: "ready",
    scenario,
    currentRoundIndex: 0,
    phaseStartedAtPerformanceMs: null,
    inputDeadlineAtPerformanceMs: null,
    expectedTokenIndex: 0,
    pendingPair: null,
    recoveriesRemaining: config.recoveryCharges,
    errors: 0,
    timeoutCount: 0,
    completedRounds: 0,
    correctCellInputs: 0,
    wrongCellInputs: 0,
    startedAtPerformanceMs: nowPerfMs,
    completedAtPerformanceMs: null,
    resetReason: null,
  };
}

export function startSignalCommandRun(
  run: SignalCommandRun,
  nowPerfMs: number = performance.now()
) {
  run.status = "countdown";
  run.phaseStartedAtPerformanceMs = nowPerfMs;
}

export function startRoundPresentation(
  run: SignalCommandRun,
  nowPerfMs: number = performance.now()
) {
  run.status = "presenting";
  run.phaseStartedAtPerformanceMs = nowPerfMs;
  run.expectedTokenIndex = 0;
  run.pendingPair = null;
  run.inputDeadlineAtPerformanceMs = null;
}

export function getSignalCommandPresentationState(
  run: SignalCommandRun,
  nowPerfMs: number = performance.now()
): {
  activeTokenIndex: number | null;
  activeSignalIds: SignalId[];
  isGap: boolean;
  isComplete: boolean;
} {
  if (run.status !== "presenting" || run.phaseStartedAtPerformanceMs === null) {
    return { activeTokenIndex: null, activeSignalIds: [], isGap: false, isComplete: true };
  }

  const currentRound = run.scenario.rounds[run.currentRoundIndex];
  if (!currentRound) {
    return { activeTokenIndex: null, activeSignalIds: [], isGap: false, isComplete: true };
  }

  const elapsed = Math.max(0, nowPerfMs - run.phaseStartedAtPerformanceMs);
  const cycleMs = currentRound.presentationFlashMs + currentRound.presentationGapMs;
  const tokenIndex = Math.floor(elapsed / cycleMs);

  if (tokenIndex >= currentRound.tokens.length) {
    return { activeTokenIndex: null, activeSignalIds: [], isGap: true, isComplete: true };
  }

  const token = currentRound.tokens[tokenIndex];
  const offset = elapsed % cycleMs;
  const isFlashing = offset < currentRound.presentationFlashMs;

  if (!isFlashing) {
    return { activeTokenIndex: tokenIndex, activeSignalIds: [], isGap: true, isComplete: false };
  }

  const activeSignalIds: SignalId[] =
    token.type === "single" ? [token.signalId] : [token.signalIds[0], token.signalIds[1]];

  return { activeTokenIndex: tokenIndex, activeSignalIds, isGap: false, isComplete: false };
}

export function startSignalCommandInputPhase(
  run: SignalCommandRun,
  nowPerfMs: number = performance.now()
) {
  const currentRound = run.scenario.rounds[run.currentRoundIndex];
  if (!currentRound) return;

  run.status = "awaiting_input";
  run.phaseStartedAtPerformanceMs = nowPerfMs;
  run.expectedTokenIndex = 0;
  run.pendingPair = null;
  run.inputDeadlineAtPerformanceMs = nowPerfMs + currentRound.inputDeadlineMs;
}

export function getExpectedTokensForRound(round: SignalCommandRound) {
  if (round.protocol === "reverse") {
    return [...round.tokens].reverse();
  }
  return round.tokens;
}

export function processSignalCommandInput(
  run: SignalCommandRun,
  signalId: SignalId,
  nowPerfMs: number = performance.now()
): {
  outcome: "correct" | "correct_pair_complete" | "pending_pair_first" | "wrong";
  isRoundComplete?: boolean;
  isVictory?: boolean;
  isFailed?: boolean;
  isRecovering?: boolean;
} {
  if (run.status !== "awaiting_input") {
    return { outcome: "wrong" };
  }

  const currentRound = run.scenario.rounds[run.currentRoundIndex];
  if (!currentRound) return { outcome: "wrong" };

  const expectedTokens = getExpectedTokensForRound(currentRound);
  const currentExpectedToken = expectedTokens[run.expectedTokenIndex];

  if (!currentExpectedToken) {
    return { outcome: "wrong" };
  }

  if (currentExpectedToken.type === "single") {
    if (signalId === currentExpectedToken.signalId) {
      run.correctCellInputs++;
      run.expectedTokenIndex++;

      if (run.expectedTokenIndex >= expectedTokens.length) {
        run.completedRounds++;
        if (run.currentRoundIndex >= run.scenario.rounds.length - 1) {
          run.status = "won";
          run.completedAtPerformanceMs = nowPerfMs;
          return { outcome: "correct", isRoundComplete: true, isVictory: true };
        } else {
          run.status = "round_success";
          return { outcome: "correct", isRoundComplete: true, isVictory: false };
        }
      }

      return { outcome: "correct" };
    } else {
      run.wrongCellInputs++;
      run.errors++;
      const recovery = applyRecoveryOrFail(run, "Mật lệnh chưa chính xác — phát lại vòng", nowPerfMs);
      return {
        outcome: "wrong",
        isFailed: recovery.isFailed,
        isRecovering: recovery.isRecovering,
      };
    }
  } else {
    // Pair token
    const pairSignals = currentExpectedToken.signalIds;

    if (run.pendingPair === null) {
      if (pairSignals.includes(signalId)) {
        run.pendingPair = {
          tokenIndex: run.expectedTokenIndex,
          firstSignalId: signalId,
          startedAtPerformanceMs: nowPerfMs,
        };
        return { outcome: "pending_pair_first" };
      } else {
        run.wrongCellInputs++;
        run.errors++;
        const recovery = applyRecoveryOrFail(run, "Mật lệnh chưa chính xác — phát lại vòng", nowPerfMs);
        return {
          outcome: "wrong",
          isFailed: recovery.isFailed,
          isRecovering: recovery.isRecovering,
        };
      }
    } else {
      // Check window expiry
      if (nowPerfMs - run.pendingPair.startedAtPerformanceMs > currentRound.pairInputWindowMs) {
        run.pendingPair = null;
        run.wrongCellInputs++;
        run.errors++;
        const recovery = applyRecoveryOrFail(run, "Hết thời gian nhập tín hiệu đôi", nowPerfMs);
        return {
          outcome: "wrong",
          isFailed: recovery.isFailed,
          isRecovering: recovery.isRecovering,
        };
      }

      // Check second signal
      const firstId = run.pendingPair.firstSignalId;
      if (signalId !== firstId && pairSignals.includes(signalId)) {
        // Valid second signal of pair!
        run.pendingPair = null;
        run.correctCellInputs += 2;
        run.expectedTokenIndex++;

        if (run.expectedTokenIndex >= expectedTokens.length) {
          run.completedRounds++;
          if (run.currentRoundIndex >= run.scenario.rounds.length - 1) {
            run.status = "won";
            run.completedAtPerformanceMs = nowPerfMs;
            return { outcome: "correct_pair_complete", isRoundComplete: true, isVictory: true };
          } else {
            run.status = "round_success";
            return { outcome: "correct_pair_complete", isRoundComplete: true, isVictory: false };
          }
        }

        return { outcome: "correct_pair_complete" };
      } else {
        // Same signal tapped twice or wrong second signal!
        run.pendingPair = null;
        run.wrongCellInputs++;
        run.errors++;
        const recovery = applyRecoveryOrFail(run, "Cặp tín hiệu không khớp", nowPerfMs);
        return {
          outcome: "wrong",
          isFailed: recovery.isFailed,
          isRecovering: recovery.isRecovering,
        };
      }
    }
  }
}

export function checkSignalCommandTimeouts(
  run: SignalCommandRun,
  nowPerfMs: number = performance.now()
): { timedOut: boolean; reason?: string } {
  if (run.status !== "awaiting_input") return { timedOut: false };

  const currentRound = run.scenario.rounds[run.currentRoundIndex];
  if (!currentRound) return { timedOut: false };

  // Check pending pair timeout
  if (run.pendingPair !== null) {
    if (nowPerfMs - run.pendingPair.startedAtPerformanceMs > currentRound.pairInputWindowMs) {
      run.pendingPair = null;
      run.wrongCellInputs++;
      run.timeoutCount++;
      run.errors++;
      applyRecoveryOrFail(run, "Hết thời gian tín hiệu đôi", nowPerfMs);
      return { timedOut: true, reason: "pair_timeout" };
    }
  }

  // Check round overall input deadline
  if (run.inputDeadlineAtPerformanceMs !== null && nowPerfMs > run.inputDeadlineAtPerformanceMs) {
    run.pendingPair = null;
    run.timeoutCount++;
    run.errors++;
    applyRecoveryOrFail(run, "Hết thời gian nhập mật lệnh", nowPerfMs);
    return { timedOut: true, reason: "deadline_timeout" };
  }

  return { timedOut: false };
}

export function applyRecoveryOrFail(
  run: SignalCommandRun,
  reason: string,
  nowPerfMs: number = performance.now()
): { isFailed: boolean; isRecovering: boolean } {
  if (run.recoveriesRemaining > 0) {
    run.recoveriesRemaining--;
    run.expectedTokenIndex = 0;
    run.pendingPair = null;
    run.status = "recovering";
    run.lastJudgementText = {
      text: `${reason} (Còn ${run.recoveriesRemaining} lượt sửa)`,
      color: "text-amber-400",
      key: nowPerfMs,
    };
    return { isFailed: false, isRecovering: true };
  } else {
    run.status = "failed";
    run.completedAtPerformanceMs = nowPerfMs;
    run.lastJudgementText = {
      text: "Mật lệnh thất bại",
      color: "text-rose-400",
      key: nowPerfMs,
    };
    return { isFailed: true, isRecovering: false };
  }
}

export function advanceSignalCommandRound(
  run: SignalCommandRun,
  nowPerfMs: number = performance.now()
) {
  run.currentRoundIndex++;
  run.expectedTokenIndex = 0;
  run.pendingPair = null;

  if (run.currentRoundIndex >= run.scenario.rounds.length) {
    run.status = "won";
    run.completedAtPerformanceMs = nowPerfMs;
  } else {
    run.status = "round_intro";
    run.phaseStartedAtPerformanceMs = nowPerfMs;
  }
}

export function compileSignalCommandResult(
  run: SignalCommandRun,
  epochMs: number = Date.now()
): SignalCommandResult {
  const totalRounds = run.scenario.rounds.length;
  const victory = run.status === "won";
  const completedRounds = run.completedRounds;

  const elapsedRealMs = run.completedAtPerformanceMs
    ? Math.max(0, run.completedAtPerformanceMs - run.startedAtPerformanceMs)
    : 0;

  const config = getSignalCommandConfig(run.difficulty);
  const recoveriesUsed = config.recoveryCharges - run.recoveriesRemaining;

  let pairTokensCompleted = 0;
  let reverseRoundsCompleted = 0;
  let maxSeq = 0;

  for (let r = 0; r < completedRounds; r++) {
    const round = run.scenario.rounds[r];
    if (round.protocol === "reverse") reverseRoundsCompleted++;
    if (round.tokens.length > maxSeq) maxSeq = round.tokens.length;

    for (const t of round.tokens) {
      if (t.type === "pair") pairTokensCompleted++;
    }
  }

  const accuracy = run.correctCellInputs / Math.max(1, run.correctCellInputs + run.wrongCellInputs + run.timeoutCount);
  const completionRatio = completedRounds / totalRounds;

  const targetMaxTimeMs = 120_000;
  const speedRatio = Math.max(0, Math.min(1, 1 - elapsedRealMs / targetMaxTimeMs));

  const score = Math.min(
    1000,
    Math.max(
      0,
      Math.round(1000 * (0.65 * completionRatio + 0.25 * accuracy + 0.10 * speedRatio))
    )
  );

  const perfectWin = victory && run.wrongCellInputs === 0 && run.timeoutCount === 0 && recoveriesUsed === 0;

  return {
    runId: run.id,
    gameId: "signal_command",
    difficulty: run.difficulty,
    victory,
    completedRounds,
    totalRounds,
    longestSequenceCompleted: maxSeq,
    correctCellInputs: run.correctCellInputs,
    wrongCellInputs: run.wrongCellInputs,
    timeoutCount: run.timeoutCount,
    recoveriesUsed,
    pairTokensCompleted,
    reverseRoundsCompleted,
    accuracy,
    score,
    perfectWin,
    elapsedRealMs,
    completedAtEpochMs: epochMs,
  };
}
