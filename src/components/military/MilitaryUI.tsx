import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";

const joinClasses = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

type CommandHeaderProps = HTMLAttributes<HTMLElement> & {
  code: string;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
};

export function CommandHeader({
  code,
  title,
  subtitle,
  icon,
  action,
  className,
  ...props
}: CommandHeaderProps) {
  return (
    <header className={joinClasses("command-header", className)} {...props}>
      {icon ? <div className="command-header__icon">{icon}</div> : null}
      <div className="command-header__copy">
        <span className="command-header__code">{code}</span>
        <h1 className="command-header__title">{title}</h1>
        {subtitle ? <p className="command-header__subtitle">{subtitle}</p> : null}
      </div>
      {action ? <div className="command-header__action">{action}</div> : null}
    </header>
  );
}

export function CommandPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={joinClasses("command-panel", className)} {...props} />;
}

export function TacticalCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={joinClasses("tactical-card", className)} {...props} />;
}

type MilitaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "tactical" | "danger" | "ghost" | "icon";
};

export function MilitaryButton({
  variant = "primary",
  className,
  type = "button",
  ...props
}: MilitaryButtonProps) {
  return (
    <button
      type={type}
      className={joinClasses("military-button", `military-button--${variant}`, className)}
      {...props}
    />
  );
}

export function StatusTag({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={joinClasses("status-tag", className)} {...props} />;
}

export function DataReadout({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={joinClasses("data-readout", className)} {...props} />;
}

export function TacticalDivider({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={joinClasses("tactical-divider", className)} aria-hidden="true" {...props} />;
}

export function MilitaryModal({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={joinClasses("military-modal", className)} {...props} />;
}

export function MilitarySheet({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={joinClasses("military-sheet", className)} {...props} />;
}
