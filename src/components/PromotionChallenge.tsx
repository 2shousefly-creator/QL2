import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Award, CheckCircle2, Clock, X, XCircle } from "lucide-react";
import { RankStep } from "../game/types";
import { RankPresentation } from "./RankPresentation";
import { generateExamQuestions, formatCategoryName, ShuffledExamQuestion } from "../game/questionCatalog";
import { soundManager } from "../game/audio";
import { AppModal, ConfirmationDialog, ExclusiveFullscreenOverlay, ModalActions, ModalButton, OverlayBody, OverlayFooter, OverlayHeader, ResultHero } from "./overlay/AppOverlay";

type PromotionChallengeProps = {
  currentRank: RankStep;
  nextRank: RankStep;
  durationMs?: number;
  onComplete: (
    completedAtEpochMs: number,
    stats: {
      configuredDurationMs: number;
      elapsedRealMs: number;
      bubbleHitCount: number;
      bubbleReductionMs: number;
      correctCount?: number;
      totalQuestions?: number;
    }
  ) => void;
  onCancel: (reason: string) => void;
};

export const PromotionChallenge: React.FC<PromotionChallengeProps> = ({
  currentRank,
  nextRank,
  onComplete,
  onCancel,
}) => {
  // Determine if this is a cross-family (major) or intra-family (minor) promotion
  const isCrossFamily = currentRank.familyId !== nextRank.familyId;
  const totalQuestions = isCrossFamily ? 10 : 5;
  const durationSeconds = isCrossFamily ? 90 : 45;
  const passRequirement = isCrossFamily ? 8 : 4;
  const earlyFailThreshold = isCrossFamily ? 3 : 2; // Allowed wrong answers: 2 for major, 1 for minor.

  // Questions state
  const [questions, setQuestions] = useState<ShuffledExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Score tracking
  const [answersHistory, setAnswersHistory] = useState<
    Array<{ selectedIndex: number | null; correctIndex: number; isCorrect: boolean }>
  >([]);

  // Time tracking
  const [remainingSeconds, setRemainingSeconds] = useState<number>(durationSeconds);
  const startTimeRef = useRef<number>(Date.now());

  // Result popup state ("pass" | "fail" | null)
  const [outcome, setOutcome] = useState<"pass" | "fail" | null>(null);

  // Exit Confirmation Dialog state
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const hasHandledExitRef = useRef<boolean>(false);

  // Initialize exam questions session
  useEffect(() => {
    const qList = generateExamQuestions(totalQuestions);
    setQuestions(qList);
    startTimeRef.current = Date.now();
    soundManager.playChallengeStart();
    soundManager.triggerHaptic("medium");
  }, [totalQuestions]);

  // Global Countdown Timer
  useEffect(() => {
    if (outcome !== null || questions.length === 0 || isLocked || showExitConfirm) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [outcome, questions, currentIndex, isLocked, showExitConfirm]);

  // Handle Timer Expiry
  const handleTimeExpired = () => {
    if (outcome !== null) return;

    // Evaluate all remaining unanswered questions as wrong
    let currentCorrectCount = answersHistory.filter((a) => a.isCorrect).length;
    let currentWrongCount = answersHistory.filter((a) => !a.isCorrect).length;

    // Unanswered count
    const unansweredCount = totalQuestions - answersHistory.length;
    currentWrongCount += unansweredCount;

    const finalPassed = currentCorrectCount >= passRequirement && currentWrongCount < earlyFailThreshold;
    setOutcome(finalPassed ? "pass" : "fail");

    if (finalPassed) {
      soundManager.playSuccess();
      soundManager.triggerHaptic("heavy");
    } else {
      soundManager.playChallengeReset();
      soundManager.triggerHaptic("heavy");
    }
  };

  // Handle Answer Selection
  const handleSelectOption = (optionIndex: number) => {
    if (isLocked || outcome !== null || !questions[currentIndex]) return;

    soundManager.playClick();
    setSelectedAnswer(optionIndex);
    setIsLocked(true);

    const currentQ = questions[currentIndex];
    const isCorrect = optionIndex === currentQ.correctIndex;

    if (isCorrect) {
      soundManager.triggerHaptic("light");
    } else {
      soundManager.triggerHaptic("medium");
    }

    const newHistory = [
      ...answersHistory,
      { selectedIndex: optionIndex, correctIndex: currentQ.correctIndex, isCorrect },
    ];
    setAnswersHistory(newHistory);

    const correctCount = newHistory.filter((a) => a.isCorrect).length;
    const wrongCount = newHistory.filter((a) => !a.isCorrect).length;

    // Check early fail condition
    const isEarlyFail = wrongCount >= earlyFailThreshold;
    const isLastQuestion = currentIndex + 1 >= totalQuestions;

    setTimeout(() => {
      if (isEarlyFail) {
        setOutcome("fail");
        soundManager.playChallengeReset();
        soundManager.triggerHaptic("heavy");
      } else if (isLastQuestion) {
        const passed = correctCount >= passRequirement;
        setOutcome(passed ? "pass" : "fail");
        if (passed) {
          soundManager.playSuccess();
          soundManager.triggerHaptic("heavy");
        } else {
          soundManager.playChallengeReset();
          soundManager.triggerHaptic("heavy");
        }
      } else {
        // Next question
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsLocked(false);
      }
    }, 3000);
  };

  // Handle Quit / Exit Confirmation
  const handleConfirmExit = () => {
    if (hasHandledExitRef.current) return;
    hasHandledExitRef.current = true;
    setShowExitConfirm(false);
    soundManager.playChallengeReset();
    soundManager.triggerHaptic("heavy");
    onCancel("Rớt sát hạch");
  };

  // Handle Confirm on Result Modal
  const handleConfirmResult = () => {
    if (hasHandledExitRef.current) return;
    hasHandledExitRef.current = true;
    soundManager.playClick();
    if (outcome === "pass") {
      const elapsedRealMs = Date.now() - startTimeRef.current;
      const correctCount = answersHistory.filter((a) => a.isCorrect).length;
      onComplete(Date.now(), {
        configuredDurationMs: durationSeconds * 1000,
        elapsedRealMs,
        bubbleHitCount: 0,
        bubbleReductionMs: 0,
        correctCount,
        totalQuestions,
      });
    } else {
      onCancel("Rớt sát hạch");
    }
  };

  const currentQ = questions[currentIndex];
  const correctCount = answersHistory.filter((a) => a.isCorrect).length;
  const wrongCount = answersHistory.filter((a) => !a.isCorrect).length;
  const optionLabels = ["A", "B", "C", "D"];

  return (
    <ExclusiveFullscreenOverlay
      ariaLabel={isCrossFamily ? "Sát hạch thăng quân hàm" : "Sát hạch thăng bậc"}
      className="command-screen promotion-command-screen bg-slate-950 text-slate-100 justify-between gap-3 p-4 sm:p-6 overflow-y-auto select-none"
    >
      {/* Top Bar Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between w-full max-w-xl mx-auto bg-slate-950/95 py-1">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-800/80 px-3 py-1.5 rounded-full shadow-md">
          <Award className="w-4 h-4 text-amber-400" />
          <span>{isCrossFamily ? "SÁT HẠCH THĂNG QUÂN HÀM" : "SÁT HẠCH THĂNG BẬC"}</span>
        </div>

        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            if (outcome === null) {
              setShowExitConfirm(true);
            } else {
              handleConfirmResult();
            }
          }}
          className="min-h-11 min-w-11 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center justify-center"
          aria-label="Thoát sát hạch"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Ranks Transition Header Row */}
      <div className="command-panel w-full max-w-xl mx-auto my-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-around gap-2 shadow-xl">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Hiện Tại
          </span>
          <RankPresentation rankStep={currentRank} badgeSize={68} showTierLabel={false} />
        </div>

        <div className="flex flex-col items-center justify-center text-amber-400 px-1 shrink-0">
          <ArrowRight className="w-5 h-5 animate-pulse" />
          <span className="text-[10px] font-bold uppercase mt-1 tracking-wider text-amber-300 whitespace-nowrap text-center">
            {isCrossFamily ? "Quân Hàm Mới" : "Bậc Mới"}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider mb-1">
            Mục Tiêu
          </span>
          <RankPresentation rankStep={nextRank} badgeSize={68} showTierLabel={false} />
        </div>
      </div>

      {/* Progress & Timer Status Bar */}
      <div className="w-full max-w-xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3 my-1">
        {/* Question Count */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Tiến độ:</span>
          <span className="text-sm font-black text-amber-300">
            Câu {Math.min(currentIndex + 1, totalQuestions)} / {totalQuestions}
          </span>
        </div>

        {/* Requirements */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
          <span>Yêu cầu đúng:</span>
          <span className="font-bold text-emerald-400">
            ≥ {passRequirement}/{totalQuestions}
          </span>
        </div>

        {/* Remaining Timer */}
        <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-base bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-xl shadow-inner">
          <Clock className="w-4 h-4 animate-pulse" />
          <span>{remainingSeconds}s</span>
        </div>
      </div>

      {/* Question Card Container */}
      {currentQ && outcome === null && (
        <div className="w-full max-w-xl mx-auto my-auto py-2">
          <div className="command-panel bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            {/* Question Category & Header */}
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                {formatCategoryName(currentQ.category)}
              </span>
              <span className="text-slate-400">
                Cho phép sai tối đa:{" "}
                <span className="text-rose-400 font-bold">{earlyFailThreshold - 1} câu</span>
              </span>
            </div>

            {/* Question Content */}
            <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
              {currentQ.question}
            </h3>

            {/* Answer Options Grid */}
            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {currentQ.answers.map((answerText, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrectIndex = idx === currentQ.correctIndex;

                let buttonClass =
                  "w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 shadow-md ";

                if (!isLocked) {
                  buttonClass +=
                    "bg-slate-950/80 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-amber-400/80 hover:text-amber-200 active:scale-[0.99]";
                } else if (isCorrectIndex) {
                  // Correct Answer Highlighted in Green with 3s Blinking Animation (no glow)
                  buttonClass +=
                    "bg-emerald-600 border-emerald-300 text-white font-black animate-answer-flash";
                } else if (isSelected && !isCorrectIndex) {
                  // Wrong Selected Highlighted in Red
                  buttonClass +=
                    "bg-rose-600/90 border-rose-400 text-white font-bold ring-2 ring-rose-400/50 shadow-[0_0_15px_rgba(244,63,94,0.4)]";
                } else {
                  // Other options dimmed
                  buttonClass += "bg-slate-950/40 border-slate-900 text-slate-500 opacity-40";
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isLocked}
                    onClick={() => handleSelectOption(idx)}
                    className={buttonClass}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                        isLocked && isCorrectIndex
                          ? "bg-white text-emerald-700"
                          : isLocked && isSelected && !isCorrectIndex
                          ? "bg-white text-rose-700"
                          : "bg-slate-800 border border-slate-700 text-amber-300"
                      }`}
                    >
                      {optionLabels[idx]}
                    </span>
                    <span className="pt-0.5 leading-snug">{answerText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Exit Warning Confirmation Modal */}
      {showExitConfirm && (
        <ConfirmationDialog status="warning"
          layer="exclusive-dialog"
          layout="viewport-safe"
          onClose={() => setShowExitConfirm(false)}
          closeOnEscape
          labelledBy="promotion-exit-title"
          panelClassName="text-center"
        >
          <OverlayHeader className="flex justify-center">
            {/* Warning Icon */}
            <div className="modal-status-icon">
              <AlertTriangle className="w-8 h-8 text-[var(--modal-reward)]" />
            </div>
            <h3 id="promotion-exit-title" className="modal-title">Rời sát hạch?</h3>
          </OverlayHeader>

          <OverlayBody>
            {/* Exact Required Spec Prompt Message */}
            <p className="modal-section text-sm text-[var(--modal-text)] font-semibold leading-relaxed">
              Nếu bạn thoát ra lúc này thì sẽ bị đánh Rớt Sát Hạch
            </p>
          </OverlayBody>

          {/* Action Buttons */}
          <OverlayFooter data-stack-actions="true">
              <ModalButton variant="danger"
                type="button"
                onClick={handleConfirmExit}
              >
                Rời khỏi
              </ModalButton>
              <ModalButton variant="secondary"
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setShowExitConfirm(false);
                }}
              >
                Tiếp tục thi
              </ModalButton>
          </OverlayFooter>
        </ConfirmationDialog>
      )}

      {/* Outcome Result Modal Popup */}
      {outcome !== null && (
        <AppModal status={outcome === "pass" ? "success" : "danger"} archetype="ceremony"
          layer="exclusive-dialog"
          layout="viewport-safe"
          closeOnEscape={false}
          labelledBy="promotion-result-title"
          panelClassName="text-center"
        >
          <ResultHero className="flex flex-col items-center">
            {/* Status Icon */}
            <div className="flex justify-center">
              {outcome === "pass" ? (
                <div className="modal-status-icon">
                  <CheckCircle2 className="w-12 h-12 text-[var(--modal-success)]" />
                </div>
              ) : (
                <div className="modal-status-icon">
                  <XCircle className="w-12 h-12 text-[var(--modal-danger)]" />
                </div>
              )}
            </div>

            {/* Modal Title */}
            <h3
              id="promotion-result-title"
              className="modal-title"
            >
              {outcome === "pass" ? "VƯỢT QUA SÁT HẠCH" : "RỚT SÁT HẠCH"}
            </h3>
          </ResultHero>

          <OverlayBody>
            {/* Exact Required Spec Message */}
            <p className="modal-section text-xs sm:text-sm text-[var(--modal-text)] font-medium leading-relaxed">
              {outcome === "pass"
                ? "TUYỆT VỜI, CHÚC MỪNG ĐỒNG CHÍ ĐÃ VƯỢT QUA BÀI SÁT HẠCH VÀ ĐƯỢC THĂNG CẤP BẬC"
                : "RẤT TIẾC, BẠN ĐÃ RỚT SÁT HẠCH. HÃY THỬ LẠI BÀI SÁT HẠCH MỚI ĐỂ VƯỢT QUA THỬ THÁCH NÀY."}
            </p>

            {/* Stats Summary */}
            <div className="modal-section flex items-center justify-around text-xs">
              <div>
                <span className="text-[var(--modal-muted)] block">Số câu đúng</span>
                <span
                  className={`font-semibold text-sm ${
                    correctCount >= passRequirement ? "text-[var(--modal-success)]" : "text-[var(--modal-danger)]"
                  }`}
                >
                  {correctCount} / {totalQuestions}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <span className="text-[var(--modal-muted)] block">Yêu cầu tối thiểu</span>
                <span className="font-bold text-[var(--modal-reward)] text-sm">
                  {passRequirement} / {totalQuestions}
                </span>
              </div>
            </div>
          </OverlayBody>

          {/* Confirm Button */}
          <ModalActions>
            <ModalButton variant="primary"
              type="button"
              onClick={handleConfirmResult}
              className="w-full"
            >
              Xác Nhận
            </ModalButton>
          </ModalActions>
        </AppModal>
      )}

      {/* Footer Instructions */}
      <div className="w-full max-w-xl mx-auto text-center text-[11px] text-slate-400 bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
        <span>Trả lời chính xác các câu hỏi trắc nghiệm để hoàn thành sát hạch.</span>
      </div>
    </ExclusiveFullscreenOverlay>
  );
};
