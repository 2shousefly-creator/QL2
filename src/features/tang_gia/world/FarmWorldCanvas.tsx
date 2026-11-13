import React, { useRef, useState } from 'react';
import {
  ArrowUpCircle,
  Bird,
  BookOpen,
  Bug,
  CircleAlert,
  ClipboardCheck,
  CloudRain,
  CloudSun,
  Coins,
  Crosshair,
  Droplets,
  Egg,
  Eye,
  EyeOff,
  FlaskConical,
  Info,
  LocateFixed,
  Lock,
  Map as MapIcon,
  Moon,
  RefreshCw,
  Shovel,
  Sprout,
  Store,
  Sun,
  UserRound,
  Utensils,
  Volume2,
  VolumeX,
  Warehouse,
  Wheat,
  Wind,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { PixiSceneHost } from '../../../components/core-visual/pixi/PixiSceneHost';
import { QUALITY_CONFIG } from '../weatherEngine';
import { createFarmWorldScene, type FarmWorldControls, type FarmWorldProps } from './FarmWorldScene';
import './farm-world.css';

class WorldBoundary extends React.Component<
  { fallback: React.ReactNode; onFailure(): void; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function IconButton({
  label,
  disabled,
  pressed,
  warning,
  className,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  pressed?: boolean;
  warning?: boolean;
  className?: string;
  onClick(): void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      title={label}
      disabled={disabled}
      aria-pressed={pressed}
      data-warning={warning || undefined}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function getMinimapCellState(plot: FarmWorldProps['snapshot']['plots'][number]) {
  if (plot.status === 'locked') return 'locked';
  if (plot.status === 'ready') return 'ready';
  if (plot.pest) return 'pest';
  if (plot.moisture < 40) return 'thirsty';
  if (plot.status === 'growing') return 'growing';
  return 'empty';
}

export function FarmWorldCanvas({
  model,
  reducedMotion,
}: {
  model: Omit<FarmWorldProps, 'publish'>;
  reducedMotion: boolean;
}) {
  const control = useRef<FarmWorldControls | null>(null);
  const [failed, setFailed] = useState(false);
  const [assetFailed, setAssetFailed] = useState(false);
  const [following, setFollowing] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [showPlotInfo, setShowPlotInfo] = useState(true);
  const [minimapOpen, setMinimapOpen] = useState(true);

  const s = model.snapshot;
  const blocked = model.blocked;
  const selectedPlot =
    model.selectedPlot === null ? null : s.plots[model.selectedPlot] ?? null;
  const selectedAnimal = model.selectedAnimal
    ? s.animals.find((a) => a.id === model.selectedAnimal) ?? null
    : null;

  const WeatherIcon =
    s.weather === 'rain'
      ? CloudRain
      : s.weather === 'sunny'
        ? s.phase === 'night'
          ? Moon
          : Sun
        : s.weather === 'cool'
          ? CloudSun
          : Wind;

  const semantics = (
    <div
      className={failed ? 'farm-world-fallback' : 'sr-only'}
      aria-label="Đối tượng nông trại"
    >
      {s.plots.map((p) => (
        <button
          key={p.index}
          disabled={blocked}
          onClick={() => model.selectPlot(p.index)}
        >
          {p.index + 1}. {p.title} ·{' '}
          {p.status === 'locked' ? 'Chưa khai hoang' : p.timer || 'Ô trống'} · Độ ẩm{' '}
          {Math.round(p.moisture)}%{p.thirsty ? ' · Cần nước' : ''}
          {p.pest ? ' · Có sâu' : ''}
        </button>
      ))}
      {s.animals.map((a) => (
        <button
          key={a.id}
          disabled={blocked}
          onClick={() => model.selectAnimal(a.id)}
        >
          {a.title} · {a.timer}
        </button>
      ))}
      <button disabled={blocked} onClick={model.openTrough}>
        Máng ăn · {s.feedLabel}
      </button>
      <button disabled={blocked} onClick={model.openPen}>
        Chuồng nuôi
      </button>
      <button disabled={blocked} onClick={model.openEggs}>
        Kho trứng · {s.eggs}
      </button>
    </div>
  );

  const fallback = (
    <div className="farm-world-recovery">
      <p>Chế độ tối giản — dữ liệu và nông dân vẫn tiếp tục.</p>
      <button
        onClick={() => {
          setFailed(false);
          setAttempt((x) => x + 1);
        }}
      >
        Thử mở lại cảnh
      </button>
      <div className="farm-world-fallback">{semantics.props.children}</div>
    </div>
  );

  const focus = (target: 'garden' | 'pen' | 'worker' | 'center') => {
    control.current?.focus(target);
    if (target === 'garden' || target === 'pen') model.selectTab(target);
  };

  const hasBatchActions =
    s.batchCounts.dryPlots > 0 ||
    s.batchCounts.pestPlots > 0 ||
    s.batchCounts.replantPlots > 0 ||
    s.batchCounts.readyPlots > 0;

  return (
    <div
      className="farm-world-shell farm-world-shell--compact"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="farm-world-hud">
        <div className="farm-world-wallet" aria-label={`Ví Tăng Gia: ${s.gold} vàng`}>
          <Coins aria-hidden="true" />
          <strong>{s.gold}</strong>
        </div>
        <IconButton
          className="farm-weather-chip"
          label={`${s.seasonLabel} · ${s.weatherLabel}`}
          disabled={blocked}
          onClick={model.openWeather}
        >
          <WeatherIcon aria-hidden="true" />
          <span>{s.seasonLabel}</span>
          {s.phase === 'night' && s.weather !== 'sunny' && (
            <Moon className="farm-icon-badge" aria-hidden="true" />
          )}
        </IconButton>
        {model.onToggleSound && (
          <IconButton
            label={model.soundEnabled === false ? 'Bật âm thanh' : 'Tắt âm thanh'}
            pressed={model.soundEnabled !== false}
            disabled={blocked}
            onClick={model.onToggleSound}
          >
            {model.soundEnabled === false ? (
              <VolumeX aria-hidden="true" />
            ) : (
              <Volume2 aria-hidden="true" />
            )}
          </IconButton>
        )}
        <IconButton
          label={showPlotInfo ? 'Ẩn thông tin cây' : 'Hiện thông tin cây'}
          pressed={showPlotInfo}
          disabled={blocked}
          onClick={() => setShowPlotInfo((v) => !v)}
        >
          {showPlotInfo ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
        </IconButton>
        <IconButton label="Nội dung cập nhật" disabled={blocked} onClick={model.openRelease}>
          <Info aria-hidden="true" />
        </IconButton>
      </div>

      <nav className="farm-world-navigation" aria-label="Camera nông trại">
        {(
          [
            ['garden', 'Đến vườn', Sprout],
            ['pen', 'Đến chuồng nuôi', Bird],
            ['worker', 'Đến nông dân', UserRound],
            ['center', 'Về trung tâm', LocateFixed],
          ] as const
        ).map(([target, label, Icon]) => (
          <IconButton
            key={target}
            label={label}
            disabled={blocked}
            onClick={() => focus(target)}
          >
            <Icon aria-hidden="true" />
          </IconButton>
        ))}
        <IconButton
          label={following ? 'Dừng theo dõi nông dân' : 'Theo dõi nông dân'}
          pressed={following}
          disabled={blocked}
          onClick={() => control.current?.follow(!following)}
        >
          <Crosshair aria-hidden="true" />
        </IconButton>
        <IconButton
          label="Thu nhỏ"
          disabled={blocked}
          onClick={() => control.current?.zoom(0.85)}
        >
          <ZoomOut aria-hidden="true" />
        </IconButton>
        <IconButton
          label="Phóng to"
          disabled={blocked}
          onClick={() => control.current?.zoom(1.18)}
        >
          <ZoomIn aria-hidden="true" />
        </IconButton>
        <IconButton
          label={minimapOpen ? 'Thu gọn bản đồ nhỏ' : 'Mở bản đồ nhỏ'}
          pressed={minimapOpen}
          disabled={blocked}
          onClick={() => setMinimapOpen((v) => !v)}
        >
          <MapIcon aria-hidden="true" />
        </IconButton>
      </nav>

      <div
        className="farm-world-viewport"
        onKeyDown={(e) => {
          if (e.key === 'Escape') model.clearSelection();
        }}
      >
        {failed ? (
          fallback
        ) : (
          <WorldBoundary key={attempt} fallback={fallback} onFailure={() => setFailed(true)}>
            <PixiSceneHost
              factory={createFarmWorldScene}
              visualProps={{
                ...model,
                showPlotInfo,
                publish: (controls, assetsFailed, isFollowing) => {
                  control.current = controls;
                  queueMicrotask(() => {
                    setAssetFailed(assetsFailed);
                    setFollowing(isFollowing);
                  });
                },
              }}
              reducedMotion={reducedMotion || !!blocked}
              onUnavailable={() => setFailed(true)}
            />
          </WorldBoundary>
        )}

        {assetFailed && !failed && (
          <div className="farm-world-asset-warning" role="status">
            Một số ảnh chưa tải được.{' '}
            <button onClick={() => control.current?.retry()}>Tải lại ảnh</button>
            <button onClick={() => setFailed(true)}>Chế độ tối giản</button>
          </div>
        )}

        {!failed && minimapOpen && (
          <div className="farm-world-minimap" aria-label="Bản đồ nhanh nông trại">
            <div className="farm-minimap-head">
              <span>Bản đồ nhanh</span>
              <button
                type="button"
                className="farm-minimap-close"
                aria-label="Thu gọn bản đồ nhỏ"
                onClick={() => setMinimapOpen(false)}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="farm-minimap-body">
              <div className="farm-minimap-grid">
                {s.plots.map((p) => (
                  <button
                    key={p.index}
                    type="button"
                    disabled={blocked}
                    className="farm-minimap-cell"
                    data-state={getMinimapCellState(p)}
                    data-selected={model.selectedPlot === p.index || undefined}
                    aria-label={`Ô ${p.index + 1}: ${p.title}`}
                    title={`Ô ${p.index + 1}: ${p.title}`}
                    onClick={() => {
                      control.current?.focusPlot(p.index);
                      model.selectPlot(p.index);
                    }}
                  />
                ))}
              </div>
              <button
                type="button"
                disabled={blocked}
                className="farm-minimap-pen"
                data-warning={
                  (s.feed <= 20 || s.animals.some((a) => a.dead)) && s.animals.length > 0
                    ? true
                    : undefined
                }
                aria-label="Đến chuồng nuôi"
                onClick={() => focus('pen')}
              >
                <Bird className="h-3.5 w-3.5" />
                <span>
                  {s.animals.length}/{s.capacity}
                </span>
              </button>
            </div>
          </div>
        )}

        {!failed && (selectedPlot || selectedAnimal) && (
          <aside className="farm-world-selection" aria-live="polite">
            <div className="farm-world-selection-head">
              <div className="farm-world-selection-title">
                <strong className="truncate">
                  {selectedPlot
                    ? `Ô #${selectedPlot.index + 1} · ${selectedPlot.title}`
                    : selectedAnimal?.title}
                </strong>
                {selectedPlot?.quality && (
                  <span
                    className="farm-world-quality-pill"
                    data-quality={selectedPlot.quality}
                  >
                    {QUALITY_CONFIG[selectedPlot.quality].name}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="farm-sel-close"
                disabled={blocked}
                aria-label="Bỏ chọn"
                onClick={model.clearSelection}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p>{selectedPlot?.timer || selectedAnimal?.timer || (selectedPlot?.status === 'empty' ? 'Sẵn sàng gieo hạt' : '')}</p>
            <p className="text-emerald-100/85">
              {selectedPlot?.detail ?? `Sống còn: ${selectedAnimal?.lifeRemaining}`}
            </p>
            {selectedPlot?.rewardLabel && (
              <p className="text-amber-200 font-semibold">{selectedPlot.rewardLabel}</p>
            )}

            {selectedPlot && selectedPlot.status !== 'locked' && (
              <div className="farm-sel-bars">
                <div className="farm-sel-bar-row">
                  <span>Độ ẩm</span>
                  <div className="farm-sel-bar-track">
                    <div
                      className="farm-sel-bar-fill"
                      style={{
                        width: `${Math.max(0, Math.min(100, selectedPlot.moisture))}%`,
                        background: selectedPlot.thirsty ? '#f59e0b' : '#38bdf8',
                      }}
                    />
                  </div>
                  <span className="text-right">{Math.round(selectedPlot.moisture)}%</span>
                </div>
                {selectedPlot.status === 'growing' && (
                  <>
                    <div className="farm-sel-bar-row">
                      <span>Lớn</span>
                      <div className="farm-sel-bar-track">
                        <div
                          className="farm-sel-bar-fill"
                          style={{
                            width: `${Math.round((selectedPlot.growth ?? 0) * 100)}%`,
                            background: '#4ade80',
                          }}
                        />
                      </div>
                      <span className="text-right">
                        {Math.round((selectedPlot.growth ?? 0) * 100)}%
                      </span>
                    </div>
                    <div className="farm-sel-bar-row">
                      <span>Sâu hại</span>
                      <div className="farm-sel-bar-track">
                        <div
                          className="farm-sel-bar-fill"
                          style={{
                            width: `${Math.round(selectedPlot.pestPressure ?? 0)}%`,
                            background: selectedPlot.pest ? '#ef4444' : '#a3e635',
                          }}
                        />
                      </div>
                      <span className="text-right">
                        {Math.round(selectedPlot.pestPressure ?? 0)}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {selectedAnimal && !selectedAnimal.dead && (
              <div className="farm-sel-bars">
                <div className="farm-sel-bar-row">
                  <span>Tuổi thọ</span>
                  <div className="farm-sel-bar-track">
                    <div
                      className="farm-sel-bar-fill"
                      style={{
                        width: `${Math.round(selectedAnimal.lifeRatio * 100)}%`,
                        background: selectedAnimal.weak ? '#f59e0b' : '#34d399',
                      }}
                    />
                  </div>
                  <span className="text-right">{Math.round(selectedAnimal.lifeRatio * 100)}%</span>
                </div>
              </div>
            )}

            <div className="farm-world-selection-actions">
              {selectedPlot?.status === 'ready' && model.quickHarvestPlot && (
                <button
                  type="button"
                  data-primary="true"
                  disabled={blocked}
                  onClick={model.quickHarvestPlot}
                >
                  <Wheat className="h-3.5 w-3.5" /> Thu hoạch
                </button>
              )}
              {selectedPlot?.status === 'empty' && selectedPlot.canReplant && model.quickReplantPlot && (
                <button
                  type="button"
                  data-primary="true"
                  disabled={blocked}
                  onClick={model.quickReplantPlot}
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Gieo lại
                </button>
              )}
              {selectedPlot?.status === 'empty' && model.openPlantModal && (
                <button
                  type="button"
                  data-primary={!selectedPlot.canReplant || undefined}
                  disabled={blocked}
                  onClick={model.openPlantModal}
                >
                  <Sprout className="h-3.5 w-3.5" /> Gieo hạt
                </button>
              )}
              {selectedPlot?.status === 'locked' && model.unlockSelectedPlot && (
                <button
                  type="button"
                  data-primary="true"
                  disabled={blocked}
                  onClick={model.unlockSelectedPlot}
                >
                  <Lock className="h-3.5 w-3.5" /> Khai hoang
                </button>
              )}
              {selectedPlot &&
                selectedPlot.status !== 'locked' &&
                selectedPlot.moisture < 98 &&
                model.quickWaterPlot && (
                  <button type="button" disabled={blocked} onClick={model.quickWaterPlot}>
                    <Droplets className="h-3.5 w-3.5" /> Tưới
                  </button>
                )}
              {selectedPlot?.pest && model.quickTreatPlot && (
                <button type="button" disabled={blocked} onClick={model.quickTreatPlot}>
                  <Bug className="h-3.5 w-3.5" /> Diệt sâu
                </button>
              )}
              {selectedPlot?.status === 'growing' &&
                !selectedPlot.fertilizer &&
                model.openFertilizeModal && (
                  <button type="button" disabled={blocked} onClick={model.openFertilizeModal}>
                    <FlaskConical className="h-3.5 w-3.5" /> Bón phân
                  </button>
                )}
              {selectedPlot?.status === 'growing' && model.quickClearPlot && (
                <button type="button" disabled={blocked} onClick={model.quickClearPlot}>
                  <Shovel className="h-3.5 w-3.5" /> Nhổ
                </button>
              )}
              {selectedAnimal && model.openTrough && (
                <button
                  type="button"
                  data-primary="true"
                  disabled={blocked}
                  onClick={model.openTrough}
                >
                  <Utensils className="h-3.5 w-3.5" /> Máng ăn
                </button>
              )}
              {selectedAnimal && model.quickDismissAnimal && (
                <button type="button" disabled={blocked} onClick={model.quickDismissAnimal}>
                  <X className="h-3.5 w-3.5" /> {selectedAnimal.dead ? 'Dọn' : 'Đuổi'}
                </button>
              )}
            </div>
          </aside>
        )}
      </div>

      {hasBatchActions && (
        <div className="farm-world-quickbar" aria-label="Thao tác nhanh đồng loạt">
          {s.batchCounts.readyPlots > 0 && model.harvestAll && (
            <button type="button" data-tone="ready" disabled={blocked} onClick={model.harvestAll}>
              <Wheat className="h-3.5 w-3.5" /> Thu tất ({s.batchCounts.readyPlots})
            </button>
          )}
          {s.batchCounts.dryPlots > 0 && model.waterAll && (
            <button type="button" data-tone="water" disabled={blocked} onClick={model.waterAll}>
              <Droplets className="h-3.5 w-3.5" /> Tưới tất ({s.batchCounts.dryPlots})
            </button>
          )}
          {s.batchCounts.pestPlots > 0 && model.treatAll && (
            <button type="button" data-tone="pest" disabled={blocked} onClick={model.treatAll}>
              <Bug className="h-3.5 w-3.5" /> Diệt sâu ({s.batchCounts.pestPlots})
            </button>
          )}
          {s.batchCounts.replantPlots > 0 && model.replantAll && (
            <button type="button" data-tone="replant" disabled={blocked} onClick={model.replantAll}>
              <RefreshCw className="h-3.5 w-3.5" /> Gieo lại ({s.batchCounts.replantPlots})
            </button>
          )}
        </div>
      )}

      <div className="farm-world-pen-status" aria-label="Tình trạng chăn nuôi">
        <IconButton
          disabled={blocked}
          label={`Máng ăn ${s.feedLabel} · ${s.feedRemaining}${s.dangerRemaining ? ` · Nguy hiểm ${s.dangerRemaining}` : ''}`}
          warning={s.feed <= 20}
          onClick={model.openTrough}
        >
          <Utensils aria-hidden="true" />
          <strong>{s.feedLabel}</strong>
          <progress
            aria-label="Thức ăn còn lại"
            max={100}
            value={Math.max(0, Math.min(100, s.feed))}
          />
        </IconButton>
        <IconButton
          disabled={blocked}
          label={`Vật nuôi ${s.animals.length}/${s.capacity}`}
          onClick={model.openPen}
        >
          <Bird aria-hidden="true" />
          <strong>
            {s.animals.length}/{s.capacity}
          </strong>
        </IconButton>
        <IconButton disabled={blocked} label={`Kho trứng ${s.eggs}`} onClick={model.openEggs}>
          <Egg aria-hidden="true" />
          <strong>{s.eggs}</strong>
        </IconButton>
      </div>

      <div className="farm-world-shortcuts">
        <IconButton disabled={blocked} label="Kho" onClick={model.openWarehouse}>
          <Warehouse aria-hidden="true" />
        </IconButton>
        <IconButton disabled={blocked} label="Cửa hàng" onClick={model.openStore}>
          <Store aria-hidden="true" />
        </IconButton>
        <IconButton disabled={blocked} label="Thuê Người" onClick={model.openEmployee}>
          <UserRound aria-hidden="true" />
          {s.worker?.status === 'employed' && <span className="farm-btn-dot" aria-hidden="true" />}
        </IconButton>
        {model.openLogistics && (
          <IconButton
            disabled={blocked}
            label="Đơn Hàng Hậu Cần"
            warning={s.logisticsReadyCount > 0}
            onClick={model.openLogistics}
          >
            <ClipboardCheck aria-hidden="true" />
            {s.logisticsReadyCount > 0 && (
              <span className="farm-btn-badge" aria-hidden="true">
                {s.logisticsReadyCount}
              </span>
            )}
          </IconButton>
        )}
        {model.openUpgrades && (
          <IconButton
            disabled={blocked}
            label="Nâng Cấp Hạ Tầng"
            warning={s.affordableUpgradesCount > 0}
            onClick={model.openUpgrades}
          >
            <ArrowUpCircle aria-hidden="true" />
            {s.affordableUpgradesCount > 0 && (
              <span className="farm-btn-dot" aria-hidden="true" />
            )}
          </IconButton>
        )}
        {model.openAlmanac && (
          <IconButton disabled={blocked} label="Sổ Tay Nông Sản" onClick={model.openAlmanac}>
            <BookOpen aria-hidden="true" />
          </IconButton>
        )}
        {s.plots.some((p) => p.thirsty || p.pest || p.status === 'ready') && (
          <IconButton
            disabled={blocked}
            label="Đến ô cần chăm sóc"
            warning
            onClick={() => {
              const p = s.plots.find((x) => x.pest || x.thirsty || x.status === 'ready');
              if (p) {
                control.current?.focusPlot(p.index);
                model.selectPlot(p.index);
              }
            }}
          >
            <Wheat aria-hidden="true" />
          </IconButton>
        )}
        {(s.feed <= 20 || s.animals.some((a) => a.dead)) && s.animals.length > 0 && (
          <IconButton
            disabled={blocked}
            label="Chuồng cần chăm sóc"
            warning
            onClick={() => control.current?.focus('pen')}
          >
            <CircleAlert aria-hidden="true" />
          </IconButton>
        )}
      </div>

      {semantics}
    </div>
  );
}
