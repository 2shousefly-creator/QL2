import React from "react";
export function AirCombatModeSelect({ onCampaign, onSolo, onBack }: { onCampaign: () => void; onSolo: () => void; onBack: () => void }) {
  return <section className="air-solo-setup">
    <nav><button onClick={onBack}>← MENU CHÍNH</button></nav>
    <header><span>KHÔNG KÍCH</span><h1>CHỌN CHẾ ĐỘ</h1></header>
    <div className="air-solo-mode-cards">
      <button onClick={onCampaign}><strong>CHIẾN DỊCH</strong><p>Chinh phục các Màn và tiếp tục hành trình.</p></button>
      <button onClick={onSolo}><strong>SOLO 1v1</strong><p>Đấu BO9 với AI · Chạm 5 chiến thắng<br />Ngẫu Nhiên hoặc Sao Chép</p></button>
    </div>
  </section>;
}
