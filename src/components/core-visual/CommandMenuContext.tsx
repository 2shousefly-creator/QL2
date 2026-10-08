import { createContext, useContext, type ReactNode } from "react";

type CommandMenu = { kind: "command" | "logistics"; reducedMotion: boolean };
const CommandMenuContext = createContext<CommandMenu | null>(null);
export const useCommandMenu = () => useContext(CommandMenuContext);
/** Context follows React portals; it never changes layout or dialog ownership. */
export function CommandMenuProvider({ children, reducedMotion = false, kind = "command" }: {
  children: ReactNode; reducedMotion?: boolean; kind?: CommandMenu["kind"];
}) {
  return <CommandMenuContext.Provider value={{ kind, reducedMotion }}>{children}</CommandMenuContext.Provider>;
}
