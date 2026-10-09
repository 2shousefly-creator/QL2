import { createContext, useContext, type ReactNode } from "react";

export type UiSkin = "flat" | "legacy";
const UiSkinContext = createContext<UiSkin>("legacy");
export const useUiSkin = () => useContext(UiSkinContext);
/** Presentation only. Context follows portals without adding layout wrappers. */
export function UiSkinProvider({skin,children}:{skin:UiSkin;children:ReactNode}) {
  return <UiSkinContext.Provider value={skin}>{children}</UiSkinContext.Provider>;
}
