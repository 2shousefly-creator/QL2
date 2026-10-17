import React, { useState } from 'react';
import { AppModal, ModalButton, OverlayBody, OverlayFooter, OverlayHeader } from '../../../components/overlay/AppOverlay';
import type { GameState, RankStep } from '../../../game/types';
import type { FarmAssignment, FarmTask } from '../farmWorkerTypes';
import { createFarmWorker, FARM_DAY_MS, FARM_TASKS } from '../farmWorkerConfig';
import { farmWorkerDailyWage } from '../farmWorkerEngine';
import { ANIMAL_CATALOG, CROP_CATALOG, EGG_INFO_MAP, FEED_CATALOG, FERTILIZER_CATALOG } from '../farmCatalog';
import { rankAtLeast, getAnimalCapacity } from '../farmEngine';
import { isXpBarFull } from '../../../game/xpProgression';
import { mobileCountdown } from '../mobile/FarmMobileAdapter';
import { QUALITY_CONFIG } from '../weatherEngine';

export function EmployeeManagement({ state, rank, now, onClose, onConfirm, onLocate }: {
  state: GameState; rank: RankStep; now: number; onClose(): void; onConfirm(a: FarmAssignment): void; onLocate(follow: boolean): void;
}) {
  const farm = state.farm!, worker = farm.worker ?? createFarmWorker(now);
  const [draft, setDraft] = useState<FarmAssignment>(() => {
    const next = structuredClone(worker.assignment);
    if (worker.status !== 'employed') {
      next.tasks = []; next.animalTargets = {};
      for (const animal of farm.penAnimals) if (animal.deathAt === null) next.animalTargets[animal.animalTypeId] = (next.animalTargets[animal.animalTypeId] ?? 0) + 1;
    }
    return next;
  });
  const edit = (change: (a: FarmAssignment) => void) => setDraft(prev => { const next = structuredClone(prev); change(next); return next; });
  const toggle = <T,>(values: T[], value: T) => values.includes(value) ? values.filter(x => x !== value) : [...values, value];
  const daily = farmWorkerDailyWage(draft), currentDaily = farmWorkerDailyWage(worker.assignment);
  const accrued = worker.wageUnits / FARM_DAY_MS + (worker.status === 'employed' ? Math.max(0, Math.min(now, worker.nextPayrollAt) - worker.wageUpdatedAt) * currentDaily / FARM_DAY_MS : 0);
  const projected = worker.status === 'employed' ? accrued + Math.max(0, worker.nextPayrollAt - now) * daily / FARM_DAY_MS : daily;
  const budgetRemaining = Math.max(0, draft.restock.dailyLimit - (now < worker.budgetWindowAt + FARM_DAY_MS ? worker.budgetSpent : 0));
  const eligible = rankAtLeast(rank, { familyId: 'junior_1', tier: 1 });
  const taskName = FARM_TASKS.find(x => x.id === worker.action?.task)?.name;
  const status = worker.status === 'departed' ? 'Đã nghỉ' : worker.status === 'unhired' ? 'Chưa tuyển' : worker.action ? now < worker.action.arrivedAt ? 'Di chuyển' : 'Đang làm' : worker.blocked.length ? 'Bị chặn' : worker.assignment.tasks.length ? 'Chờ việc' : 'Chờ giao việc';
  const number = (value: number) => value.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
  const supplies = [ ...CROP_CATALOG.map(x => ({ key: `seeds:${x.id}`, name: `Hạt ${x.name}` })), ...FERTILIZER_CATALOG.map(x => ({ key: `fertilizer:${x.id}`, name: x.name })), ...FEED_CATALOG.map(x => ({ key: `feed:${x.id}`, name: x.name })), ...ANIMAL_CATALOG.map(x => ({ key: `animals:${x.id}`, name: `Con giống ${x.name}` })) ];
  return <AppModal theme="farm" archetype="transaction" onClose={onClose} closeOnBackdrop labelledBy="farm-employee-title">
    <OverlayHeader><h2 id="farm-employee-title" className="text-xl font-bold">Thuê Người</h2><p>{status}{taskName ? ` · ${taskName} · ${worker.action?.target} · ${mobileCountdown(worker.action!.endsAt-now)}` : ''}</p></OverlayHeader>
    <OverlayBody><div className="farm-employee space-y-5 text-sm">
      {!eligible && <p className="text-amber-300">Mở tại Thiếu Úy bậc 1.</p>}
      <section className="rounded-xl border border-slate-600 p-3 space-y-2">
        <p>Ví Tăng Gia: <strong>{number(farm.gold)} vàng</strong></p>
        <p>Lương đã tích lũy: {number(accrued)} vàng · Dự kiến kỳ này: {number(projected)} vàng</p>
        <p>Mức lương đang giao: {currentDaily} vàng/24h · Sau xác nhận: <strong>{daily} vàng/24h</strong></p>
        {worker.status === 'employed' ? <p>Kỳ tiếp theo: {new Date(worker.nextPayrollAt).toLocaleString('vi-VN')} · còn {mobileCountdown(worker.nextPayrollAt - now)}</p> : <p>Không trừ vàng khi tuyển. Kỳ đầu đến hạn đúng 24 giờ sau lúc tuyển.</p>}
        {farm.gold < projected && <p className="text-amber-300">Ví hiện tại thiếu khoảng {number(projected - farm.gold)} vàng cho kỳ lương dự kiến.</p>}
        {worker.status === 'departed' && <p className="text-rose-300">Đã nghỉ lúc {new Date(worker.departedAt!).toLocaleString('vi-VN')}; cần {worker.unpaidGold} vàng khi đến hạn. Khoản chưa thu không được truy thu khi tuyển lại.</p>}
        <div className="flex gap-2"><ModalButton onClick={() => onLocate(false)}>Đến vị trí</ModalButton><ModalButton onClick={() => onLocate(true)}>Theo dõi</ModalButton></div>
      </section>
      {isXpBarFull(state) && <div className="text-amber-300">{worker.assignment.tasks.includes('harvest') && <p>Thu hoạch tạm dừng — EXP đã đầy, chờ thăng quân hàm.</p>}{worker.assignment.tasks.includes('sell_eggs') && <p>Bán trứng tạm dừng — EXP đã đầy, chờ thăng quân hàm.</p>}<p>Các việc đã giao vẫn tính lương.</p></div>}
      <fieldset><legend className="font-bold mb-2">Phân công — {draft.tasks.length} loại × 50 vàng/ngày</legend><div className="grid grid-cols-2 gap-2">{FARM_TASKS.map(task => <label className="flex items-center gap-2 min-h-11 rounded-lg bg-slate-800 p-2" key={task.id}><input type="checkbox" checked={draft.tasks.includes(task.id)} onChange={() => edit(a => { a.tasks = toggle(a.tasks, task.id); })}/>{task.name}</label>)}</div><p className="text-slate-400 mt-2">Thay đổi chỉ có hiệu lực sau khi xác nhận. Giao 0 việc không xóa lương đã tích lũy.</p></fieldset>
      <fieldset><legend className="font-bold">Phạm vi vườn</legend><label className="flex gap-2 min-h-11 items-center"><input type="radio" checked={draft.scope === 'all'} onChange={() => edit(a => { a.scope = 'all'; })}/>Toàn vườn, gồm ô mở sau này</label><label className="flex gap-2 min-h-11 items-center"><input type="radio" checked={draft.scope === 'selected'} onChange={() => edit(a => { a.scope = 'selected'; })}/>Chỉ các ô chọn bên dưới</label>{draft.scope === 'selected' && <div className="grid grid-cols-4 gap-1">{farm.plots.map((p, i) => <label className="min-h-11 p-2 flex gap-1" key={i}><input type="checkbox" checked={draft.plotIds.includes(i)} onChange={() => edit(a => { a.plotIds = toggle(a.plotIds, i); })}/>{i + 1}{p.status === 'locked' ? ' · khóa' : ''}</label>)}</div>}<p className="text-slate-400">Cây và phân lấy từ lựa chọn thủ công gần nhất của từng ô. Trồng và bón là hai công việc riêng.</p></fieldset>
      <fieldset className="space-y-2"><legend className="font-bold">Máng ăn và đàn mục tiêu</legend><label>Thức ăn <select value={draft.feedId} onChange={e => edit(a => { a.feedId = e.target.value as FarmAssignment['feedId']; })}>{FEED_CATALOG.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label><label className="block">Nạp khi máng còn (%) <input type="number" min="1" max="80" value={draft.feedThreshold} onChange={e => edit(a => { a.feedThreshold = Math.max(1, Math.min(80, Number(e.target.value))); })}/></label><p>Mục tiêu: {Object.values(draft.animalTargets).reduce((sum, n) => sum + (n ?? 0), 0)} / sức chứa {getAnimalCapacity(rank)}. Nạp từng túi đến gần 100%.</p><div className="grid grid-cols-2 gap-2">{ANIMAL_CATALOG.map(animal => <label key={animal.id}>{animal.name}<input aria-label={`Số ${animal.name} mục tiêu`} type="number" min="0" max={getAnimalCapacity(rank)} value={draft.animalTargets[animal.id] ?? 0} onChange={e => edit(a => { a.animalTargets[animal.id] = Math.min(getAnimalCapacity(rank), Math.max(0, Math.floor(Number(e.target.value)))); })}/></label>)}</div><ModalButton onClick={() => edit(a => { a.animalTargets = {}; for (const animal of farm.penAnimals) if (animal.deathAt === null) a.animalTargets[animal.animalTypeId] = (a.animalTargets[animal.animalTypeId] ?? 0) + 1; })}>Lấy đàn hiện tại làm mục tiêu</ModalButton></fieldset>
      <fieldset><legend className="font-bold">Trứng được phép bán</legend><div className="grid grid-cols-2 gap-1">{Object.entries(EGG_INFO_MAP).map(([id, info]) => <label className="min-h-11 flex items-center gap-2" key={id}><input type="checkbox" checked={draft.eggs.includes(id as any)} onChange={() => edit(a => { a.eggs = toggle(a.eggs, id as any); })}/>{info.name}</label>)}</div><div className="flex flex-wrap gap-3">{(['thuong','tot','hiem','hoan_my'] as const).map(q => <label className="min-h-11 flex items-center gap-1" key={q}><input type="checkbox" checked={draft.qualities.includes(q)} onChange={() => edit(a => { a.qualities = toggle(a.qualities, q); })}/>{({thuong:'Thường',tot:'Tốt',hiem:'Hiếm',hoan_my:'Hoàn Mỹ'})[q]}</label>)}</div></fieldset>
      <fieldset className="space-y-2"><legend className="font-bold">Ngân sách vật tư riêng</legend><label className="block">Chi tối đa / cửa sổ 24h <input type="number" min="0" max="1000000" value={draft.restock.dailyLimit} onChange={e => edit(a => { a.restock.dailyLimit = Math.max(0, Math.floor(Number(e.target.value))); })}/></label><label className="block">Số vàng tối thiểu giữ lại <input type="number" min="0" value={draft.restock.reserve} onChange={e => edit(a => { a.restock.reserve = Math.max(0, Math.floor(Number(e.target.value))); })}/></label><ModalButton onClick={() => edit(a => { a.restock.reserve = Math.ceil(projected); })}>Đề xuất giữ {Math.ceil(projected)} vàng cho lương</ModalButton><p>Ngân sách còn: {number(budgetRemaining)} vàng. Sửa phân công hoặc tuyển lại không đặt lại cửa sổ chi.</p><details><summary className="min-h-11 cursor-pointer">Danh mục được phép mua ({draft.restock.items.length})</summary><div className="grid grid-cols-2 gap-2">{supplies.map(item => <label className="min-h-11 flex items-center gap-2" key={item.key}><input type="checkbox" checked={draft.restock.items.includes(item.key)} onChange={() => edit(a => { a.restock.items = toggle(a.restock.items, item.key); })}/>{item.name}</label>)}</div></details><label className="min-h-11 flex gap-2 items-center"><input type="checkbox" checked={draft.restock.confirmed} onChange={e => edit(a => { a.restock.confirmed = e.target.checked; })}/>Tôi xác nhận danh mục, hạn mức và số dư giữ lại này</label></fieldset>
      {worker.blocked.length > 0 && <section><h3 className="font-bold">Đang chờ</h3>{worker.blocked.map(reason => <p className="text-amber-200" key={reason}>{reason}</p>)}</section>}
      {worker.offlineSummary && <section className="rounded-xl bg-slate-800 p-3"><h3 className="font-bold">Trong lúc vắng mặt</h3><p>{worker.offlineSummary.actions} việc · +{number(worker.offlineSummary.gold)} vàng · +{number(worker.offlineSummary.xp)} EXP thực nhận</p><p>Vật tư: {number(worker.offlineSummary.supplies)} vàng · Lương: {number(worker.offlineSummary.wages)} vàng</p></section>}
      <section><h3 className="font-bold">Tổng công việc</h3><p>{worker.totals.actions} việc · thu {number(worker.totals.gold)} vàng · {number(worker.totals.xp)} EXP thực nhận</p><p>Đã chi {number(worker.totals.wages)} vàng lương và {number(worker.totals.supplies)} vàng vật tư.</p></section>
      <details><summary className="min-h-11 cursor-pointer">Lịch sử thu chi gần nhất</summary>{[...worker.log].reverse().map((entry, i) => <p className="py-1 border-b border-slate-700" key={`${entry.at}-${i}`}>{new Date(entry.at).toLocaleString('vi-VN')} · {entry.message}</p>)}</details>
    </div></OverlayBody>
    <OverlayFooter><ModalButton onClick={onClose}>Đóng</ModalButton><ModalButton disabled={!eligible} onClick={() => onConfirm(draft)}>{worker.status === 'employed' ? 'Xác nhận giao việc' : 'Tuyển và xác nhận giao việc'}</ModalButton></OverlayFooter>
  </AppModal>;
}
