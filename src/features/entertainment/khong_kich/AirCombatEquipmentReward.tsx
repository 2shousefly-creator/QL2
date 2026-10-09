import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { OverlayBody, OverlayHeader } from "../../../components/overlay/AppOverlay";
import { AirCombatModal } from "./AirCombatMotion";
import { EquipmentIcon } from "./EquipmentIcon";
import { EquipmentDetails } from "./EquipmentDetails";
import { EQUIPMENT_CATALOG, EQUIPMENT_NAME_COLORS, type EquipmentDefinitionId } from "./airCombatEquipmentCatalog";
import type { EquipmentRewardChoice } from "./airCombatEquipmentState";
import type { AircraftCombatState } from "./airCombatTypes";

const rarityLabels = { component: "Thành phần", completed: "Hoàn chỉnh", legendary: "Huyền thoại" };
type Props = { state: AircraftCombatState; choice: EquipmentRewardChoice; reducedMotion: boolean;
  onChoose(id: EquipmentDefinitionId, choice: EquipmentRewardChoice): void };

function RewardRound({ state, choice, reducedMotion, onChoose, enabled }: Props & { enabled: boolean }) {
  // Snapshot mutable runtime choices so an exiting list keeps its original cards.
  const [options] = useState(() => [...choice.options]);
  const [selected, setSelected] = useState<EquipmentDefinitionId | null>(null);
  const pending = useRef(false), timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const root = useRef<HTMLDivElement>(null), onChooseRef = useRef(onChoose);
  onChooseRef.current = onChoose;
  const present = useIsPresent();
  useLayoutEffect(() => {
    const body = root.current?.closest(".app-overlay__body");
    if (body) body.scrollTop = 0;
    root.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => { if (!present || !enabled) clearTimeout(timer.current); }, [present, enabled]);
  const choose = (id: EquipmentDefinitionId) => {
    if (pending.current || !present || !enabled) return;
    pending.current = true;
    setSelected(id);
    timer.current = setTimeout(() => {
      timer.current = undefined;
      onChooseRef.current(id, choice);
    }, 1000);
  };
  return <motion.div ref={root} tabIndex={-1} className="air-equipment-reward-round" role="group" aria-label="Danh sách trang bị để chọn"
    initial={{ opacity: 0, x: reducedMotion ? 0 : 32 }} animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: reducedMotion ? 0 : -32 }} transition={{ duration: reducedMotion ? .1 : .22 }}>
    <div className="air-equipment-reward-grid" data-components={options.every(id => EQUIPMENT_CATALOG[id].rarity === "component")}>
      {options.map(id => {
        const d = EQUIPMENT_CATALOG[id], active = selected === id;
        return <button key={id} type="button" className="air-equipment-reward-card"
          style={{ "--equipment-accent": EQUIPMENT_NAME_COLORS[d.rarity] } as CSSProperties}
          aria-pressed={active} aria-labelledby={`reward-name-${id}`} aria-describedby={`reward-details-${id}`}
          disabled={selected !== null || !present || !enabled} onClick={() => choose(id)}>
          <span className="air-equipment-reward-heading"><EquipmentIcon id={id} inventory />
            <span><small>{rarityLabels[d.rarity]}</small><strong id={`reward-name-${id}`}>{d.name}</strong></span>
          </span>
          <div id={`reward-details-${id}`} className="air-equipment-reward-details"><EquipmentDetails id={id} state={state} /></div>
          <span className="air-equipment-reward-select">{active ? <><Check size={15} aria-hidden="true" /> Đã chọn · đang nhận</> : "Chọn trang bị"}</span>
        </button>;
      })}
    </div>
    <p className="air-equipment-reward-announcement" role="status" aria-live="polite">
      {selected ? `Đã chọn ${EQUIPMENT_CATALOG[selected].name}. Áp dụng sau 1 giây.` : "Chọn một trang bị. Vuốt hoặc cuộn để xem toàn bộ danh sách."}
    </p>
  </motion.div>;
}

export function AirCombatEquipmentReward(props: Props) {
  const systemReduced = useReducedMotion(), reducedMotion = props.reducedMotion || !!systemReduced;
  const { choice } = props;
  const enabled = useIsPresent();
  const round = useRef({ choice, remaining: choice.remaining, index: 0 });
  if (round.current.choice !== choice || round.current.remaining !== choice.remaining) {
    round.current = { choice, remaining: choice.remaining, index: round.current.index + 1 };
  }
  const roundKey = round.current.index;
  return <AirCombatModal archetype="transaction" layer="exclusive-dialog" layout="viewport-safe" closeOnEscape={false}
    labelledBy="air-equipment-reward-title" reducedMotion={reducedMotion} panelClassName="air-equipment-reward-panel">
    <OverlayHeader className="air-equipment-reward-header"><div>
      <h2 id="air-equipment-reward-title" className="modal-title">CHỌN TRANG BỊ</h2>
      <p>Còn {choice.remaining} lựa chọn trong danh sách này</p>
    </div></OverlayHeader>
    <OverlayBody className="air-equipment-reward-body">
      <AnimatePresence mode="wait"><RewardRound key={roundKey} {...props} reducedMotion={reducedMotion} enabled={enabled} /></AnimatePresence>
    </OverlayBody>
  </AirCombatModal>;
}
