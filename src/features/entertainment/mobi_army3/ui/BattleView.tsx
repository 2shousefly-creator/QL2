import React, { useEffect, useRef, useState } from "react";
import type { Assets } from "../render/assets";
import type { ArmyProfile, RunResult, RunTicket } from "../types";
import { ArmyRuntime, type Hud } from "../runtime";
import { STAGES, objectiveLabel } from "../content/stages";
import { itemById, weaponById } from "../content/equipment";
interface Props {
  run: RunTicket;
  assets: Assets;
  settings: ArmyProfile["settings"];
  onComplete: (result: RunResult) => void;
  onAbandon: () => void;
}
export function BattleView({
  run,
  assets,
  settings,
  onComplete,
  onAbandon,
}: Props) {
  const root = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    runtime = useRef<ArmyRuntime | null>(null);
  const complete = useRef(onComplete);
  const pausePanel = useRef<HTMLDivElement>(null);
  complete.current = onComplete;
  const [hud, setHud] = useState<Hud | null>(null),
    [exitConfirm, setExitConfirm] = useState(false),
    [error, setError] = useState("");
  const stage = STAGES.find((s) => s.id === run.stageId)!,
    weapon = weaponById[stage.weapon ?? run.loadout.weaponId];
  useEffect(() => {
    try {
      runtime.current = new ArmyRuntime(
        canvas.current!,
        root.current!,
        run,
        assets,
        settings,
        setHud,
        (r) => complete.current(r),
      );
      root.current?.focus();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể mở trận.");
    }
    return () => {
      runtime.current?.destroy();
      runtime.current = null;
    };
    // The battle owns a frozen settings/loadout snapshot, independent of QL2's earning updates.
  }, [run, assets, settings]);
  useEffect(() => {
    if (hud?.paused || error) pausePanel.current?.focus();
  }, [hud?.paused, error]);
  const enabled = Boolean(
    hud?.playerTurn && !hud.paused && hud.phase === "planning",
  );
  const pause = () => runtime.current?.setPaused(true);
  const hold =
    (action: string) => (e: React.PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      runtime.current?.input.hold(`p${e.pointerId}`, action);
    };
  const release = (e: React.PointerEvent<HTMLButtonElement>) =>
    runtime.current?.input.release(`p${e.pointerId}`);
  const fireDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    runtime.current?.input.charge(`p${e.pointerId}`);
  };
  const fireUp = (e: React.PointerEvent<HTMLButtonElement>) =>
    runtime.current?.input.fire(`p${e.pointerId}`);
  const fireCancel = (e: React.PointerEvent<HTMLButtonElement>) =>
    runtime.current?.input.cancel(`p${e.pointerId}`);
  const tutorial =
    stage.tutorial && hud
      ? !hud.tutorial.moved
        ? "1 · Giữ nút trái/phải để di chuyển."
        : !hud.tutorial.aimed
          ? "2 · Chỉnh góc bằng thanh trượt hoặc W/S."
          : !hud.tutorial.fired
            ? "3 · Giữ BẮN lấy lực, thả để bắn vào bia."
            : !hud.tutorial.item
              ? "4 · Trong lượt của mình, thử Khiên hoặc Cường Hóa."
              : "Bia đã sẵn sàng. Hãy hoàn thành phát bắn!"
      : null;
  return (
    <div
      className="army-battle"
      ref={root}
      tabIndex={-1}
      aria-label="Điều khiển trận pháo chiến"
    >
      <div
        className="army-battle-content"
        inert={Boolean(hud?.paused || error)}
      >
        <div className="army-battle-top">
          <div>
            <strong>{stage.name}</strong>
            <small>
              {objectiveLabel(stage)}
              {stage.objective.kind === "rescue" && hud?.rescue
                ? " · Đã giải cứu"
                : ""}
            </small>
          </div>
          <div className="army-turn">
            <b>{hud?.active ?? "Đang vào trận"}</b>
            <small>
              Vòng {hud?.round ?? 1}/{stage.maxRounds} ·{" "}
              {Math.ceil(hud?.seconds ?? 30)} giây
            </small>
          </div>
          <div>
            <strong>
              Gió {(hud?.wind ?? 0) < 0 ? "←" : "→"} {Math.abs(hud?.wind ?? 0)}
            </strong>
            <small>
              HP {Math.ceil(hud?.hp ?? 0)}/{hud?.maxHp ?? 0}
            </small>
          </div>
          <button onClick={pause}>Tạm dừng</button>
        </div>
        <div className="army-field">
          <canvas ref={canvas} aria-label="Chiến trường phá hủy theo lượt" />
          <div className="army-enemies">
            {hud?.enemies.map((e) => (
              <span key={e.id}>
                {e.name} {Math.ceil(e.hp)}/{e.maxHp}
                {e.phase ? ` · GĐ ${e.phase}` : ""}
                {e.shield ? ` · Khiên ${e.shield}` : ""}
              </span>
            ))}
          </div>
          {tutorial && <div className="army-tutorial">{tutorial}</div>}
          <div className="army-camera" aria-label="Điều khiển camera">
            <button
              aria-label="Camera sang trái"
              onClick={() => runtime.current?.camera("left")}
            >
              ←
            </button>
            <button onClick={() => runtime.current?.camera("self")}>Ta</button>
            <button onClick={() => runtime.current?.camera("enemy")}>
              Địch
            </button>
            <button
              aria-label="Camera sang phải"
              onClick={() => runtime.current?.camera("right")}
            >
              →
            </button>
            <button onClick={() => runtime.current?.camera("zoom")}>
              Thu/phóng
            </button>
          </div>
        </div>
        <div className="army-controls">
          <div className="army-movement">
            <small>
              Thể lực {Math.floor(hud?.movement ?? 0)}/{hud?.maxMovement ?? 0}
            </small>
            <div>
              <button
                disabled={!enabled}
                aria-label="Di chuyển trái"
                onPointerDown={hold("left")}
                onPointerUp={release}
                onPointerCancel={release}
                onLostPointerCapture={release}
                onClick={(e) => {
                  if (e.detail === 0)
                    runtime.current?.send({
                      type: "move",
                      direction: -1,
                      dt: 1 / 60,
                    });
                }}
              >
                ←
              </button>
              <button
                disabled={!enabled}
                aria-label="Di chuyển phải"
                onPointerDown={hold("right")}
                onPointerUp={release}
                onPointerCancel={release}
                onLostPointerCapture={release}
                onClick={(e) => {
                  if (e.detail === 0)
                    runtime.current?.send({
                      type: "move",
                      direction: 1,
                      dt: 1 / 60,
                    });
                }}
              >
                →
              </button>
              <button
                disabled={!enabled}
                onClick={() =>
                  runtime.current?.send({
                    type: "face",
                    direction:
                      runtime.current.world.battle.units[0].facing === 1
                        ? -1
                        : 1,
                  })
                }
              >
                Quay
              </button>
            </div>
          </div>
          <label className="army-aim">
            Góc {Math.round(hud?.angle ?? 45)}°
            <input
              aria-label="Góc bắn"
              type="range"
              min={weapon.angles[0]}
              max={weapon.angles[1]}
              step="1"
              value={hud?.angle ?? 45}
              disabled={!enabled}
              onChange={(e) =>
                runtime.current?.send({
                  type: "aim",
                  angle: Number(e.target.value),
                })
              }
            />
            <small>{weapon.name}</small>
          </label>
          <div className="army-items">
            {hud?.items.map((i) => (
              <button
                key={i.id}
                disabled={!enabled || Boolean(i.reason)}
                title={i.reason ?? itemById[i.id].description}
                onClick={() =>
                  runtime.current?.send({ type: "item", id: i.id })
                }
              >
                {itemById[i.id].name} ×{i.quantity}
              </button>
            ))}
            {!hud?.items.length && (
              <small>Không mang đạo cụ · đạn thường vô hạn</small>
            )}
          </div>
          <div className="army-fire-wrap">
            <progress max="100" value={hud?.power ?? 0} aria-label="Lực bắn" />
            <button
              className="army-fire"
              data-army-fire
              disabled={
                !hud?.playerTurn ||
                hud.paused ||
                !["planning", "charge"].includes(hud.phase)
              }
              onPointerDown={fireDown}
              onPointerUp={fireUp}
              onPointerCancel={fireCancel}
              onLostPointerCapture={fireCancel}
              onKeyDown={(e) => {
                if (e.code === "Enter") {
                  e.preventDefault();
                  if (!e.repeat) runtime.current?.input.charge("enter");
                }
              }}
              onKeyUp={(e) => {
                if (e.code === "Enter") {
                  e.preventDefault();
                  runtime.current?.input.fire("enter");
                }
              }}
            >
              BẮN {Math.round(hud?.power ?? 0)}%
            </button>
            <small>Giữ lấy lực · thả để bắn</small>
          </div>
        </div>
        {hud?.message && (
          <div className="army-feedback" role="status">
            {hud.message}
          </div>
        )}
      </div>
      {(hud?.paused || error) && (
        <div
          ref={pausePanel}
          tabIndex={-1}
          className="army-pause"
          role="dialog"
          aria-modal="true"
          aria-label="Tạm dừng trận"
        >
          <div>
            <h2>
              {error
                ? "Không thể mở trận"
                : exitConfirm
                  ? "Rút khỏi trận?"
                  : "Trận đang tạm dừng"}
            </h2>
            <p>
              {error ||
                "Thời gian lượt đã dừng. Rút lui không nhận thưởng; đạo cụ đã cấp cho trận không được hoàn lại."}
            </p>
            {!error && !exitConfirm && (
              <>
                <button
                  className="army-primary"
                  onClick={() => {
                    runtime.current?.setPaused(false);
                    root.current?.focus();
                  }}
                >
                  Tiếp tục
                </button>
                <button
                  onClick={() => {
                    runtime.current?.setPaused(false);
                    runtime.current?.send({ type: "skip" });
                  }}
                >
                  Bỏ lượt
                </button>
              </>
            )}
            <button
              onClick={() =>
                exitConfirm || error ? onAbandon() : setExitConfirm(true)
              }
            >
              {exitConfirm || error ? "Về chiến dịch" : "Rút lui"}
            </button>
            {exitConfirm && (
              <button onClick={() => setExitConfirm(false)}>Ở lại</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
