import React, { useState, useEffect } from "react";
import {
  Home,
  Target,
  Dices,
  Sprout,
  User,
  Compass,
  Shield,
  UserCheck,
  X,
  Hammer,
  Award,
  Crown,
  Contact,
  ScrollText,
  Shirt,
} from "lucide-react";
import { motion } from "motion/react";
import { TabType, GameState } from "../game/types";
import { soundManager } from "../game/audio";
import { getFarmAttentionState } from "../features/tang_gia/farmPresentation";
import { AppBottomSheet, AppModal, OverlayBody, OverlayFooter, OverlayHeader } from "./overlay/AppOverlay";

type HubNavigationProps = {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isHidden?: boolean;
  gameState?: GameState | null;
};

export const HubNavigation: React.FC<HubNavigationProps> = ({
  activeTab,
  onSelectTab,
  isHidden = false,
  gameState = null,
}) => {
  const [isProfileHubOpen, setIsProfileHubOpen] = useState(false);
  const [isTangGiaOpen, setIsTangGiaOpen] = useState(false);
  const [now, setNow] = useState<number>(() => Date.now());
  const reducedMotion = gameState?.settings.reducedMotion ?? false;

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const farm = gameState?.farm;

  const hasTangGiaNotification = React.useMemo(() => {
    if (!farm) return false;
    return getFarmAttentionState(farm, now).shouldShowNavigationBadge;
  }, [farm, now]);

  if (isHidden) return null;

  const isProfileCategoryActive =
    activeTab === "profile" ||
    activeTab === "journey" ||
    activeTab === "ranks" ||
    activeTab === "medals" ||
    activeTab === "mastery" ||
    activeTab === "idCard" ||
    activeTab === "journal" ||
    activeTab === "uniform";

  const mainTabs = [
    {
      id: "home" as TabType,
      label: "Trang chủ",
      icon: Home,
      isActive: activeTab === "home",
      onClick: () => {
        soundManager.playClick();
        onSelectTab("home");
      },
    },
    {
      id: "training" as TabType,
      label: "Huấn Luyện",
      icon: Target,
      isActive: activeTab === "training",
      onClick: () => {
        soundManager.playClick();
        onSelectTab("training");
      },
    },
    {
      id: "entertainment" as TabType,
      label: "Giải Trí",
      icon: Dices,
      isActive: activeTab === "entertainment",
      onClick: () => {
        soundManager.playClick();
        onSelectTab("entertainment");
      },
    },
    {
      id: "tang_gia" as TabType,
      label: "Tăng Gia",
      icon: Sprout,
      isActive: activeTab === "tang_gia",
      hasBadge: hasTangGiaNotification,
      onClick: () => {
        soundManager.playClick();
        onSelectTab("tang_gia");
      },
    },
    {
      id: "profile_hub" as const,
      label: "Hồ Sơ",
      icon: User,
      isActive: isProfileCategoryActive || isProfileHubOpen,
      onClick: () => {
        soundManager.playClick();
        setIsProfileHubOpen((prev) => !prev);
      },
    },
  ];

  const profileMenuItems = [
    {
      id: "idCard" as TabType,
      title: "Thẻ Binh Nghiệp",
      fullName: "Thẻ Binh Nghiệp",
      subtitle: "Hồ sơ thành tích & huy hiệu",
      icon: Contact,
    },
    {
      id: "journal" as TabType,
      title: "Nhật Ký",
      fullName: "Nhật Ký Binh Nghiệp",
      subtitle: "Lịch sử dấu mốc đáng nhớ",
      icon: ScrollText,
    },
    {
      id: "journey" as TabType,
      title: "Hành Trình",
      fullName: "Hành Trình Binh Nghiệp",
      subtitle: "216 Cấp bậc & 8 chương",
      icon: Compass,
    },
    {
      id: "ranks" as TabType,
      title: "Cấp Bậc",
      fullName: "Thư Viện Cấp Bậc",
      subtitle: "Tra cứu hình dáng & nhiệm vụ",
      icon: Shield,
    },
    {
      id: "uniform" as TabType,
      title: "Quân Phục",
      fullName: "Quân Phục Binh Nghiệp",
      subtitle: "Lễ phục theo quân hàm đã đạt",
      icon: Shirt,
    },
    {
      id: "medals" as TabType,
      title: "Huân Chương",
      fullName: "Huân Chương Binh Nghiệp",
      subtitle: "Những dấu mốc đáng nhớ",
      icon: Award,
    },
    {
      id: "mastery" as TabType,
      title: "Mastery",
      fullName: "Mastery Huấn Luyện",
      subtitle: "Tiến trình tinh thông Huấn Luyện",
      icon: Crown,
    },
    {
      id: "profile" as TabType,
      title: "Cá Nhân",
      fullName: "Cá Nhân & Cài Đặt",
      subtitle: "Avatar, sao lưu & âm thanh",
      icon: UserCheck,
    },
  ];

  const handleSelectProfileSubItem = (tabId: TabType) => {
    soundManager.playClick();
    setIsProfileHubOpen(false);
    onSelectTab(tabId);
  };

  return (
    <>
      {/* Bottom Main Navigation Bar */}
      <nav
        data-app-navigation
        aria-label="Điều hướng chính"
        className="theme-nav-shell command-dock fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 border-t backdrop-blur-md pb-[env(safe-area-inset-bottom)] shadow-2xl select-none"
      >
        <div className="hub-navigation-bar max-w-lg mx-auto flex items-center justify-around px-2">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.isActive;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={tab.onClick}
                className={`theme-focus flex-1 flex flex-col items-center justify-center h-full py-1 px-1 relative transition-all duration-150 focus:outline-none ${
                  isActive
                    ? "theme-nav-active font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {/* Active Glowing Top Line */}
                {isActive && (
                  <motion.span
                    layoutId="activeTabIndicator"
                    className="theme-active-marker absolute top-0 inset-x-3 h-0.5 rounded-full"
                    transition={reducedMotion ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
                  />
                )}

                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? "scale-110" : ""
                    }`}
                  />
                  {tab.hasBadge && (
                    <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                  )}
                </div>

                <span className="text-[11px] leading-tight tracking-tight mt-0.5 truncate text-center">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Hồ Sơ Hub Popup Sheet */}
      {isProfileHubOpen && (
        <AppBottomSheet
          onClose={() => setIsProfileHubOpen(false)}
          closeOnBackdrop
          labelledBy="profile-hub-title"
          panelClassName={`theme-card-accent profile-dossier-sheet max-w-lg bg-slate-900 border-t rounded-t-3xl p-3 sm:p-4 shadow-2xl gap-2.5 select-none ${reducedMotion ? "" : "animate-in slide-in-from-bottom-4 duration-200"}`}
        >
              {/* Header */}
              <OverlayHeader className="theme-divider flex items-center justify-between gap-2 pb-2 border-b">
                <div className="flex items-center gap-2">
                  <div className="theme-badge w-8 h-8 rounded-lg border flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 id="profile-hub-title" className="text-sm font-extrabold text-slate-100 flex items-center gap-1.5">
                      Hồ Sơ Quân Vụ
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Chọn nội dung cần xem hoặc quản lý
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsProfileHubOpen(false)}
                  className="theme-focus w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors focus:outline-none"
                  aria-label="Đóng Hồ Sơ Quân Vụ"
                >
                  <X className="w-4 h-4" />
                </button>
              </OverlayHeader>

              {/* Sub-item Grid / 7 Cards */}
              <OverlayBody className="grid grid-cols-2 gap-2 sm:gap-2.5 p-0.5">
                {profileMenuItems.map((item, index) => {
                  const ItemIcon = item.icon;
                  const isCurrentActive = activeTab === item.id;
                  const isSpanningFullWidth =
                    profileMenuItems.length % 2 === 1 && index === profileMenuItems.length - 1;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectProfileSubItem(item.id)}
                      className={`relative flex ${
                        isSpanningFullWidth
                          ? "col-span-2 flex-row items-center justify-start gap-3 p-3 text-left"
                          : "flex-col items-center justify-center p-2.5 text-center"
                      } tactical-card profile-dossier-card theme-menu-card theme-focus rounded-2xl border transition-all duration-200 group focus:outline-none ${
                        isCurrentActive
                          ? "theme-menu-card--active shadow-xl scale-[1.02]"
                          : "active:scale-95"
                      }`}
                    >
                      {/* Active Status Dot */}
                      {isCurrentActive && (
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                          <span className={`theme-active-dot w-2 h-2 rounded-full ${reducedMotion ? "" : "animate-pulse"}`} />
                        </div>
                      )}

                      {/* Icon Container */}
                      <div
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105 ${
                          isSpanningFullWidth ? "shrink-0" : "mb-2"
                        } theme-menu-card__icon`}
                      >
                        <ItemIcon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                      </div>

                      {/* Title & Subtitle */}
                      <div className={isSpanningFullWidth ? "flex-1 min-w-0" : "w-full"}>
                        <h4 className="theme-menu-card__title font-extrabold text-xs sm:text-sm text-slate-100 transition-colors tracking-tight leading-tight truncate w-full">
                          {isSpanningFullWidth ? item.fullName : item.title}
                        </h4>

                        <span className="text-[10px] text-slate-400 font-medium truncate block w-full mt-0.5">
                          {item.subtitle}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </OverlayBody>
        </AppBottomSheet>
      )}

      {/* Tăng Gia (In Development) Modal */}
      {isTangGiaOpen && (
        <AppModal
          onClose={() => setIsTangGiaOpen(false)}
          closeOnBackdrop
          labelledBy="tang-gia-coming-soon-title"
          panelClassName={`w-full max-w-sm bg-slate-900 border border-emerald-500/50 rounded-3xl shadow-2xl text-center select-none ${reducedMotion ? "" : "animate-in zoom-in-95 duration-200"}`}
        >
          <OverlayHeader className="flex flex-col items-center gap-3 px-5 pt-5">
              <button
                type="button"
                onClick={() => setIsTangGiaOpen(false)}
                className="app-overlay__close absolute right-3 top-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                aria-label="Đóng thông báo Tăng Gia"
                data-overlay-close
              >
                <X className="mx-auto h-4 w-4" />
              </button>
              <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-600/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Sprout className="w-9 h-9 animate-pulse" />
                <Hammer className="w-4 h-4 text-amber-400 absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5 border border-amber-400" />
              </div>

              <div className="space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  Đang Phát Triển
                </span>
                <h3 id="tang-gia-coming-soon-title" className="text-base font-extrabold text-slate-100">
                  Khu Vực Tăng Gia Sản Xuất
                </h3>
              </div>
          </OverlayHeader>

          <OverlayBody className="px-5 py-4">
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 text-left">
                Tính năng <strong className="text-emerald-400">Trồng Cây & Chăn Nuôi Tăng Gia Sản Xuất</strong> đang được Bộ Chỉ Huy nghiên cứu, hoàn thiện kỹ thuật.
                <br /><br />
                Vui lòng quay lại trong các phiên bản cập nhật tiếp theo để trải nghiệm hoạt động tăng gia thực phẩm cho đơn vị và nhận thưởng XP!
              </p>
          </OverlayBody>

          <OverlayFooter className="px-5 pb-5">
              <button
                type="button"
                onClick={() => setIsTangGiaOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all active:scale-98 shadow-md"
              >
                Đã Hiểu, Quay Lại
              </button>
          </OverlayFooter>
        </AppModal>
      )}
    </>
  );
};
