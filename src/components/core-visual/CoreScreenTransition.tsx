import React from "react";
/** Fade only: transforms on this ancestor would change fixed modal positioning. */
export const CoreScreenTransition: React.FC<{
  children?: React.ReactNode; reducedMotion?: boolean; className?: string; enabled?: boolean;
}> = ({ children, reducedMotion, className = "", enabled = true }) => {
  return <div className={`${enabled ? "core-screen-transition" : ""} ${className}`} data-core-motion={reducedMotion ? "reduced" : undefined}>{children}</div>;
};
