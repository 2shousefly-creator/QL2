import React, { useEffect, useMemo, useRef, useState } from "react";
import { ExclusiveFullscreenOverlay } from "../../../components/overlay/AppOverlay";
import type { GameState } from "../../../game/types";
import { ARMY_TITLE, BALANCE } from "./config";
import { CLASSES, ITEMS, WEAPONS } from "./content/equipment";
import { CHAPTERS, STAGES, objectiveLabel } from "./content/stages";
import { validateContent } from "./content/validate";
import { MAPS } from "./content/world";
import {
  buyItem,
  clears,
  defaultProfile,
  equip,
  level,
  makeTicket,
  reserveRun,
  stageUnlocked,
  upgrade,
} from "./profile/profileEngine";
import {
  localDate,
  settleArmyRun,
  withProfile,
  type UpdateGameState,
} from "./integration/ql2Adapter";
import { loadAssets, sprite, type Assets } from "./render/assets";
import type { ArmyProfile, Loadout, RunResult, RunTicket } from "./types";
import { BattleView } from "./ui/BattleView";
import "./army.css";
interface Props {
  gameState: GameState;
  onUpdateGameState: UpdateGameState;
  onBack: () => void;
}
type Page =
  | "campaign"
  | "equipment"
  | "inventory"
  | "achievements"
  | "help"
  | "settings";
function Portrait({ assets, cosmetic }: { assets: Assets; cosmetic: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvas.current?.getContext("2d");
    if (!c) return;
    c.clearRect(0, 0, 200, 220);
    sprite(c, assets, "gunner", 100, 210, 133, 194);
    sprite(c, assets, "weapon", 142, 150, 78, 45, 0.5, 0.5);
  }, [assets]);
  return (
    <canvas
      width="200"
      height="220"
      ref={canvas}
      className="army-portrait"
      style={{
        filter:
          cosmetic === "steel"
            ? "hue-rotate(125deg)"
            : cosmetic === "amber"
              ? "sepia(.55)"
              : undefined,
      }}
      aria-label="Ngoại hình Pháo Thủ"
    />
  );
}
export default function MobiArmy3Screen({
  gameState,
  onUpdateGameState,
  onBack,
}: Props) {
  const starter = useMemo(defaultProfile, []);
  const futureSave = Boolean(
    gameState.mobiArmy3 && gameState.mobiArmy3.version !== 1,
  );
  const p: ArmyProfile = futureSave
    ? starter
    : (gameState.mobiArmy3 ?? starter);
  const [page, setPage] = useState<Page>("campaign"),
    [stageId, setStageId] = useState(
      () => STAGES.find((s) => !p.records[s.id]?.clears)?.id ?? "s15",
    );
  const [assets, setAssets] = useState<Assets | null>(null),
    [progress, setProgress] = useState(0),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  const [session, setSession] = useState<{
    run: RunTicket;
    settings: ArmyProfile["settings"];
  } | null>(null);
  const [result, setResult] = useState<RunResult | null>(null),
    [notice, setNotice] = useState("");
  const fullscreenOwned = useRef(false),
    starting = useRef(false);
  useEffect(() => {
    const abort = new AbortController();
    let loaded: Assets | null = null;
    setAssets(null);
    setError("");
    setProgress(0);
    try {
      validateContent();
      void loadAssets(abort.signal, (n) => {
        if (!abort.signal.aborted) setProgress(n);
      })
        .then((a) => {
          if (abort.signal.aborted) {
            a.destroy();
            return;
          }
          loaded = a;
          setAssets(a);
        })
        .catch((e) => {
          if (!abort.signal.aborted)
            setError(e instanceof Error ? e.message : "Không tải được đồ họa.");
        });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nội dung không hợp lệ.");
    }
    return () => {
      abort.abort();
      loaded?.destroy();
    };
  }, [retry]);
  useEffect(
    () => () => {
      if (fullscreenOwned.current && document.fullscreenElement)
        void document.exitFullscreen().catch(() => {});
    },
    [],
  );
  const edit = (fn: (profile: ArmyProfile) => void) =>
    onUpdateGameState((draft) => withProfile(draft, fn));
  const setLoadout = (patch: Partial<Loadout>) =>
    edit((profile) => equip(profile, { ...profile.loadout, ...patch }));
  const stage = STAGES.find((s) => s.id === stageId) ?? STAGES[0];
  const completed = clears(p),
    receipt = p.receipt?.runId === result?.runId ? p.receipt : null;
  const start = () => {
    if (!assets || starting.current || session || p.version !== 1) return;
    const seed = new Uint32Array(1);
    crypto.getRandomValues(seed);
    const ticket = makeTicket(
      p,
      stage.id,
      gameState.player.id,
      seed[0],
      Date.now(),
    );
    if (!ticket) {
      setNotice("Màn chưa mở hoặc còn trận bị gián đoạn.");
      return;
    }
    starting.current = true;
    setResult(null);
    setNotice("");
    edit((profile) => {
      reserveRun(profile, ticket);
    });
    setSession({
      run: ticket,
      settings: {
        ...p.settings,
        volume: gameState.settings.soundEnabled ? p.settings.volume : 0,
        reducedMotion:
          p.settings.reducedMotion || gameState.settings.reducedMotion,
      },
    });
  };
  const settle = (r: RunResult) => {
    onUpdateGameState((draft) => settleArmyRun(draft, r, localDate()));
    setResult(r);
    setSession(null);
    starting.current = false;
  };
  const abandon = () => {
    const id = session?.run.id ?? p.activeRun?.id;
    edit((profile) => {
      if (profile.activeRun?.id === id) profile.activeRun = null;
    });
    setSession(null);
    starting.current = false;
    setResult(null);
    setNotice("Đã rút lui. Không nhận thưởng.");
  };
  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        fullscreenOwned.current = false;
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        fullscreenOwned.current = true;
      } else
        setNotice(
          "Trình duyệt không hỗ trợ toàn màn hình; vẫn có thể chơi ngang.",
        );
    } catch {
      setNotice(
        "Không mở được toàn màn hình. Hãy xoay thiết bị ngang để chơi.",
      );
    }
  };
  const changePage = (next: Page) => {
    setResult(null);
    setPage(next);
    setNotice("");
  };
  const menu = (
    <>
      <header className="army-header">
        <button onClick={onBack}>← Quân Lộ</button>
        <div>
          <span className="army-eyebrow">QUÂN LỘ · PHÁO CHIẾN PVE</span>
          <h1>{ARMY_TITLE}</h1>
        </div>
        <div className="army-wallet">
          <b>{p.coins.toLocaleString("vi-VN")} Quân Phiếu</b>
          <small>
            Cấp {level(p)} · {p.xp} XP Pháo Thủ
          </small>
        </div>
        <button onClick={fullscreen}>Toàn màn hình</button>
      </header>
      <nav className="army-tabs" aria-label="Menu Pháo Thủ">
        {(
          [
            ["campaign", "Chiến dịch"],
            ["equipment", "Trang bị"],
            ["inventory", "Kho đồ"],
            ["achievements", "Thành tích"],
            ["help", "Hướng dẫn"],
            ["settings", "Cài đặt"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            aria-current={page === id ? "page" : undefined}
            onClick={() => changePage(id)}
          >
            {label}
          </button>
        ))}
      </nav>
    </>
  );
  return (
    <ExclusiveFullscreenOverlay ariaLabel={ARMY_TITLE} className="army-shell">
      <div className="army-rotate">
        <div>
          <strong>Xoay thiết bị sang ngang</strong>
          <p>Giữ điện thoại ngang để ngắm và điều khiển bằng hai tay.</p>
          <button onClick={fullscreen}>Toàn màn hình</button>
          <button onClick={onBack}>Về Quân Lộ</button>
        </div>
      </div>
      {futureSave ? (
        <div className="army-empty">
          <h2>Save thuộc phiên bản mới hơn</h2>
          <p>Hồ sơ được giữ nguyên. Hãy cập nhật ứng dụng để tiếp tục.</p>
          <button onClick={onBack}>Về Quân Lộ</button>
        </div>
      ) : session && assets ? (
        p.activeRun?.id === session.run.id ? (
          <BattleView
            run={session.run}
            settings={session.settings}
            assets={assets}
            onComplete={settle}
            onAbandon={abandon}
          />
        ) : (
          <div className="army-empty">
            <p>Đang ghi nhận lượt xuất kích…</p>
            <button onClick={abandon}>Hủy xuất kích</button>
          </div>
        )
      ) : (
        <>
          {menu}
          {notice && (
            <p className="army-notice" role="status">
              {notice}
            </p>
          )}
          {!assets ? (
            <div className="army-empty" role="status">
              <h2>
                {error
                  ? "Không thể tải chiến trường"
                  : "Đang chuẩn bị chiến trường"}
              </h2>
              <p>{error || `Tải đồ họa ${progress}%`}</p>
              <progress value={progress} max="100" />
              {error && (
                <button onClick={() => setRetry((n) => n + 1)}>Tải lại</button>
              )}
            </div>
          ) : result ? (
            <main className="army-result">
              <Portrait assets={assets} cosmetic={p.loadout.cosmetic} />
              <section>
                <span className="army-eyebrow">KẾT QUẢ CHIẾN DỊCH</span>
                <h2>
                  {result.won
                    ? "Hoàn thành nhiệm vụ"
                    : "Nhiệm vụ chưa hoàn thành"}
                </h2>
                <p>{result.reason}</p>
                <p>
                  {result.rounds} vòng · HP còn{" "}
                  {Math.round(result.hpRatio * 100)}%
                </p>
                {receipt ? (
                  <>
                    <strong>
                      {receipt.stars}/3 sao ·{" "}
                      {receipt.first
                        ? "Thưởng hoàn thành lần đầu"
                        : "Thưởng chơi lại"}
                    </strong>
                    <div className="army-rewards">
                      <span>+{receipt.coins} Quân Phiếu</span>
                      <span>+{receipt.xp} XP Pháo Thủ</span>
                      <span>+{receipt.gold} Vàng QL2</span>
                      <span>
                        +{receipt.sharedXp.toLocaleString("vi-VN")} XP QL2
                      </span>
                    </div>
                    <small>
                      Thưởng chung còn phụ thuộc giới hạn ngày và thanh XP QL2.
                      Tiến trình dùng cơ chế lưu cục bộ của Quân Lộ.
                    </small>
                  </>
                ) : (
                  <p role="status">Đang ghi kết quả vào hồ sơ…</p>
                )}
                <div className="army-actions">
                  <button
                    disabled={!receipt}
                    onClick={() => {
                      setResult(null);
                      start();
                    }}
                  >
                    Thử lại
                  </button>
                  {result.won &&
                    STAGES.findIndex((s) => s.id === stageId) <
                      STAGES.length - 1 && (
                      <button
                        className="army-primary"
                        disabled={!receipt}
                        onClick={() => {
                          setStageId(
                            STAGES[
                              STAGES.findIndex((s) => s.id === stageId) + 1
                            ].id,
                          );
                          setResult(null);
                          setPage("campaign");
                        }}
                      >
                        Màn tiếp theo
                      </button>
                    )}
                  <button
                    onClick={() => {
                      setResult(null);
                      setPage("campaign");
                    }}
                  >
                    Về chiến dịch
                  </button>
                </div>
              </section>
            </main>
          ) : (
            <main className="army-menu-body">
              {p.activeRun && (
                <div className="army-interrupted">
                  <h2>Trận trước đã bị gián đoạn</h2>
                  <p>
                    Không lưu giữa trận. Đạo cụ cấp cho trận đã được trừ; rút
                    lui không nhận thưởng.
                  </p>
                  <button onClick={abandon}>Kết thúc trận dang dở</button>
                </div>
              )}
              {page === "campaign" && (
                <div className="army-campaign">
                  <section className="army-stage-list">
                    <div className="army-section-heading">
                      <h2>Hành trình Pháo Thủ</h2>
                      <span>
                        {completed}/{STAGES.length} nhiệm vụ
                      </span>
                    </div>
                    {CHAPTERS.map((name, chapter) => (
                      <div key={name}>
                        <h3>
                          Chương {chapter + 1} · {name}
                        </h3>
                        <div className="army-stage-grid">
                          {STAGES.filter((s) => s.chapter === chapter).map(
                            (s) => {
                              const unlocked = stageUnlocked(p, s.id);
                              return (
                                <button
                                  key={s.id}
                                  className={s.id === stageId ? "selected" : ""}
                                  disabled={!unlocked}
                                  onClick={() => setStageId(s.id)}
                                  aria-label={`${s.name}${unlocked ? "" : " · chưa mở"}`}
                                >
                                  <b>{s.id.slice(1)}</b>
                                  <span>{s.name}</span>
                                  <small>
                                    {p.records[s.id]
                                      ? `${p.records[s.id].stars}/3 sao`
                                      : unlocked
                                        ? "Sẵn sàng"
                                        : "Chưa mở"}
                                  </small>
                                </button>
                              );
                            },
                          )}
                        </div>
                      </div>
                    ))}
                  </section>
                  <aside
                    className="army-stage-detail"
                    style={{
                      backgroundImage: `linear-gradient(180deg,#142b35a6,#142b35 68%),url(${assets.manifest.background})`,
                    }}
                  >
                    <Portrait assets={assets} cosmetic={p.loadout.cosmetic} />
                    <span className="army-eyebrow">
                      {MAPS.find((m) => m.id === stage.map)?.name}
                    </span>
                    <h2>{stage.name}</h2>
                    <p>{stage.briefing}</p>
                    <strong>{objectiveLabel(stage)}</strong>
                    <small>
                      1 sao: thắng · +1 sao: ≤{stage.par} vòng · +1 sao: HP ≥50%
                    </small>
                    <small>
                      Lần đầu: {BALANCE.firstCoins} Quân Phiếu +{" "}
                      {BALANCE.firstXp} XP riêng.
                      <br />
                      Chơi lại: {BALANCE.replayCoins} Quân Phiếu +{" "}
                      {BALANCE.replayXp} XP riêng.
                    </small>
                    <div className="army-actions">
                      <button onClick={() => setPage("equipment")}>
                        Chuẩn bị trang bị
                      </button>
                      <button
                        className="army-primary"
                        disabled={
                          !stageUnlocked(p, stage.id) || Boolean(p.activeRun)
                        }
                        onClick={start}
                      >
                        Vào trận
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        setStageId(
                          STAGES.find((s) => !p.records[s.id]?.clears)?.id ??
                            "s15",
                        )
                      }
                    >
                      Đến nhiệm vụ tiếp tục
                    </button>
                    <small>
                      Mỗi đạo cụ đã chọn được cấp 1 cái và trừ khi vào trận. Có
                      thể chơi không mang đạo cụ.
                    </small>
                  </aside>
                </div>
              )}
              {page === "equipment" && (
                <>
                  <div className="army-section-heading">
                    <h2>Trang bị & nhân vật</h2>
                    <span>
                      Đổi class không đổi ngoại hình hay sở hữu vũ khí
                    </span>
                  </div>
                  <div className="army-equipment">
                    <section>
                      <h3>Chuyên môn</h3>
                      {CLASSES.map((c) => (
                        <button
                          className={`army-choice ${p.loadout.classId === c.id ? "selected" : ""}`}
                          key={c.id}
                          disabled={
                            Boolean(p.activeRun) || completed < c.unlock
                          }
                          onClick={() => setLoadout({ classId: c.id })}
                        >
                          <b>{c.name}</b>
                          <span>{c.description}</span>
                          <small>
                            HP {c.hp} · Giáp {c.defense} · Thể lực {c.mobility}
                            {completed < c.unlock
                              ? ` · Cần ${c.unlock} màn hoàn thành`
                              : ""}
                          </small>
                        </button>
                      ))}
                      <h3>Ngoại hình</h3>
                      <div className="army-actions">
                        {(["olive", "steel", "amber"] as const).map(
                          (color, i) => (
                            <button
                              key={color}
                              aria-pressed={p.loadout.cosmetic === color}
                              disabled={Boolean(p.activeRun)}
                              onClick={() => setLoadout({ cosmetic: color })}
                            >
                              {["Ô liu", "Thép xanh", "Hổ phách"][i]}
                            </button>
                          ),
                        )}
                      </div>
                      <p>Chỉ thay màu, không tăng chỉ số.</p>
                      <button
                        disabled={
                          Boolean(p.activeRun) ||
                          p.upgrade >= BALANCE.maxUpgrade ||
                          p.coins < BALANCE.upgradeCost * (p.upgrade + 1)
                        }
                        onClick={() => edit(upgrade)}
                      >
                        Gia cố {p.upgrade}/{BALANCE.maxUpgrade} ·{" "}
                        {BALANCE.upgradeCost * (p.upgrade + 1)} Quân Phiếu
                      </button>
                      <small>
                        Mỗi cấp: +12 HP, +6% sát thương. Tối đa 3 cấp.
                      </small>
                    </section>
                    <section>
                      <h3>Vũ khí</h3>
                      <div className="army-weapon-grid">
                        {WEAPONS.map((w) => (
                          <button
                            className={`army-choice ${p.loadout.weaponId === w.id ? "selected" : ""}`}
                            key={w.id}
                            disabled={
                              Boolean(p.activeRun) || completed < w.unlock
                            }
                            onClick={() => setLoadout({ weaponId: w.id })}
                          >
                            <b>{w.name}</b>
                            <span>{w.description}</span>
                            <small>
                              Đạn {w.damage} · Nổ {w.blast} · Hố {w.crater}
                              {completed < w.unlock
                                ? ` · Cần ${w.unlock} màn`
                                : ""}
                            </small>
                          </button>
                        ))}
                      </div>
                      <h3>Đạo cụ mang theo · tối đa {BALANCE.itemSlots}</h3>
                      <div className="army-item-grid">
                        {ITEMS.map((i) => (
                          <label key={i.id}>
                            <input
                              type="checkbox"
                              checked={p.loadout.items.includes(i.id)}
                              disabled={
                                Boolean(p.activeRun) ||
                                completed < i.unlock ||
                                (!p.loadout.items.includes(i.id) &&
                                  p.loadout.items.length >= BALANCE.itemSlots)
                              }
                              onChange={(e) =>
                                setLoadout({
                                  items: e.target.checked
                                    ? [...p.loadout.items, i.id]
                                    : p.loadout.items.filter(
                                        (id) => id !== i.id,
                                      ),
                                })
                              }
                            />
                            {i.name} ×{p.inventory[i.id]}
                          </label>
                        ))}
                      </div>
                      <div className="army-actions">
                        <button onClick={() => setPage("campaign")}>
                          Về nhiệm vụ
                        </button>
                        <button
                          className="army-primary"
                          disabled={
                            Boolean(p.activeRun) || !stageUnlocked(p, stageId)
                          }
                          onClick={start}
                        >
                          Vào trận · {stage.name}
                        </button>
                      </div>
                    </section>
                  </div>
                </>
              )}
              {page === "inventory" && (
                <>
                  <h2>Kho đạo cụ</h2>
                  <p>
                    Mua bằng Quân Phiếu riêng. Mỗi trận mang tối đa 3 loại, mỗi
                    lượt dùng 1 đạo cụ.
                  </p>
                  <div className="army-shop">
                    {ITEMS.map((i) => (
                      <article key={i.id}>
                        <h3>
                          {i.name} <small>×{p.inventory[i.id]}</small>
                        </h3>
                        <p>{i.description}</p>
                        <button
                          disabled={
                            Boolean(p.activeRun) ||
                            completed < i.unlock ||
                            p.coins < i.cost ||
                            p.inventory[i.id] >= BALANCE.itemStack
                          }
                          onClick={() =>
                            edit((profile) => buyItem(profile, i.id))
                          }
                        >
                          {completed < i.unlock
                            ? `Mở sau ${i.unlock} màn`
                            : `Mua 1 · ${i.cost} Quân Phiếu`}
                        </button>
                      </article>
                    ))}
                  </div>
                </>
              )}
              {page === "achievements" && (
                <>
                  <h2>Dấu ấn chiến dịch</h2>
                  <div className="army-shop">
                    {[
                      {
                        name: "Phát bắn đầu tiên",
                        done: Boolean(p.records.s01),
                        text: "Hoàn thành nhiệm vụ 01.",
                      },
                      {
                        name: "Pháo Thủ trưởng thành",
                        done: Boolean(p.records.s07),
                        text: "Hạ Pháo Đài Thép.",
                      },
                      {
                        name: "Người mở đường",
                        done: Boolean(p.records.s15),
                        text: "Hạ Cỗ Máy Công Thành.",
                      },
                      {
                        name: "Huân chương chính xác",
                        done:
                          Object.values(p.records).filter((r) => r.stars === 3)
                            .length >= 5,
                        text: "Đạt 3 sao ở 5 nhiệm vụ.",
                      },
                    ].map((a) => (
                      <article key={a.name}>
                        <h3>{a.name}</h3>
                        <p>{a.text}</p>
                        <b>{a.done ? "Đã đạt" : "Chưa đạt"}</b>
                      </article>
                    ))}
                  </div>
                  <p>
                    Thành tích thuộc hồ sơ Pháo Thủ, không tự cấp huân chương
                    chung của Quân Lộ.
                  </p>
                </>
              )}
              {page === "help" && (
                <section className="army-help">
                  <h2>Sổ tay Pháo Thủ</h2>
                  <p>
                    <b>A/D hoặc ←/→:</b> di chuyển. <b>W/S hoặc ↑/↓:</b> chỉnh
                    góc. <b>Giữ Space, thả để bắn.</b> Escape tạm dừng. Cảm ứng:
                    giữ nút di chuyển, kéo góc, giữ/thả BẮN.
                  </p>
                  <p>
                    Góc tính từ hướng nhìn lên trên. Nút Quay đổi hướng nòng.
                    Lực điều khiển vận tốc đầu; gió đẩy đạn ngang. Chấm ngắm chỉ
                    hiện đoạn đầu quỹ đạo.
                  </p>
                  <p>
                    Địa hình nâu phá được, đá xám không phá được. Nổ gây sát
                    thương lan cho cả hai phe. Mất nền sẽ rơi; rơi quá 65 đơn vị
                    gây sát thương và rơi khỏi map bị loại.
                  </p>
                  <p>
                    Boss mở điểm yếu màu vàng ở thân trên khi khiên tắt. Vùng đỏ
                    ghi vòng phát nổ: di chuyển ra ngoài trước vòng đó. Đơn vị
                    chết không còn gọi pháo phụ hay phát vùng đánh mới.
                  </p>
                  <p>
                    Thắng được 1 sao; thêm 1 nếu đủ nhanh, thêm 1 nếu còn ít
                    nhất nửa HP. Mỗi màn công bố giới hạn vòng. Màn thường không
                    yêu cầu đạo cụ hoặc mua nâng cấp để vào.
                  </p>
                  <p>
                    Thưởng riêng là Quân Phiếu/XP Pháo Thủ. Thưởng QL2 tối đa{" "}
                    {BALANCE.dailyGoldCap} Vàng và {BALANCE.dailyXpCap} XP mỗi
                    ngày. Không cộng Giờ Chiến Thuật.
                  </p>
                  <p>
                    Tiến trình lưu cục bộ cùng bản sao lưu Quân Lộ. Không có
                    checkpoint giữa trận; tải lại hoặc rút lui không nhận
                    thưởng, không hoàn đạo cụ đã cấp.
                  </p>
                  <p>
                    Đồ họa nguyên bản ở mức khởi đầu: sprite ít khung, một nền
                    tranh dùng chung, các vũ khí dùng chung hình pháo. Nhạc và
                    bộ animation chuyên biệt chưa có.
                  </p>
                  <button
                    onClick={() => {
                      setStageId("s01");
                      setPage("campaign");
                    }}
                  >
                    Xem lại nhiệm vụ hướng dẫn
                  </button>
                </section>
              )}
              {page === "settings" && (
                <section className="army-settings">
                  <h2>Cài đặt trận tiếp theo</h2>
                  <label>
                    Mật độ hiệu ứng
                    <select
                      value={p.settings.quality}
                      onChange={(e) => {
                        const quality = e.target
                          .value as ArmyProfile["settings"]["quality"];
                        edit((profile) => {
                          profile.settings.quality = quality;
                        });
                      }}
                    >
                      <option value="high">Đầy đủ</option>
                      <option value="low">Gọn nhẹ</option>
                    </select>
                  </label>
                  <label>
                    Âm lượng hiệu ứng
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={p.settings.volume}
                      onChange={(e) =>
                        edit((profile) => {
                          profile.settings.volume = Number(e.target.value);
                        })
                      }
                    />
                  </label>
                  <small>
                    Tôn trọng cả chế độ tắt âm thanh chung QL2. Chưa có nhạc
                    nền.
                  </small>
                  <label>
                    <input
                      type="checkbox"
                      checked={p.settings.reducedMotion}
                      onChange={(e) =>
                        edit((profile) => {
                          profile.settings.reducedMotion = e.target.checked;
                        })
                      }
                    />
                    Giảm chuyển động camera và số nổi
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={p.settings.aimAssist}
                      onChange={(e) =>
                        edit((profile) => {
                          profile.settings.aimAssist = e.target.checked;
                        })
                      }
                    />
                    Hiện đoạn ngắm ngắn
                  </label>
                  <label>
                    Độ khó AI
                    <select
                      value={p.settings.difficulty}
                      onChange={(e) =>
                        edit((profile) => {
                          profile.settings.difficulty = e.target
                            .value as ArmyProfile["settings"]["difficulty"];
                        })
                      }
                    >
                      <option value="easy">Dễ · sai số lớn</option>
                      <option value="normal">Thường</option>
                      <option value="hard">Khó · sai số nhỏ</option>
                    </select>
                  </label>
                  <small>
                    Thay độ chính xác có seed, không tăng sát thương AI.
                  </small>
                </section>
              )}
            </main>
          )}
        </>
      )}
    </ExclusiveFullscreenOverlay>
  );
}
