import React from "react";
import type { SoloMatch } from "./airCombatDuelRuntime";
export function AirCombatSoloResult({ match, onRematch, onMenu }: { match: SoloMatch; onRematch: () => void; onMenu: () => void }) {
  return <section className="air-solo-setup air-solo-result">
    <header><span>SOLO 1v1 · BO9</span><h1>{match.winner === "player" ? "CHIẾN THẮNG" : "THẤT BẠI"}</h1></header>
    <strong className="air-solo-score">PLAYER {match.playerWins} — {match.opponentWins} AI</strong>
    <p>Trận đấu đã kết thúc</p>
    <button className="air-solo-primary" onClick={onRematch}>ĐẤU LẠI</button>
    <button onClick={onMenu}>MENU CHÍNH</button>
  </section>;
}
