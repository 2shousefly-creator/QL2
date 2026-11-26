import { getCurrentTransitionProgress } from "../game/etaEngine";
import React from "react";
import {
  X,
  CheckCircle,
  Lock,
  Shield,
  Users,
  GitPullRequest,
  TrendingUp,
  Award,
  Crown,
  Scale,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import { RankBadge } from "./RankBadge";
import { getRankDutyDescription } from "../game/rankDuties";
import { getRankRole } from "../game/rankRoles";
import { RANK_STEPS } from "../game/rankBuilder";
import { soundManager } from "../game/audio";
import { GameState, RankFamily } from "../game/types";
import { AppBottomSheet, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "./overlay/AppOverlay";

const CATEGORY_NAMES: Record<string, string> = {
  academy: "Khối Đào Tạo & Nhập Ngũ",
  enlisted: "Khối Binh Sĩ",
  nco: "Khối Hạ Sĩ Quan",
  junior_officer: "Khối Sĩ Quan Cấp Úy",
  field_officer: "Khối Sĩ Quan Cấp Tá",
  general: "Khối Tướng Lĩnh",
  endgame: "Khối Chỉ Huy Tối Cao",
};

type JourneyDutySheetProps = {
  family: RankFamily;
  gameState: GameState;
  onClose: () => void;
};

export const JourneyDutySheet: React.FC<JourneyDutySheetProps> = ({
  family,
  gameState,
  onClose,
}) => {
  const currentRankIndex = gameState.progression.currentRankIndex;
  const currentStep = RANK_STEPS[currentRankIndex];

  // Steps in this family
  const familySteps = RANK_STEPS.filter((s) => s.familyId === family.id);
  const isCurrentFamily = currentStep.familyId === family.id;
  const isFullyAchieved = familySteps.every((s) => s.rankIndex < currentRankIndex);
  const isLocked = familySteps.every((s) => s.rankIndex > currentRankIndex);

  const duty = getRankDutyDescription(family.id);
  const representativeRankIndex = isCurrentFamily
    ? currentRankIndex
    : familySteps[0]?.rankIndex ?? 0;
  const role = getRankRole(representativeRankIndex, isCurrentFamily ? getCurrentTransitionProgress(gameState) : isFullyAchieved ? 1 : 0);
  const categoryLabel = CATEGORY_NAMES[family.category] || "Khối Binh Nghiệp";

  const requestClose = () => {
    soundManager.playClick();
    onClose();
  };

  return (
    <AppBottomSheet archetype="info"
      onClose={requestClose}
      closeOnBackdrop
      ariaLabel={`Nhiệm vụ ${duty.rankName}`}
    >
        {/* Header & Close */}
        <OverlayHeader className="theme-divider flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {isFullyAchieved && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[var(--modal-success)] border border-emerald-500/30">
                <CheckCircle className="w-3.5 h-3.5" /> Đã hoàn thành
              </span>
            )}
            {isCurrentFamily && (
              <span className={`theme-badge inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${gameState.settings.reducedMotion ? "" : ""}`}>
                Quân hàm hiện tại
              </span>
            )}
            {isLocked && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-[var(--modal-muted)] border border-slate-700">
                <Lock className="w-3.5 h-3.5" /> Chưa mở khóa
              </span>
            )}
            <span className="text-xs text-[var(--modal-info)] font-medium px-2 py-0.5 rounded-full bg-sky-950/50 border border-sky-800/60">
              {categoryLabel}
            </span>
          </div>

          <ModalButton variant="icon"
            type="button"
            onClick={() => {
              requestClose();
            }}
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </ModalButton>
        </OverlayHeader>

        <OverlayBody>
        {/* Hero Rank Identity */}
        <div className="shrink-0 my-3 flex flex-col items-center text-center">
          <div className="relative flex flex-col items-center">
            <RankBadge
              badge={family.badge}
              size={64}
              isCurrent={isCurrentFamily}
              isLocked={false}
            />
          </div>

          <h2 className="theme-text-accent mt-2 text-xl font-semibold tracking-wide flex items-center gap-1.5">
            <Crown className="theme-icon-accent w-5 h-5" />
            <span>{duty.rankName}</span>
          </h2>
          <p className="text-xs text-[var(--modal-text)] mt-0.5 font-medium max-w-sm">
            {duty.summary}
          </p>
        </div>

        {getRankRole(representativeRankIndex, 0.5).secondaryTitle !== getRankRole(representativeRankIndex).secondaryTitle && (
          <section className="modal-section mb-3 space-y-1 text-sm">
            <h3 className="font-bold">Lịch bổ nhiệm</h3>
            <p>Nhận quân hàm · {getRankRole(representativeRankIndex).primaryTitle}</p>
            <p>50% EXP · Kiêm {getRankRole(representativeRankIndex, 0.5).secondaryTitle}</p>
            <p>75% EXP · Nhậm chức {getRankRole(representativeRankIndex, 0.75).primaryTitle}</p>
          </section>
        )}

        {/* Duty & Authority Content */}
          {/* Card 0: Chức Danh & Đơn Vị Đảm Nhận */}
          <div className="modal-section space-y-2">
            <div className="theme-divider flex items-center gap-2 border-b pb-2">
              <Briefcase className="theme-icon-accent w-4 h-4" />
              <h3 className="theme-text-accent text-xs sm:text-sm font-bold uppercase tracking-wider">
                Chức Danh & Đơn Vị Đảm Nhận
              </h3>
            </div>

            <div className="space-y-2">
              <div className="modal-section flex flex-col items-start gap-1.5">
                <div className="flex items-center justify-between gap-2 w-full flex-wrap">
                  <div className="theme-badge inline-block px-2.5 py-1 rounded-lg border font-semibold text-sm tracking-wide shadow-inner">
                    {role.primaryTitle}
                  </div>
                  {role.unitDisplayName && (
                    <span className="text-xs text-[var(--modal-info)] font-medium">
                      {role.unitDisplayName}
                    </span>
                  )}
                </div>
                {role.secondaryTitle && (
                  <div className="theme-text-accent text-xs font-semibold opacity-90 pl-0.5 tracking-normal">
                    {role.secondaryTitle}
                  </div>
                )}
              </div>

              <p className="modal-section text-xs text-[var(--modal-text)] leading-relaxed">
                {role.shortDescription}
              </p>
            </div>
          </div>

          {/* Card 1: Quy mô & Tuyến Báo Cáo / Chỉ Huy */}
          <div className="modal-section space-y-2.5">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <Shield className="w-4 h-4 text-[var(--modal-info)]" />
              <h3 className="text-xs sm:text-sm font-bold text-[var(--modal-info)] uppercase tracking-wider">
                Quy Mô Hoạt Động & Tuyến Chỉ Huy
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="modal-section">
                <div className="flex items-center gap-1.5 text-[var(--modal-muted)] mb-1 font-semibold">
                  <Users className="theme-icon-accent w-3.5 h-3.5" />
                  <span>Quy mô hoạt động:</span>
                </div>
                <p className="text-[var(--modal-text)] font-bold leading-snug">
                  {duty.operationalScale}
                </p>
              </div>

              <div className="modal-section">
                <div className="flex items-center gap-1.5 text-[var(--modal-muted)] mb-1 font-semibold">
                  <GitPullRequest className="w-3.5 h-3.5 text-[var(--modal-info)]" />
                  <span>Báo cáo cho ai:</span>
                </div>
                <p className="text-[var(--modal-text)] font-bold leading-snug">
                  {duty.directSuperior}
                </p>
              </div>
            </div>

            <div className="modal-section text-xs">
              <div className="flex items-center gap-1.5 text-[var(--modal-muted)] mb-1 font-semibold">
                <Scale className="w-3.5 h-3.5 text-[var(--modal-success)]" />
                <span>Quyền lực & Thẩm quyền chỉ huy:</span>
              </div>
              <p className="text-[var(--modal-text)] leading-relaxed">
                {duty.authorityScope}
              </p>
            </div>

            <div className="modal-section text-xs text-[var(--modal-muted)] flex items-start gap-1.5">
              <span className="text-[var(--modal-muted)] font-semibold shrink-0">Tuyến chỉ đạo:</span>
              <span className="text-[var(--modal-text)]">{duty.subordinates}</span>
            </div>
          </div>

          {/* Card 2: Trọng trách & Quyền lực Gia Tăng so với quân hàm trước */}
          <div className="modal-section space-y-2.5">
            <div className="theme-divider flex items-center gap-2 border-b pb-2">
              <TrendingUp className="theme-icon-accent w-4 h-4" />
              <h3 className="theme-text-accent text-xs sm:text-sm font-bold uppercase tracking-wider">
                Gia Tăng Trọng Trách & Quyền Lực
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="theme-surface border rounded-xl p-2.5">
                <span className="theme-text-accent font-bold block mb-0.5">
                  ★ Vai trò mới đảm nhận:
                </span>
                <p className="text-[var(--modal-text)] leading-relaxed font-medium">
                  {duty.promotionImpact.addedRole}
                </p>
              </div>

              <div className="modal-section">
                <span className="text-[var(--modal-info)] font-bold block mb-0.5">
                  📈 Trách nhiệm gia tăng so với cấp trước:
                </span>
                <p className="text-[var(--modal-text)] leading-relaxed">
                  {duty.promotionImpact.responsibilityGrowth}
                </p>
              </div>

              <div className="modal-section">
                <span className="text-[var(--modal-success)] font-bold block mb-0.5">
                  ⚡ Quyền lực & Thẩm quyền mở rộng:
                </span>
                <p className="text-[var(--modal-text)] leading-relaxed">
                  {duty.promotionImpact.authorityGrowth}
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Danh sách Mô Tả Trọng Trách & Nhiệm Vụ */}
          <div className="modal-section space-y-2.5">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <Award className="w-4 h-4 text-[var(--modal-success)]" />
              <h3 className="text-xs sm:text-sm font-bold text-[var(--modal-success)] uppercase tracking-wider">
                Danh Sách Trọng Trách Cốt Lõi
              </h3>
            </div>

            <ul className="space-y-2 text-xs text-[var(--modal-text)]">
              {duty.responsibilities.map((resp, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/60 leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-[var(--modal-success)] shrink-0 mt-0.5" />
                  <span className="text-[var(--modal-text)]">{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        </OverlayBody>

        {/* Fictional Disclaimer */}
        <OverlayFooter className="text-xs text-[var(--modal-muted)] italic text-center">
          Đây là mô phỏng hư cấu chức trách quân sự phục vụ trải nghiệm trò chơi.
        </OverlayFooter>
    </AppBottomSheet>
  );
};
