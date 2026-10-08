export type DomVisualAnchor = { id: string; x: number; y: number; width: number; height: number; selected: boolean };

/** Geometry follows DOM layout events, never a Pixi ticker. */
export function observeDomVisualAnchors(root: HTMLElement, selector: string, changed: (anchors: DomVisualAnchor[]) => void) {
  let frame = 0, disposed = false;
  const observed = new Set<Element>();
  const measure = () => {
    frame = 0;
    if (disposed) return;
    const origin = root.getBoundingClientRect();
    const elements = Array.from(root.querySelectorAll<HTMLElement>(selector));
    for (const element of observed) if (!elements.includes(element as HTMLElement)) { resize.unobserve(element); observed.delete(element); }
    elements.forEach(element => { if (!observed.has(element)) { observed.add(element); resize.observe(element); } });
    changed(elements.filter(element => element.getClientRects().length).map((element, index) => {
      const rect = element.getBoundingClientRect();
      return { id: `${element.dataset.commandAnchor ?? "surface"}-${index}`, x: rect.left - origin.left, y: rect.top - origin.top,
        width: rect.width, height: rect.height, selected: element.getAttribute("aria-current") === "page" || element.dataset.commandSelected === "true" };
    }));
  };
  const schedule = () => { if (!frame && !disposed) frame = requestAnimationFrame(measure); };
  const resize = new ResizeObserver(schedule); resize.observe(root);
  const mutation = new MutationObserver(schedule);
  mutation.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-current", "data-command-selected", "hidden"] });
  root.addEventListener("scroll", schedule, true);
  root.addEventListener("transitionend", schedule);
  window.addEventListener("resize", schedule);
  schedule();
  return () => { disposed = true; cancelAnimationFrame(frame); resize.disconnect(); mutation.disconnect();
    root.removeEventListener("scroll", schedule, true); root.removeEventListener("transitionend", schedule); window.removeEventListener("resize", schedule); };
}
