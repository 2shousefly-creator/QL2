import React, { createContext, useContext, useEffect } from "react";
import { usePresence, useReducedMotion } from "motion/react";
import { AppModal, type AppDialogProps } from "../../../components/overlay/AppOverlay";
export const AirCombatMotionContext = createContext(false);
export function AirCombatModal(props:AppDialogProps & { exitDuration?: number }) {
  const [present, remove]=usePresence();
  const contextReduced=useContext(AirCombatMotionContext);
  const systemReduced=useReducedMotion();
  const reduced=contextReduced||systemReduced||props.reducedMotion;
  useEffect(()=>{if(!present){const timer=setTimeout(()=>remove?.(),props.exitDuration ?? (reduced?100:280));return()=>clearTimeout(timer);}},[present,remove,reduced,props.exitDuration]);
  const { exitDuration, ...dialogProps } = props;
  return <AppModal {...dialogProps} reducedMotion={!!reduced} overlayClassName={`${props.overlayClassName??""} ${exitDuration ? "air-core-motion" : ""} air-motion-modal ${present?"":"air-motion-exit"}`} />;
}
export function AirCombatConfirmation(props:Omit<AppDialogProps,"archetype">) {
  return <AirCombatModal {...props} archetype="confirm" />;
}
export const airTooltipMotion={initial:{opacity:0,y:5},animate:{opacity:1,y:0},exit:{opacity:0,y:3},transition:{duration:.28,ease:[.22,1,.36,1] as [number,number,number,number]}};
