import React from "react";
/** Highlight numbers without rewriting, truncating or interpreting catalog copy. */
export function CoreDescription({ text }: { text: string }) {
  return <>{text.split(/([+−-]?\d+(?:[.,]\d+)?(?:%|s)?)/g).map((part, i) =>
    i % 2 ? <strong className="air-core-number" key={i}>{part}</strong> : part)}</>;
}
