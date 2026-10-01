import React, { useState } from "react";
import { AIRCRAFT_CONFIGS, AIRCRAFT_ORDER } from "./airCombatConfig";
import { createAircraftCombatState, getEffectiveAircraftStats } from "./airCombatAircraft";
import { AircraftPreview } from "./AircraftPreview";
import { AircraftSelectionStats } from "./CombatStatReadout";
import type { SoloSetup } from "./airCombatDuelRuntime";

export function AirCombatSoloSetup({ onStart, onBack, onMenu }: { onStart: (setup: SoloSetup) => void; onBack: () => void; onMenu: () => void }) {
  const [step, setStep] = useState(0);
  const [setup, setSetup] = useState<SoloSetup>({ aircraft: "black_eagle", opponent: "secret", rule: "random" });
  const side = step === 0 ? "player" : step === 1 ? "ai" : "rules";
  return <section className="air-solo-setup" data-selection-side={side}>
    <nav><button onClick={() => step ? setStep(step - 1) : onBack()}>← QUAY LẠI</button><button onClick={onMenu}>MENU CHÍNH</button></nav>
    <ol className="air-solo-steps" aria-label="Các bước thiết lập SOLO">
      {["Người Chơi", "Đối Thủ AI", "Quy Luật"].map((label, index) => <li key={label} aria-current={step === index ? "step" : undefined} data-complete={step > index}><span>{index + 1}</span>{label}</li>)}
    </ol>
    <header><span>SOLO 1v1 · {step + 1} / 3</span><h1>{["CHỌN CHIẾN CƠ CỦA BẠN", "CHỌN CHIẾN CƠ ĐỐI THỦ AI", "CHỌN QUY LUẬT SOLO"][step]}</h1>
      <p className="air-solo-selection-hint">{["Bạn sẽ trực tiếp điều khiển chiến cơ này.", "AI sẽ điều khiển chiến cơ này để đối đầu với bạn.", "Chọn cách hai bên nhận Lõi và Trang Bị."][step]}</p>
    </header>
    <div className="air-solo-lineup" aria-label="Chiến cơ hai bên">
      <div data-side="player" data-current={step === 0}><span>NGƯỜI CHƠI · BẠN</span><strong>{AIRCRAFT_CONFIGS[setup.aircraft].name}</strong></div>
      <div data-side="ai" data-current={step === 1}><span>ĐỐI THỦ · AI</span><strong>{setup.opponent === "secret" ? "Bí Mật" : AIRCRAFT_CONFIGS[setup.opponent].name}</strong></div>
    </div>
    {step < 2 ? <div className="air-solo-aircraft-grid" role="group" aria-label={step === 0 ? "Chiến cơ Người Chơi" : "Chiến cơ Đối Thủ AI"}>
      {AIRCRAFT_ORDER.map(id => <button key={id} aria-pressed={(step === 0 ? setup.aircraft : setup.opponent) === id}
        onClick={() => setSetup({ ...setup, [step === 0 ? "aircraft" : "opponent"]: id })}>
        <AircraftPreview aircraftId={id} className="h-16 w-16 mx-auto" />
        <strong>{AIRCRAFT_CONFIGS[id].name}</strong><p>{AIRCRAFT_CONFIGS[id].role}</p>
        <AircraftSelectionStats stats={getEffectiveAircraftStats(createAircraftCombatState(id))} />
      </button>)}
      {step === 1 && <button aria-pressed={setup.opponent === "secret"} onClick={() => setSetup({ ...setup, opponent: "secret" })}>
        <strong className="air-solo-secret">???</strong><strong>BÍ MẬT</strong><p>Đối thủ lộ diện trong đấu trường</p>
      </button>}
    </div> : <div className="air-solo-mode-cards">
      <button aria-pressed={setup.rule === "random"} onClick={() => setSetup({ ...setup, rule: "random" })}><strong>NGẪU NHIÊN</strong><p>Hai bên có lượt Lõi và Trang Bị độc lập. Bạn chọn Lõi, AI chọn từ bộ thẻ riêng.</p></button>
      <button aria-pressed={setup.rule === "copy"} onClick={() => setSetup({ ...setup, rule: "copy" })}><strong>SAO CHÉP</strong><p>Cùng chuỗi Trang Bị, cùng Lõi bạn chọn từ bể hợp lệ cho cả hai chiến cơ.</p></button>
    </div>}
    <p className="air-solo-note">BO9 · Mỗi hiệp 7 giây chuẩn bị, 3 phút giao chiến.<br />Không thưởng Gold/XP, không lưu thành tích.</p>
    <button className="air-solo-primary" onClick={() => step < 2 ? setStep(step + 1) : onStart(setup)}>{["XÁC NHẬN CHIẾN CƠ CỦA BẠN →", "XÁC NHẬN ĐỐI THỦ AI →", "VÀO ĐẤU TRƯỜNG"][step]}</button>
  </section>;
}
