import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";

export type ModalArchetype = "result" | "confirm" | "info" | "transaction" | "ceremony";
export type ModalStatus = "neutral" | "success" | "danger" | "warning" | "reward" | "info";
export type ModalTheme = "default" | "paper" | "farm";

const classes = (...values: Array<string | undefined | false>) => values.filter(Boolean).join(" ");

export const ModalButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "icon";
}>(function ModalButton({ variant = "secondary", className, type = "button", ...props }, ref) {
  return <button ref={ref} type={type} className={classes("modal-button", `modal-button--${variant}`, className)} {...props} />;
});

export function ModalActions({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <footer className={classes("app-overlay__footer modal-actions", className)} {...props} />;
}

export function ResultHero({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <header className={classes("app-overlay__header result-hero", className)} {...props} />;
}

export function ResultStats({ className, ...props }: HTMLAttributes<HTMLDListElement>) {
  return <dl className={classes("result-stats", className)} {...props} />;
}

export function ResultStat({ label, value, status }: {
  label: ReactNode;
  value: ReactNode;
  status?: ModalStatus;
}) {
  return <div className="result-stat" data-stat-status={status}><dt>{label}</dt><dd>{value}</dd></div>;
}

// Fullscreen results share the dialog anatomy inside their existing exclusive
// layer. Only the body scrolls; result actions stay reachable on short screens.
export function GameResultScreen({ className, status = "neutral", children, ...props }: HTMLAttributes<HTMLDivElement> & {
  status?: ModalStatus;
}) {
  return <div className={classes("modal-design game-result-screen", className)} data-modal-archetype="result" data-modal-status={status} {...props}>{children}</div>;
}
