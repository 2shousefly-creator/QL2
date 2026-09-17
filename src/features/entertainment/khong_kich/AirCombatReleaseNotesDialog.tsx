import React, { useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, CalendarDays, ChevronRight, History, X } from "lucide-react";
import { AirCombatModal } from "./AirCombatMotion";
import { ModalButton, OverlayHeader } from "../../../components/overlay/AppOverlay";
import { AIR_COMBAT_RELEASE_HISTORY, LATEST_AIR_COMBAT_RELEASE, type ReleaseChangeRow, type ReleaseEntry } from "./releaseNotes";
import { ReleaseNoteEntityIcon } from "./releaseNotes/releaseAssets";

/** Preserve authored text; emphasize bare numbers in historical prose as well. */
function Inline({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*|`[^`]+`|[+−-]?\d[\d.,]*(?:%|°|px|ms|s)?)/g).map((part, i) =>
    part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> :
    part.startsWith("`") ? <strong key={i}>{part.slice(1, -1)}</strong> :
    /^[+−-]?\d/.test(part) ? <strong key={i}>{part}</strong> : part)}</>;
}
const BADGES = { new: "MỚI", removed: "LOẠI BỎ", unchanged: "KHÔNG ĐỔI", note: "LƯU Ý" } as const;
function ChangeRow({ row }: { row: ReleaseChangeRow }) {
  const badge = row.changeType && row.changeType !== "change" ? BADGES[row.changeType] : null;
  return <div className={`air-release-row air-release-row--${row.format}`} data-change={row.changeType}>
    {badge && <span className="air-release-chip">{badge}</span>}
    {row.before !== undefined && row.after !== undefined ? <div className="air-release-comparison">
      {row.label && <span className="air-release-comparison-label"><Inline text={row.label} /></span>}
      <span className="air-release-comparison-values"><strong className="air-release-before">{row.before}</strong><span className="air-release-arrow" aria-label="thành">⇒</span><strong>{row.after}</strong></span>
    </div> : <div><Inline text={row.text} /></div>}
  </div>;
}
function EntryCard({ entry }: { entry: ReleaseEntry }) {
  return <article className={entry.group ? "air-release-group" : "air-release-card"}>
    <header className="air-release-card-header"><ReleaseNoteEntityIcon icon={entry.icon} />
      <div><h4><Inline text={entry.title} /></h4>
        {entry.rationale && <p className="air-release-rationale"><Inline text={entry.rationale} /></p>}
      </div>
    </header>
    {entry.changes.length > 0 && <div className="air-release-changes">{entry.changes.map((row, index) => <ChangeRow key={index} row={row} />)}</div>}
  </article>;
}
export function AirCombatReleaseNotes({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const listScroll = useRef(0);
  const lastSelected = useRef<string | null>(null);
  const navigated = useRef(false);
  const notes = AIR_COMBAT_RELEASE_HISTORY.find(note => note.version === selected);
  useLayoutEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = selected ? 0 : listScroll.current;
    if (!navigated.current) return;
    if (selected) titleRef.current?.focus({ preventScroll: true });
    else bodyRef.current?.querySelector<HTMLButtonElement>(`[data-version="${lastSelected.current}"]`)?.focus({ preventScroll: true });
  }, [selected]);
  const openVersion = (version: string) => {
    listScroll.current = bodyRef.current?.scrollTop ?? 0;
    lastSelected.current = version;
    navigated.current = true;
    setSelected(version);
  };
  return <AirCombatModal archetype="info" layer="exclusive-dialog" layout="viewport-safe" size="wide" onClose={onClose} labelledBy="air-release-title" panelClassName="air-release-panel">
    <OverlayHeader className="air-release-header">
      <div className="air-release-heading">
        {notes && <button className="air-release-back" onClick={() => setSelected(null)}><ArrowLeft size={15} />Quay lại danh sách</button>}
        <h2 id="air-release-title" ref={titleRef} tabIndex={-1}>{notes ? notes.displayTitle : "LỊCH SỬ CẬP NHẬT"}</h2>
        {notes ? <p className="air-release-date"><CalendarDays size={13} />{notes.releaseDate}{notes === LATEST_AIR_COMBAT_RELEASE && <span className="air-release-latest">MỚI NHẤT</span>}</p>
          : <p className="air-release-date">Không Kích · {AIR_COMBAT_RELEASE_HISTORY.length} bản cập nhật</p>}
      </div>
      <ModalButton variant="icon" aria-label="Đóng chi tiết cập nhật" onClick={onClose}><X size={18} /></ModalButton>
    </OverlayHeader>
    <div className="app-overlay__body air-release-copy" ref={bodyRef}>
      {!notes ? <div className="air-release-history">{AIR_COMBAT_RELEASE_HISTORY.map((note, index) => <button key={note.version} data-version={note.version} className="air-release-history-item" onClick={() => openVersion(note.version)}>
        <span className="air-release-history-symbol" aria-hidden="true"><History size={24} /></span>
        <span className="air-release-history-content"><span className="air-release-history-version"><strong>v{note.version}</strong>{index === 0 && <span className="air-release-latest">MỚI NHẤT</span>}</span>
          <span className="air-release-history-title">{note.title}</span><span className="air-release-date"><CalendarDays size={13} />{note.releaseDate}</span>
        </span><ChevronRight size={18} aria-hidden="true" />
      </button>)}</div> : <div key={notes.version} className="air-release-detail">
        <div className="air-release-summary">{notes.summary.split(/\n\s*\n/).map((paragraph, index) => <p key={index}><Inline text={paragraph} /></p>)}</div>
        {notes.sections.map((section, index) => <section key={section.id} className="air-release-section" aria-labelledby={`release-${section.id}`}>
          <header className="air-release-section-header"><span className="air-release-section-number">{String(index + 1).padStart(2, "0")}</span><h3 id={`release-${section.id}`}><Inline text={section.title} /></h3></header>
          {section.intro.length > 0 && <div className="air-release-card air-release-intro"><ReleaseNoteEntityIcon icon={section.icon} /><div className="air-release-changes">{section.intro.map((row, rowIndex) => <ChangeRow key={rowIndex} row={row} />)}</div></div>}
          {section.entries.map(entry => <EntryCard key={entry.id} entry={entry} />)}
        </section>)}
      </div>}
    </div>
    <footer className="app-overlay__footer air-release-footer">
      {notes && <ModalButton variant="secondary" onClick={() => setSelected(null)}><ArrowLeft size={15} />Quay lại danh sách</ModalButton>}
      <ModalButton variant="primary" onClick={onClose}>Đóng</ModalButton>
    </footer>
  </AirCombatModal>;
}
