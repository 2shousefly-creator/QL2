import React, { useState, useRef } from "react";
import { Bell, BellOff, Check, Clock, Coins, Download, Eye, Gift, RefreshCw, RotateCcw, Shield, Sparkles, Tag, Upload, User, Volume2, VolumeX, X, Zap } from "lucide-react";
import { Avatar, AVATAR_SEEDS } from "../../components/Avatar";
import { formatXp, formatDuration } from "../../game/xpEngine";
import { ensureEnergyState, getEnergyVisuals, isEnergyActive } from "../../game/energyEngine";
import { getPlayerRank, getXpProgressDetails } from "../../game/selectors";
import { soundManager } from "../../game/audio";
import { GameState } from "../../game/types";
import { RANK_FAMILIES } from "../../game/rankFamilies";
import { RANK_STEPS } from "../../game/rankBuilder";
import { localGameRepository } from "../../storage/LocalGameRepository";
import { redeemCoupon } from "../../game/coupons/couponEngine";
import { requestNotificationPermission, sendTestNotification } from "../../game/notifications";
import {
  subscribeAndRegisterWebPush,
  sendTestServerPush,
  fetchPushDiagnosticStatus,
  syncXpFullPushSchedule,
  getDevicePushId,
  isPushSupported,
} from "../../game/pushManager";
import { performAppUpdate } from "../../app-update/appUpdateService";
import { APP_BUILD_ID, getShortBuildId } from "../../app-update/buildInfo";
import { getInstalledBuildVersion, fetchLatestVersion } from "../../app-update/versionService";
import { CommandHeader } from "../../components/military/MilitaryUI";
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from "../../components/overlay/AppOverlay";

type ProfileScreenProps = {
  state: GameState;
  onUpdateState: (updater: (draft: GameState) => void) => void;
  onResetGame: () => void;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  state,
  onUpdateState,
  onResetGame,
}) => {
  const currentRank = getPlayerRank(state);
  const xpDetails = getXpProgressDetails(state);
  const currentFamily = RANK_FAMILIES.find((f) => f.id === currentRank.familyId) || RANK_FAMILIES[0];

  const energyState = ensureEnergyState(state);
  const energyPercent = Math.max(0, Math.min(100, energyState.percent));
  const isDelegation = state.time.currentEarningMode === "delegation";
  const active = isEnergyActive(state, state.time.currentEarningMode);
  const energyVisuals = getEnergyVisuals(energyPercent, active);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(state.player.displayName);
  const [profileModal, setProfileModal] = useState<"avatar" | "coupon" | null>(null);
  const [importJson, setImportJson] = useState("");
  const [showImportBox, setShowImportBox] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponNotice, setCouponNotice] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isUpdatingApp, setIsUpdatingApp] = useState(false);
  const [updateNotice, setUpdateNotice] = useState<string | null>(null);
  const [installedBuildId, setInstalledBuildId] = useState<string>("");
  const [latestServerBuildId, setLatestServerBuildId] = useState<string | null>(null);
  const [swState, setSwState] = useState<string>("Không rõ");

  React.useEffect(() => {
    const installed = getInstalledBuildVersion();
    setInstalledBuildId(installed?.buildId || "Chưa có (legacy)");

    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) {
          setSwState("Chưa đăng ký");
        } else if (reg.waiting) {
          setSwState("Đang chờ kích hoạt");
        } else if (reg.active) {
          setSwState("Đang hoạt động");
        } else {
          setSwState("Đang cài đặt");
        }
      }).catch(() => setSwState("Lỗi"));
    }

    fetchLatestVersion()
      .then((manifest) => setLatestServerBuildId(manifest.buildId))
      .catch(() => {});
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn một tệp hình ảnh hợp lệ!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 256;
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        canvas.width = maxDim;
        canvas.height = maxDim;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, maxDim, maxDim);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          onUpdateState((draft) => {
            draft.player.avatarSeed = dataUrl;
          });
          soundManager.playClick();
          setProfileModal(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateState((draft) => {
        draft.player.displayName = nameInput.trim();
      });
    }
    setIsEditingName(false);
  };

  const handleSelectAvatar = (seed: string) => {
    onUpdateState((draft) => {
      draft.player.avatarSeed = seed;
    });
    soundManager.playClick();
    setProfileModal(null);
  };

  const handleToggleSound = () => {
    soundManager.playClick();
    onUpdateState((draft) => {
      draft.settings.soundEnabled = !draft.settings.soundEnabled;
    });
  };

  const handleToggleReducedMotion = () => {
    soundManager.playClick();
    onUpdateState((draft) => {
      draft.settings.reducedMotion = !draft.settings.reducedMotion;
    });
  };

  const [pushStatusData, setPushStatusData] = useState<any>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isTestingPush, setIsTestingPush] = useState(false);

  const loadPushDiagnostics = async () => {
    const data = await fetchPushDiagnosticStatus();
    setPushStatusData(data);
  };

  const handleToggleNotifications = async () => {
    soundManager.playClick();
    const nextState = !state.settings.notificationsEnabled;
    if (nextState) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "denied") {
          alert("Quyền gửi thông báo đang bị chặn trong cài đặt trình duyệt. Vui lòng bật quyền thông báo trong cài đặt trang web!");
        } else {
          alert("Chưa cấp quyền thông báo trình duyệt.");
        }
        onUpdateState((draft) => {
          draft.settings.notificationsEnabled = false;
        });
        return;
      }

      setExportNotice("Đang đăng ký dịch vụ Web Push với máy chủ...");
      const regSuccess = await subscribeAndRegisterWebPush();
      if (regSuccess) {
        onUpdateState((draft) => {
          draft.settings.notificationsEnabled = true;
        });
        await syncXpFullPushSchedule({ ...state, settings: { ...state.settings, notificationsEnabled: true } }, true);
        setExportNotice("Đã bật thông báo thiết bị và đồng bộ lịch XP đầy thành công!");
        loadPushDiagnostics();
      } else {
        alert("Không thể đăng ký Web Push với máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại!");
        onUpdateState((draft) => {
          draft.settings.notificationsEnabled = false;
        });
        setExportNotice(null);
        return;
      }
    } else {
      onUpdateState((draft) => {
        draft.settings.notificationsEnabled = false;
      });
      await syncXpFullPushSchedule({ ...state, settings: { ...state.settings, notificationsEnabled: false } }, true);
      setExportNotice("Đã tắt thông báo thiết bị.");
      loadPushDiagnostics();
    }
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleTestBackgroundPush = async () => {
    soundManager.playClick();
    setIsTestingPush(true);
    setExportNotice("Đang gửi lệnh yêu cầu máy chủ phát Web Push nền...");
    try {
      const result = await sendTestServerPush();
      if (result.success) {
        setExportNotice(`Thành công: ${result.message}`);
      } else {
        setExportNotice(`Thất bại: ${result.message}`);
      }
      loadPushDiagnostics();
    } catch (err: any) {
      setExportNotice(`Lỗi: ${err.message}`);
    } finally {
      setIsTestingPush(false);
      setTimeout(() => setExportNotice(null), 5000);
    }
  };

  const handleTestLocalNotification = async () => {
    soundManager.playClick();
    const localResult = await sendTestNotification();
    setExportNotice(localResult.message);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleExport = async () => {
    soundManager.playClick();
    const json = await localGameRepository.export();
    navigator.clipboard.writeText(json);
    setExportNotice("Đã sao chép dữ liệu lưu trữ vào bộ nhớ tạm!");
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleImport = async () => {
    soundManager.playClick();
    if (!importJson.trim()) return;
    try {
      await localGameRepository.import(importJson);
      window.location.reload();
    } catch (err) {
      alert("Dữ liệu nhập không hợp lệ! Vui lòng kiểm tra lại mã JSON.");
    }
  };

  const handleManualUpdate = async () => {
    soundManager.playClick();
    if (isUpdatingApp) return;

    setIsUpdatingApp(true);
    setUpdateNotice("Đang sao lưu tiến trình, xoá cache và tải phiên bản mới nhất...");

    await performAppUpdate({
      currentState: state,
      onStateChange: (updateState) => {
        if (updateState.status === "backing-up") {
          setUpdateNotice("Đang sao lưu tiến trình...");
        } else if (updateState.status === "installing") {
          setUpdateNotice("Đang tải phiên bản mới...");
        } else if (updateState.status === "reloading") {
          setUpdateNotice("Đang hoàn tất cập nhật...");
        } else if (updateState.status === "error") {
          setIsUpdatingApp(false);
          setUpdateNotice(updateState.message);
        }
      },
    });
  };

  const handleRedeemCoupon = (codeToRedeem?: string) => {
    soundManager.playClick();
    const input = (codeToRedeem !== undefined ? codeToRedeem : couponInput).trim();
    if (!input) {
      setCouponNotice({ message: "Vui lòng nhập mã coupon.", type: "error" });
      return;
    }

    // Evaluate redemption against a snapshot clone of current state
    const draftClone = JSON.parse(JSON.stringify(state)) as GameState;
    const result = redeemCoupon(draftClone, input);

    if (!result.success) {
      setCouponNotice({ message: result.message, type: "error" });
      return;
    }

    // Commit state mutation to main game store
    onUpdateState((draft) => {
      redeemCoupon(draft, input);
    });

    setCouponInput("");
    setCouponNotice({ message: result.message, type: "success" });
  };

  return (
    <div className="command-screen personnel-command-screen w-full max-w-lg mx-auto p-4 select-none pb-28 space-y-4">
      <CommandHeader
        title="Hồ Sơ Quân Vụ"
        subtitle="Thông tin cá nhân · Thiết lập · Quản trị dữ liệu"
        icon={<User />}
      />

      {/* Profile HUD Card */}
      <div className="command-panel personnel-record theme-card-accent relative rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/80 border p-4 shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Glow corner */}
        <div className="theme-corner-glow absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          {/* Avatar button */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setProfileModal("avatar");
            }}
            className="theme-focus relative group transition-transform hover:scale-105 rounded-full focus:outline-none"
            title="Đổi ảnh đại diện"
          >
            <Avatar seed={state.player.avatarSeed} size={72} />
            <div className="theme-text-accent absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold">
              Sửa
            </div>
          </button>

          {/* Player details */}
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="theme-input bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-sm text-slate-100 font-bold focus:outline-none"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="theme-button-primary theme-focus p-1.5 rounded-lg font-bold text-xs focus:outline-none"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100 tracking-wide">
                  {state.player.displayName}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="theme-text-accent theme-focus text-xs font-semibold underline rounded focus:outline-none"
                >
                  Sửa
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 mt-1">
              <span className="theme-badge text-xs font-semibold px-2 py-0.5 rounded-full border">
                {currentRank.displayName}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-1">
              Tham gia: {new Date(state.player.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
      </div>

      {/* Năng Lượng Card (HUB UI cá nhân) */}
      <div className="command-panel relative rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-slate-700/80 p-4 shadow-xl backdrop-blur-md overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${energyVisuals.textColor} animate-pulse`} />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              NĂNG LƯỢNG
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${energyVisuals.borderColor} ${energyVisuals.textColor} bg-slate-950/60`}>
              {isDelegation ? "XP x1" : energyVisuals.label}
            </span>
            <span className={`text-sm font-black ${energyVisuals.textColor}`}>
              {Math.round(energyPercent)}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative w-full h-3 rounded-full bg-slate-950 border border-slate-700/80 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 ${energyVisuals.bgColor} ${energyVisuals.glowColor}`}
            style={{ width: `${Math.max(2, energyPercent)}%` }}
          />
        </div>

        {/* Note */}
        {isDelegation ? (
          <div className="mt-2 text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
            <span>Tạm dừng khi Ủy Thác. Energy giữ nguyên.</span>
          </div>
        ) : (
          <div className="mt-2 text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Tự động hồi 100% lúc 00:00 hàng ngày</span>
            <span className={`font-semibold ${energyVisuals.textColor}`}>
              {active
                ? energyPercent >= 67
                  ? "Thần tốc (x4)"
                  : energyPercent >= 33
                  ? "Gia tốc (x3)"
                  : energyPercent > 0
                  ? "Tăng tốc (x2)"
                  : "Cạn kiệt (x1)"
                : "Boost tạm dừng"}
            </span>
          </div>
        )}
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="tactical-card bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Tổng XP Tích Lũy</span>
            <Zap className="theme-icon-accent w-4 h-4" />
          </div>
          <span className="theme-text-accent text-lg font-extrabold">
            {formatXp(state.progression.totalXpEarnedTicks)}
          </span>
        </div>

        <div className="tactical-card bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Quân Hàm Đã Qua</span>
            <Shield className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-lg font-extrabold text-sky-300">
            {state.progression.currentRankIndex + 1} / {RANK_STEPS.length}
          </span>
        </div>

        <div className="tactical-card bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Thời Gian Online</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-sm font-bold text-slate-200">
            {formatDuration(state.time.directOnlineTimeMs)}
          </span>
        </div>

        <div className="tactical-card bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Thời Gian Ủy Thác</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-sm font-bold text-slate-200">
            {formatDuration(state.time.delegationTimeMs)}
          </span>
        </div>
      </div>

      {/* Coupon / Gift Code Section */}
      <div className="command-panel theme-card-accent bg-gradient-to-b from-slate-900/80 to-slate-950/90 border p-4 rounded-2xl space-y-3 shadow-xl backdrop-blur-md">
        <div className="theme-divider flex items-center justify-between border-b pb-2">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Gift className="theme-icon-accent w-4 h-4" />
            <span>Mã Ưu Đãi</span>
          </h3>
          <span className="text-[10px] font-semibold text-amber-400/80 uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            Quà Tặng
          </span>
        </div>

        <div className="space-y-2">
          {/* Tap-to-open Popup Trigger Bar */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setProfileModal("coupon");
            }}
            className="theme-focus theme-hover-border w-full flex items-center justify-between gap-3 bg-slate-950/90 hover:bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 transition-all group active:scale-[0.99] text-left shadow-inner focus:outline-none"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Tag className="theme-icon-accent w-4 h-4 shrink-0" />
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 tracking-wider truncate uppercase">
                BẤM ĐỂ NHẬP MÃ
              </span>
            </div>
            <div className="theme-button-primary flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg text-xs font-black shadow transition-all">
              <Coins className="w-3.5 h-3.5" />
              <span>Nhập Mã</span>
            </div>
          </button>

          {couponNotice && (
            <div
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                couponNotice.type === "success"
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-950/60 border-rose-500/40 text-rose-300"
              }`}
            >
              {couponNotice.type === "success" ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Shield className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{couponNotice.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Settings Section */}
      <div className="command-panel bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-4 shadow-lg">
        <h3 className="theme-divider font-bold text-sm text-slate-100 flex items-center gap-2 border-b pb-2">
          <Sparkles className="theme-icon-accent w-4 h-4" />
          <span>Cài Đặt Ứng Dụng</span>
        </h3>

        <span className="technical-label">Âm thanh & hiển thị</span>

        {/* Audio Toggle */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-slate-300 font-medium">Âm thanh & Hiệu ứng</span>
          <button
            type="button"
            onClick={handleToggleSound}
            className={`theme-focus p-2 rounded-xl border transition-all flex items-center gap-2 focus:outline-none ${
              state.settings.soundEnabled
                ? "theme-badge"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            {state.settings.soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Bật</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Tắt</span>
              </>
            )}
          </button>
        </div>

        {/* Reduced Motion Toggle */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-slate-300 font-medium">Giảm chuyển động (Reduced Motion)</span>
          <button
            type="button"
            onClick={handleToggleReducedMotion}
            className={`theme-focus p-2 rounded-xl border transition-all flex items-center gap-2 focus:outline-none ${
              state.settings.reducedMotion
                ? "theme-badge"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{state.settings.reducedMotion ? "Bật" : "Tắt"}</span>
          </button>
        </div>

        <div className="tactical-divider" aria-hidden="true" />
        <span className="technical-label">Thông báo</span>

        {/* Device Notifications Toggle & Testing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex flex-col">
              <span className="text-slate-300 font-medium">Thông báo thiết bị (Web Push)</span>
              <span className="text-[10px] text-slate-400">Tự động đánh thức và báo khi XP đầy cả khi đóng app</span>
            </div>
            <button
              type="button"
              onClick={handleToggleNotifications}
              className={`theme-focus p-2 rounded-xl border transition-all flex items-center gap-2 focus:outline-none ${
                state.settings.notificationsEnabled
                  ? "theme-badge"
                  : "bg-slate-800 border-slate-700 text-slate-400"
              }`}
            >
              {state.settings.notificationsEnabled ? (
                <>
                  <Bell className="w-4 h-4" />
                  <span>Bật</span>
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4" />
                  <span>Tắt</span>
                </>
              )}
            </button>
          </div>

          {state.settings.notificationsEnabled && (
            <div className="pt-1.5 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isTestingPush}
                onClick={handleTestBackgroundPush}
                className="theme-button-secondary theme-focus flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 focus:outline-none"
                title="Kiểm tra gửi thông báo nền qua Web Push server"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isTestingPush ? "Đang gửi..." : "Kiểm tra Web Push nền"}</span>
              </button>

              <button
                type="button"
                onClick={handleTestLocalNotification}
                className="py-1.5 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 text-xs font-medium transition-colors"
                title="Kiểm tra thông báo cục bộ của trình duyệt"
              >
                <span>Thử Cục Bộ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!showDiagnostics) {
                    loadPushDiagnostics();
                  }
                  setShowDiagnostics(!showDiagnostics);
                }}
                className="py-1.5 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-sky-300 text-xs font-medium transition-colors"
                title="Xem chẩn đoán chi tiết Web Push"
              >
                <span>{showDiagnostics ? "Đóng Chẩn Đoán" : "Chẩn Đoán Push"}</span>
              </button>
            </div>
          )}

          {/* Web Push Diagnostic Inspector */}
          {state.settings.notificationsEnabled && showDiagnostics && (
            <div className="mt-2 p-3 rounded-xl bg-slate-950/90 border border-sky-900/60 space-y-1.5 text-[11px] text-slate-300 font-mono">
              <div className="flex items-center justify-between text-sky-400 font-bold border-b border-slate-800 pb-1">
                <span>CHẨN ĐOÁN WEB PUSH</span>
                <button
                  type="button"
                  onClick={loadPushDiagnostics}
                  className="theme-text-accent theme-focus text-[10px] hover:underline flex items-center gap-1 rounded focus:outline-none"
                >
                  <RefreshCw className="w-3 h-3" /> Làm mới
                </button>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Mã thiết bị:</span>
                <span className="text-slate-200">{getDevicePushId() ? `${getDevicePushId().slice(0, 8)}...` : "Chưa có"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Push API hỗ trợ:</span>
                <span className={isPushSupported() ? "text-emerald-400" : "text-rose-400"}>
                  {isPushSupported() ? "Có" : "Không"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quyền trình duyệt:</span>
                <span className={typeof Notification !== "undefined" && Notification.permission === "granted" ? "text-emerald-400" : "text-amber-400"}>
                  {typeof Notification === "undefined"
                    ? "Không hỗ trợ"
                    : Notification.permission === "granted"
                      ? "Đã cho phép"
                      : Notification.permission === "denied"
                        ? "Đã từ chối"
                        : "Chưa quyết định"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Máy chủ đăng ký:</span>
                <span className={pushStatusData?.registered ? "text-emerald-400" : "text-amber-400"}>
                  {pushStatusData?.registered ? "Đã đăng ký (Firestore)" : "Chưa tìm thấy"}
                </span>
              </div>

              {pushStatusData?.schedule && (
                <>
                  <div className="flex justify-between border-t border-slate-800/80 pt-1">
                    <span className="text-slate-400">Lịch XP đầy:</span>
                    <span className="text-amber-300 font-bold">{pushStatusData.schedule.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Thời điểm hẹn:</span>
                    <span className="text-slate-200">
                      {pushStatusData.schedule.dueAt ? new Date(pushStatusData.schedule.dueAt).toLocaleTimeString("vi-VN") : "Không có"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Loại tác vụ:</span>
                    <span className="text-slate-200">{pushStatusData.schedule.taskKind || "final"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mã lịch:</span>
                    <span className="text-slate-400">{pushStatusData.schedule.generation || "Không có"}</span>
                  </div>
                </>
              )}

              {pushStatusData?.diagnostics?.lastPushSuccessAt && (
                <div className="flex justify-between border-t border-slate-800/80 pt-1">
                  <span className="text-slate-400">Push thành công gần nhất:</span>
                  <span className="text-emerald-400">
                    {new Date(pushStatusData.diagnostics.lastPushSuccessAt).toLocaleTimeString("vi-VN")}
                  </span>
                </div>
              )}

              {pushStatusData?.diagnostics?.lastPushFailureAt && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Push lỗi gần nhất:</span>
                  <span className="text-rose-400">
                    {new Date(pushStatusData.diagnostics.lastPushFailureAt).toLocaleTimeString("vi-VN")} ({pushStatusData.diagnostics.lastPushStatusCode || "err"})
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <span className="technical-label">Dữ liệu & hệ thống</span>

        {/* Export / Import, Manual Update & Reset */}
        <div className="pt-2 border-t border-slate-800 space-y-2.5">
          {/* Detailed Version Debug Info */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Bản dựng đang chạy:</span>
              <span className="theme-text-accent font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                {getShortBuildId(APP_BUILD_ID)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Bản dựng đã cài:</span>
              <span className="font-mono text-[11px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                {getShortBuildId(installedBuildId)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Bản mới trên máy chủ:</span>
              <span className="font-mono text-[11px] text-sky-300 font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                {latestServerBuildId ? getShortBuildId(latestServerBuildId) : "Đang kiểm tra..."}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Bộ cập nhật nền:</span>
              <span className="font-semibold text-slate-200">{swState}</span>
            </div>
          </div>

          {/* Manual Update Button */}
          <button
            type="button"
            disabled={isUpdatingApp}
            onClick={handleManualUpdate}
            className="theme-button-secondary theme-focus w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm focus:outline-none"
          >
            <RefreshCw className={`theme-icon-accent w-4 h-4 ${isUpdatingApp ? "animate-spin" : ""}`} />
            <span>{isUpdatingApp ? "Đang Xoá Cache & Cập Nhật..." : "Cập Nhật Thủ Công Phiên Bản Mới"}</span>
          </button>

          {updateNotice && (
            <p className="theme-text-accent text-xs text-center font-medium animate-pulse">
              {updateNotice}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Dữ Liệu</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setShowImportBox(!showImportBox);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Nhập Dữ Liệu</span>
            </button>
          </div>

          {exportNotice && (
            <p className="text-xs text-emerald-400 text-center font-semibold animate-pulse">
              {exportNotice}
            </p>
          )}

          {showImportBox && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-700 space-y-2">
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder="Dán mã JSON dữ liệu trò chơi vào đây..."
                className="theme-input w-full h-20 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={handleImport}
                className="w-full py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
              >
                Xác Nhận Nhập
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              if (confirm("Bạn có chắc chắn muốn đặt lại toàn bộ tiến trình trò chơi?")) {
                onResetGame();
              }
            }}
            className="danger-zone w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors mt-3"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt Lại Tiến Trình Trò Chơi</span>
          </button>
        </div>
      </div>

      {/* Avatar Selection Modal */}
      {profileModal === "avatar" && (
        <AppModal size="compact" archetype="transaction"
          onClose={() => setProfileModal(null)}
          labelledBy="avatar-picker-title"
        >
          <OverlayHeader className="flex items-center justify-between">
            <h3 id="avatar-picker-title" className="modal-title min-w-0">Chọn Ảnh Đại Diện</h3>
            <ModalButton variant="icon"
              type="button"
              onClick={() => setProfileModal(null)}
              aria-label="Đóng chọn ảnh đại diện"
              data-overlay-close
            >
              <X className="mx-auto h-4 w-4" />
            </ModalButton>
          </OverlayHeader>

          <OverlayBody>
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Custom Upload Button */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                fileInputRef.current?.click();
              }}
              className="modal-control theme-button-primary theme-focus w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 focus:outline-none"
            >
              <Upload className="w-4 h-4" />
              <span>Tải Ảnh Từ Thư Viện Về/Máy</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-2 text-xs text-[var(--modal-muted)] font-semibold uppercase tracking-wider absolute">
                Hoặc Chọn Mẫu Mặc Định
              </span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-4 gap-3 pt-2 pb-1">
              {AVATAR_SEEDS.map((seed) => (
                <button
                  key={seed}
                  type="button"
                  onClick={() => handleSelectAvatar(seed)}
                  className={`modal-control p-1 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                    state.player.avatarSeed === seed ? "modal-control theme-avatar-selected" : "modal-control "
                  }`}
                >
                  <Avatar seed={seed} size={54} />
                </button>
              ))}
            </div>
          </OverlayBody>

          <OverlayFooter>
            <ModalButton variant="ghost"
              type="button"
              onClick={() => setProfileModal(null)}
              className="w-full"
            >
              Hủy
            </ModalButton>
          </OverlayFooter>
        </AppModal>
      )}

      {/* Coupon / Gift Code Popup Modal */}
      {profileModal === "coupon" && (
        <AppModal size="compact" archetype="transaction"
          onClose={() => setProfileModal(null)}
          closeOnBackdrop
          labelledBy="coupon-modal-title"
        >
            {/* Modal Header */}
            <OverlayHeader className="theme-divider flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="theme-badge w-8 h-8 rounded-xl border flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="coupon-modal-title" className="modal-title">
                    Nhập Mã Ưu Đãi
                  </h3>
                  <p className="modal-copy">
                    Nhận Vàng quà tặng từ mã sự kiện
                  </p>
                </div>
              </div>
              <ModalButton variant="icon"
                type="button"
                onClick={() => setProfileModal(null)}
                aria-label="Đóng nhập mã ưu đãi"
              >
                <X className="w-4 h-4" />
              </ModalButton>
            </OverlayHeader>

            {/* Input & Form */}
            <OverlayBody>
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--modal-muted)] mb-1.5 tracking-wider">
                  Mã Quà Tặng
                </label>
                <input
                  type="text"
                  autoFocus
                  data-overlay-autofocus
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase());
                    if (couponNotice) setCouponNotice(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRedeemCoupon();
                    }
                  }}
                  placeholder="BẤM ĐỂ NHẬP MÃ"
                  className="theme-input theme-text-accent w-full bg-slate-950 border-2 border-slate-700/80 rounded-2xl px-4 py-3 text-base font-mono font-semibold uppercase tracking-widest placeholder:text-[var(--modal-muted)] placeholder:font-sans placeholder:text-xs placeholder:tracking-normal focus:outline-none transition-all text-center"
                  maxLength={30}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>

              {couponNotice && (
                <div
                  className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
                    couponNotice.type === "success"
                      ? "bg-emerald-950/70 border-emerald-500/50 text-[var(--modal-success)]"
                      : "bg-rose-950/70 border-rose-500/50 text-[var(--modal-danger)]"
                  }`}
                >
                  {couponNotice.type === "success" ? (
                    <Check className="w-4 h-4 text-[var(--modal-success)] shrink-0" />
                  ) : (
                    <Shield className="w-4 h-4 text-[var(--modal-danger)] shrink-0" />
                  )}
                  <span className="leading-snug">{couponNotice.message}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setProfileModal(null)}
                  className="modal-control theme-focus flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-[var(--modal-text)] font-bold text-xs transition-all active:scale-95 focus:outline-none"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => handleRedeemCoupon()}
                  className="modal-control theme-button-primary theme-focus flex-[2] py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 focus:outline-none"
                >
                  <Coins className="w-4 h-4" />
                  <span>XÁC NHẬN</span>
                </button>
              </div>
            </OverlayBody>
        </AppModal>
      )}
    </div>
  );
};
