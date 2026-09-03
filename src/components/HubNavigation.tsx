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
import { motion, AnimatePresence } from "motion/react";
import { TabType, GameState } from "../game/types";
import { soundManager } from "../game/audio";
import { MEDAL_CATALOG } from "../game/medals/medalCatalog";
import { getFarmPresentationState } from "../features/tang_gia/farmPresentation";

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

    // 1. Trứng trong kho (Egg inventory > 0)
    const eggsObj = farm.inventory?.eggs;
    if (eggsObj) {
      const eggCount = Object.keys(eggsObj).reduce((sum: number, key) => {
        const count = (eggsObj as Record<string, number>)[key] || 0;
        return sum + count;
      }, 0);
      if (eggCount > 0) return true;
    }

    // 2. Gia súc / gia cầm trong chuồng có trứng sẵn sàng thu hoạch
    if (farm.penAnimals && farm.penAnimals.length > 0) {
      const hasPenEggReady = farm.penAnimals.some(
        (animal) => animal.nextEggAt && now >= animal.nextEggAt
      );
      if (hasPenEggReady) return true;
    }

    // 3. Cây có thể thu hoạch
    if (farm.plots && farm.plots.length > 0) {
      const hasReadyCrop = getFarmPresentationState(farm, now).plots.some(
        (plot) => plot.status === "ready"
      );
      if (hasReadyCrop) return true;
    }

    return false;
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
      badge: "Hồ sơ",
      icon: Contact,
    },
    {
      id: "journal" as TabType,
      title: "Nhật Ký",
      fullName: "Nhật Ký Binh Nghiệp",
      subtitle: "Lịch sử dấu mốc đáng nhớ",
      badge: "Nhật ký",
      icon: ScrollText,
    },
    {
      id: "journey" as TabType,
      title: "Hành Trình",
      fullName: "Hành Trình Binh Nghiệp",
      subtitle: "216 Cấp bậc & 8 chương",
      badge: "216 Bậc",
      icon: Compass,
    },
    {
      id: "ranks" as TabType,
      title: "Cấp Bậc",
      fullName: "Thư Viện Cấp Bậc",
      subtitle: "Tra cứu hình dáng & nhiệm vụ",
      badge: "Tra cứu",
      icon: Shield,
    },
    {
      id: "uniform" as TabType,
      title: "Quân Phục",
      fullName: "Quân Phục Binh Nghiệp",
      subtitle: "Lễ phục theo quân hàm đã đạt",
      badge: "24 Quân hàm",
      icon: Shirt,
    },
    {
      id: "medals" as TabType,
      title: "Huân Chương",
      fullName: "Huân Chương Binh Nghiệp",
      subtitle: "Những dấu mốc đáng nhớ",
      badge: `${MEDAL_CATALOG.length} Huân chương`,
      icon: Award,
    },
    {
      id: "mastery" as TabType,
      title: "Mastery",
      fullName: "Mastery Huấn Luyện",
      subtitle: "Tiến trình tinh thông Huấn Luyện",
      badge: "6 Môn",
      icon: Crown,
    },
    {
      id: "profile" as TabType,
      title: "Cá Nhân",
      fullName: "Cá Nhân & Cài Đặt",
      subtitle: "Avatar, sao lưu & âm thanh",
      badge: "Hồ sơ chính",
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
        aria-label="Điều hướng chính"
        className="theme-nav-shell fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 border-t backdrop-blur-md pb-[env(safe-area-inset-bottom)] shadow-2xl select-none"
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
                    transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
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
      <AnimatePresence>
        {isProfileHubOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
              onClick={() => setIsProfileHubOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Popup Sheet Container */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={reducedMotion ? { duration: 0 } : { type: "spring", damping: 28, stiffness: 320 }}
              className="theme-card-accent fixed bottom-0 inset-x-0 z-50 max-w-lg mx-auto bg-slate-900 border-t rounded-t-3xl p-3.5 sm:p-5 pb-8 shadow-2xl max-h-[88vh] overflow-y-auto space-y-3 select-none"
            >
              {/* Header */}
              <div className="theme-divider flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-2">
                  <div className="theme-badge w-8 h-8 rounded-lg border flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-1.5">
                      Danh Mục Hồ Sơ Binh Nghiệp
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Chọn mục bạn muốn xem và quản lý:
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsProfileHubOpen(false)}
                  className="theme-focus w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sub-item Grid / 7 Cards */}
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 p-0.5">
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
                          : "flex-col items-center justify-center p-3 text-center"
                      } theme-menu-card theme-focus rounded-2xl border transition-all duration-200 group focus:outline-none ${
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tăng Gia (In Development) Modal */}
      <AnimatePresence>
        {isTangGiaOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsTangGiaOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-11/12 max-w-sm bg-slate-900 border border-emerald-500/50 rounded-3xl p-5 shadow-2xl text-center space-y-4 select-none"
            >
              <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-600/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Sprout className="w-9 h-9 animate-pulse" />
                <Hammer className="w-4 h-4 text-amber-400 absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5 border border-amber-400" />
              </div>

              <div className="space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  Đang Phát Triển
                </span>
                <h3 className="text-base font-extrabold text-slate-100">
                  Khu Vực Tăng Gia Sản Xuất
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 text-left">
                Tính năng <strong className="text-emerald-400">Trồng Cây & Chăn Nuôi Tăng Gia Sản Xuất</strong> đang được Bộ Chỉ Huy nghiên cứu, hoàn thiện kỹ thuật.
                <br /><br />
                Vui lòng quay lại trong các phiên bản cập nhật tiếp theo để trải nghiệm hoạt động tăng gia thực phẩm cho đơn vị và nhận thưởng XP!
              </p>

              <button
                type="button"
                onClick={() => setIsTangGiaOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all active:scale-98 shadow-md"
              >
                Đã Hiểu, Quay Lại
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
