import React from "react";
import { X } from "lucide-react";
import { AirCombatModal } from "./AirCombatMotion";
import { ModalButton, OverlayHeader, OverlayBody } from "../../../components/overlay/AppOverlay";
import { AIR_COMBAT_RELEASE_NOTES as notes } from "./airCombatReleaseNotes";
function Inline({text}:{text:string}) {
  return <>{text.split(/(\*\*.*?\*\*)/g).map((part,i)=>part.startsWith("**")?<strong key={i}>{part.slice(2,-2)}</strong>:part)}</>;
}
function Copy({body}:{body:string}) {
  return <>{body.split(/(```text\n[\s\S]*?\n```)/g).map((part,i)=>part.startsWith("```text")
    ? <pre key={i} className="air-release-values">{part.slice(8,-4)}</pre>
    : part.trim().split(/\n\n/).filter(Boolean).map((paragraph,j)=><p key={`${i}-${j}`}><Inline text={paragraph}/></p>))}</>;
}
export function AirCombatReleaseNotes({onClose}:{onClose:()=>void}) {
  return <AirCombatModal archetype="info" layer="exclusive-dialog" layout="viewport-safe" onClose={onClose} labelledBy="air-release-title">
    <OverlayHeader className="flex items-start justify-between gap-3"><h2 id="air-release-title" className="modal-title">{notes.title}</h2>
      <ModalButton variant="icon" aria-label="Đóng chi tiết cập nhật" onClick={onClose}><X size={18}/></ModalButton></OverlayHeader>
    <OverlayBody className="air-release-copy"><p>{notes.summary}</p>{notes.sections.map(section=><section key={section.title}>
      <h3>{section.title}</h3><Copy body={section.body}/></section>)}</OverlayBody>
  </AirCombatModal>;
}
