import React from "react";
import { AirCombatBattleShell, type AirCombatBattleProps } from "./AirCombatBattleShell";

export const AirCombatBattle: React.FC<Omit<AirCombatBattleProps, "runtime">> = props => <AirCombatBattleShell {...props} />;
