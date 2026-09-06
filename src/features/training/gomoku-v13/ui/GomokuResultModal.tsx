import React from "react";
import "./gomokuPaper.css";
import { ArrowLeft, RefreshCw, Trophy, XCircle } from "lucide-react";
import { GomokuResult } from "../domain/gomokuTypes";
import { soundManager } from "../../../../game/audio";
import { GameResultModal, ModalActions, ModalButton, OverlayBody, ResultHero, ResultStat, ResultStats } from "../../../../components/overlay/AppOverlay";

interface GomokuResultModalProps {
  result: GomokuResult;
  earnedXp: number;
  reducedMotion?: boolean;
  onRestart: () => void;
  onExit: () => void;
}

export const GomokuResultModal: React.FC<GomokuResultModalProps> = ({
  result,
  earnedXp,
  reducedMotion = false,
  onRestart,
  onExit,
}) => {
  const isPlayerWon = result.outcome === "player_win";
  const isResigned = result.outcome === "resigned";

  return (
    <GameResultModal reducedMotion={reducedMotion} status={isPlayerWon ? "success" : isResigned ? "neutral" : "danger"} theme="paper"
      onClose={onExit}
      layer="exclusive-dialog"
      layout="viewport-safe"
      labelledBy="gomoku-result-title"

      panelClassName="text-center"
    >
        {/* Glow Header */}
        <ResultHero className="relative flex flex-col items-center overflow-hidden text-center">

          {isPlayerWon ? (
            <div className="modal-status-icon">
              <Trophy className="w-8 h-8" />
            </div>
          ) : isResigned ? (
            <div className="modal-status-icon">
              <XCircle className="w-8 h-8" />
            </div>
          ) : (
            <div className="modal-status-icon">
              <XCircle className="w-8 h-8" />
            </div>
          )}

          <h2 id="gomoku-result-title" className="modal-title">
            {isPlayerWon
              ? "Chiến Thắng!"
              : isResigned
              ? "Đã Đầu Hàng"
              : "Thất Bại"}
          </h2>
          <p className="modal-copy">
            {isPlayerWon
              ? "Bạn đã hoàn thành chuỗi 5 quân thắng máy"
              : isResigned
              ? "Trận đấu dừng do bạn đầu hàng"
              : "Máy đã tạo chuỗi 5 quân thắng trước"}
          </p>
        </ResultHero>

        <OverlayBody>
          <ResultStats>
            <ResultStat label="Tổng số nước đi:" value={`${result.totalMoves} nước`} />
            <ResultStat label="Độ khó:" value={result.difficulty === "easy" ? "Dễ" : result.difficulty === "medium" ? "Vừa" : "Khó"} />
            {earnedXp > 0 && <ResultStat label="Thưởng Thắng:" value={`+${earnedXp} XP`} status="reward" />}
          </ResultStats>
        </OverlayBody>

        {/* Action Buttons */}
        <ModalActions className="flex-col">
          <ModalButton variant="primary"
            type="button"
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4" />
            Thách Đấu Trận Mới
          </ModalButton>

          <ModalButton variant="ghost"
            type="button"
            onClick={() => {
              soundManager.playClick();
              onExit();
            }}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4" />
            Về Sảnh Huấn Luyện
          </ModalButton>
        </ModalActions>
    </GameResultModal>
  );
};
