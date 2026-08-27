import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ChevronRight, Coins, Crown, LockKeyhole, ShieldAlert, Sparkles, Swords } from "lucide-react";
import { MAX_TOWER_FLOOR } from "../config";
import { BOSS_BY_ID, TOWER_CHAPTERS, TOWER_FLOORS } from "../towerFloorCatalog";
import { TROOP_BY_TYPE } from "../troopCatalog";
import type { ChienTuyenProfileV2, TowerFloorDefinition } from "../types";
import { TroopIcon } from "./TroopIcon";
import "../chienTuyenChapterThemes.css";

interface TowerViewProps {
  profile: ChienTuyenProfileV2;
  onSelectFloor: (floorNumber: number) => void;
  onDeploy: (floor: TowerFloorDefinition) => void;
}

const FLOORS_PER_CHAPTER = 10;

export const TowerView: React.FC<TowerViewProps> = ({ profile, onSelectFloor, onDeploy }) => {
  const requestedFloor = Number.isFinite(profile.selectedFloor) ? Math.floor(profile.selectedFloor) : 1;
  const selectedFloorNumber = Math.max(1, Math.min(MAX_TOWER_FLOOR, requestedFloor));
  const selected = TOWER_FLOORS[selectedFloorNumber - 1];
  const selectedChapter = Math.ceil(selectedFloorNumber / FLOORS_PER_CHAPTER);
  const selectedRef = useRef<HTMLButtonElement | null>(null);
  const lastScrolledFloorRef = useRef<number | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(() => new Set([selectedChapter]));
  const [inspectedEnemy, setInspectedEnemy] = useState<string | null>(null);

  useEffect(() => {
    setExpandedChapters((current) => {
      if (current.has(selectedChapter)) return current;
      const next = new Set(current);
      next.add(selectedChapter);
      return next;
    });
  }, [selectedChapter]);

  useEffect(() => {
    if (!expandedChapters.has(selectedChapter) || lastScrolledFloorRef.current === selectedFloorNumber) return;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    selectedRef.current?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reducedMotion ? "auto" : "smooth" });
    lastScrolledFloorRef.current = selectedFloorNumber;
  }, [expandedChapters, selectedChapter, selectedFloorNumber]);

  const grouped = useMemo(() => TOWER_CHAPTERS.map((metadata, chapterIndex) => ({
    chapter: metadata.chapter,
    metadata,
    floors: TOWER_FLOORS.slice(chapterIndex * FLOORS_PER_CHAPTER, chapterIndex * FLOORS_PER_CHAPTER + FLOORS_PER_CHAPTER),
  })), []);

  const selectedBoss = selected.bossId ? BOSS_BY_ID[selected.bossId] : null;
  const selectedCleared = profile.claimedFirstClearFloors.includes(selected.floorNumber);
  const selectedLocked = selected.floorNumber > profile.highestUnlockedFloor;

  const toggleChapter = (chapter: number) => {
    setExpandedChapters((current) => {
      const next = new Set(current);
      if (next.has(chapter)) next.delete(chapter);
      else next.add(chapter);
      return next;
    });
  };

  return (
    <div className="ct-v2-view ct-v2-tower" data-chien-tuyen-view="tower">
      <section className="ct-v2-hero-card ct-v2-hero-card--compact ct-v2-tower-hero">
        <div className="ct-v2-hero-orb" aria-hidden="true">🏰</div>
        <div className="min-w-0 flex-1">
          <div className="ct-v2-eyebrow">CHIẾN DỊCH 100 TẦNG</div>
          <h2>THÁP CHIẾN TUYẾN</h2>
          <p>Tầng cao nhất {profile.highestUnlockedFloor}/{MAX_TOWER_FLOOR} · Chương {selectedChapter}</p>
        </div>
        <div className="ct-v2-progress-ring" role="img" aria-label={`Đã vượt ${profile.highestClearedFloor} trên ${MAX_TOWER_FLOOR} tầng`}>
          <strong>{profile.highestClearedFloor}</strong><span>/{MAX_TOWER_FLOOR}</span>
        </div>
      </section>

      {profile.towerCompleted && (
        <div className="ct-v2-complete-banner" role="status"><Crown className="h-5 w-5" aria-hidden="true" /> Bạn đã chinh phục toàn bộ Chiến Tuyến!</div>
      )}

      <section className={`ct-v2-floor-preview ${selected.isBoss ? "is-boss" : ""}`} data-selected-floor={selected.floorNumber}>
        <div className="flex min-w-0 items-center gap-3">
          <div className="ct-v2-floor-badge">
            {selected.isBoss ? <Crown className="h-6 w-6" /> : <Swords className="h-6 w-6" />}
            <span>TẦNG</span><strong>{selected.floorNumber}</strong>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3>{selected.title}</h3>
              {selected.isBoss && <span className="ct-v2-pill ct-v2-pill--boss">BOSS</span>}
              {selectedCleared && <span className="ct-v2-pill ct-v2-pill--done"><Check className="h-3 w-3" /> Đã vượt</span>}
            </div>
            <p>Chương {selected.chapter} · {selected.archetype}</p>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-black">
              <span className="ct-v2-stat-chip"><ShieldAlert className="h-3.5 w-3.5" /> Địch Lv{selected.enemyLevel}</span>
              <span className="ct-v2-stat-chip"><Sparkles className="h-3.5 w-3.5" /> Khuyến nghị Lv{selected.recommendedLevel}</span>
              <span className="ct-v2-stat-chip"><Coins className="h-3.5 w-3.5" /> {selectedCleared ? "Đã nhận" : `+${selected.firstClearGold} Vàng lần đầu`}</span>
              <span className="ct-v2-stat-chip">{selectedBoss?.role ?? "Đội hình chiến thuật"}</span>
            </div>
          </div>
        </div>
        <div className="ct-v2-floor-enemies" aria-label="Đội hình địch của tầng đã chọn">
          {selected.enemyFormation.map((entry) => {
            if (entry.bossId) {
              const boss = BOSS_BY_ID[entry.bossId];
              return <button type="button" key={entry.slotId} className="is-boss" title={`${boss.name}: ${boss.role}`} onClick={() => setInspectedEnemy(`${boss.name} · ${boss.role} · Lv${entry.level}`)}><b aria-hidden="true">{boss.icon}</b><small>{boss.name}</small></button>;
            }
            const troop = TROOP_BY_TYPE[entry.troopType!];
            return <button type="button" key={entry.slotId} title={`${troop.name}, ${troop.role}`} onClick={() => setInspectedEnemy(`${troop.name} · ${troop.role} · Lv${entry.level}`)}><TroopIcon troopType={entry.troopType!} size="small" /><small>{troop.shortName}</small></button>;
          })}
        </div>
        {inspectedEnemy && <p className="ct-v2-enemy-inspect" role="status">{inspectedEnemy}</p>}
        {selectedLocked && <p className="ct-v2-floor-lock-copy">Vượt Tầng {Math.max(1, selected.floorNumber - 1)} để mở khóa.</p>}
        <button
          type="button"
          disabled={selectedLocked}
          onClick={() => onDeploy(selected)}
          className="ct-v2-primary-button mt-3 w-full"
          data-action="deploy-floor"
        >
          {selectedLocked ? <><LockKeyhole className="h-5 w-5" /> Chưa mở khóa</> : <><Swords className="h-5 w-5" /> Triển khai <ChevronRight className="h-5 w-5" /></>}
        </button>
      </section>

      <div className="space-y-3 pb-2">
        {grouped.map(({ chapter, metadata, floors }) => {
          const chapterCleared = Math.min(FLOORS_PER_CHAPTER, Math.max(0, profile.highestClearedFloor - (chapter - 1) * FLOORS_PER_CHAPTER));
          const expanded = expandedChapters.has(chapter);
          const floorsId = `ct-v2-chapter-${chapter}-floors`;
          return (
            <section key={chapter} className={`ct-v2-chapter-card ${expanded ? "is-expanded" : "is-collapsed"}`}>
              <div className="ct-v2-chapter-heading">
                <div>
                  <div className="ct-v2-eyebrow">CHƯƠNG {chapter}</div>
                  <h3>{metadata.name}</h3>
                  <p className="ct-v2-chapter-focus">{metadata.focus}</p>
                </div>
                <div className="ct-v2-chapter-heading-actions">
                  <span className="ct-v2-chapter-progress"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> {chapterCleared}/{FLOORS_PER_CHAPTER}</span>
                  <button
                    type="button"
                    className="ct-v2-chapter-toggle"
                    aria-expanded={expanded}
                    aria-controls={floorsId}
                    aria-label={`${expanded ? "Thu gọn" : "Mở"} chương ${chapter}: ${metadata.name}`}
                    onClick={() => toggleChapter(chapter)}
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              {expanded && (
                <div id={floorsId} className="ct-v2-floor-grid ct-v2-chapter-floor-grid" role="group" aria-label={`Các tầng chương ${chapter}`}>
                  {floors.map((floor) => {
                    const locked = floor.floorNumber > profile.highestUnlockedFloor;
                    const cleared = profile.claimedFirstClearFloors.includes(floor.floorNumber);
                    const active = floor.floorNumber === selected.floorNumber;
                    return (
                      <button
                        key={floor.floorNumber}
                        ref={active ? selectedRef : undefined}
                        type="button"
                        disabled={locked}
                        aria-pressed={active}
                        aria-label={`Tầng ${floor.floorNumber}${floor.isBoss ? ", Boss" : ""}${cleared ? ", đã vượt" : locked ? ", chưa mở khóa" : ", sẵn sàng"}`}
                        onClick={() => onSelectFloor(floor.floorNumber)}
                        className={`ct-v2-floor-button ${active ? "is-active" : ""} ${cleared ? "is-cleared" : ""} ${locked ? "is-locked" : ""} ${floor.isBoss ? "is-boss" : ""}`}
                      >
                        {locked ? <LockKeyhole className="h-3.5 w-3.5" /> : cleared ? <Check className="h-3.5 w-3.5" /> : floor.isBoss ? <Crown className="h-3.5 w-3.5" /> : null}
                        <strong>{floor.floorNumber}</strong>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};
