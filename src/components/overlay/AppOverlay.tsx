import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

const joinClasses = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export type OverlayLayer =
  | "normal"
  | "nested"
  | "exclusive"
  | "exclusive-dialog"
  | "system";

type OverlayPortalProps = {
  children: ReactNode;
};

const useClientLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

export function OverlayHost() {
  return <div id="app-overlay-root" className="app-overlay-portal-root" />;
}

export function OverlayPortal({ children }: OverlayPortalProps) {
  // Most overlays open after App has mounted its host. Resolve that existing
  // host during render so portal children participate in the same commit and
  // parent effects can safely read refs inside the portal (canvas/game surfaces
  // depend on this). Keep the layout-effect fallback for the very first app
  // commit where the host may not exist yet.
  const [target, setTarget] = useState<HTMLElement | null>(() =>
    typeof document === "undefined"
      ? null
      : document.getElementById("app-overlay-root")
  );

  useClientLayoutEffect(() => {
    if (target) return;
    setTarget(document.getElementById("app-overlay-root") ?? document.body);
  }, [target]);

  if (typeof document === "undefined") return <>{children}</>;
  return target ? createPortal(children, target) : null;
}

let bodyLockCount = 0;
let savedBodyOverflow = "";
let savedBodyOverscrollBehavior = "";
let savedRootOverflow = "";
let savedRootOverscrollBehavior = "";

function acquireBodyScrollLock() {
  if (bodyLockCount === 0) {
    savedBodyOverflow = document.body.style.overflow;
    savedBodyOverscrollBehavior = document.body.style.overscrollBehavior;
    savedRootOverflow = document.documentElement.style.overflow;
    savedRootOverscrollBehavior = document.documentElement.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
  }

  bodyLockCount += 1;
  let released = false;

  return () => {
    if (released) return;
    released = true;
    bodyLockCount = Math.max(0, bodyLockCount - 1);

    if (bodyLockCount === 0) {
      document.body.style.overflow = savedBodyOverflow;
      document.body.style.overscrollBehavior = savedBodyOverscrollBehavior;
      document.documentElement.style.overflow = savedRootOverflow;
      document.documentElement.style.overscrollBehavior = savedRootOverscrollBehavior;
    }
  };
}

export function useBodyScrollLock(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;
    return acquireBodyScrollLock();
  }, [enabled]);
}

type DialogStackEntry = {
  token: symbol;
  priority: number;
  notification: boolean;
};

const FOCUS_LAYER_PRIORITY: Record<OverlayLayer, number> = {
  normal: 10,
  nested: 20,
  exclusive: 30,
  "exclusive-dialog": 40,
  system: 50,
};

const dialogStack: DialogStackEntry[] = [];
const overlayListeners = new Set<() => void>();
const publishOverlayStack = () => overlayListeners.forEach((listener) => listener());
const subscribeOverlayStack = (listener: () => void) => {
  overlayListeners.add(listener);
  return () => { overlayListeners.delete(listener); };
};

/** Pending notifications wait for owned dialogs; they never displace an action. */
export function useOverlayBusy(includeFullscreen = true) {
  return useSyncExternalStore(
    subscribeOverlayStack,
    () => dialogStack.some((entry) => !entry.notification &&
      (includeFullscreen || entry.priority !== FOCUS_LAYER_PRIORITY.exclusive)),
    () => false,
  );
}

function isTopDialog(token: symbol) {
  const topEntry = dialogStack.reduce<DialogStackEntry | null>(
    (currentTop, entry) => (
      !currentTop || entry.priority >= currentTop.priority ? entry : currentTop
    ),
    null,
  );
  return topEntry?.token === token;
}
const FOCUSABLE_SELECTOR = [
  "[data-overlay-autofocus]",
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hidden && element.getAttribute("aria-hidden") !== "true",
  );
}

function useDialogFocus(
  panelRef: RefObject<HTMLElement | null>,
  onClose: (() => void) | undefined,
  closeOnEscape: boolean,
  initialFocusRef?: RefObject<HTMLElement | null>,
  priority = FOCUS_LAYER_PRIORITY.normal,
  notification = false,
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useClientLayoutEffect(() => {
    const token = Symbol("app-dialog");
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    dialogStack.push({ token, priority, notification });
    publishOverlayStack();

    const focusFrame = window.requestAnimationFrame(() => {
      if (!isTopDialog(token)) return;
      const panel = panelRef.current;
      if (!panel) return;
      const requested = initialFocusRef?.current;
      const firstFocusable = getFocusableElements(panel)[0];
      (requested ?? firstFocusable ?? panel).focus({ preventScroll: true });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isTopDialog(token)) return;

      if (event.key === "Escape" && closeOnEscape && onCloseRef.current) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = getFocusableElements(panel);
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown, true);
      const wasTopDialog = isTopDialog(token);
      const stackIndex = dialogStack.findIndex((entry) => entry.token === token);
      if (stackIndex >= 0) dialogStack.splice(stackIndex, 1);
      publishOverlayStack();
      if (wasTopDialog && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [closeOnEscape, initialFocusRef, panelRef, priority, notification]);
}

/**
 * Measures the real HUD/navigation edges and mirrors the visual viewport into
 * CSS variables consumed by every app-safe overlay. The key should change
 * whenever app chrome is mounted or suppressed.
 */
export function useAppChromeMetrics(refreshKey: unknown) {
  useClientLayoutEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    let frame = 0;

    const measure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const viewportOffsetTop = viewport?.offsetTop ?? 0;
        const viewportHeight = viewport?.height ?? window.innerHeight;
        const viewportBottom = viewportOffsetTop + viewportHeight;
        const hud = document.querySelector<HTMLElement>("[data-app-hud]");
        const navigation = document.querySelector<HTMLElement>("[data-app-navigation]");
        const hudRect = hud?.getBoundingClientRect();
        const navigationRect = navigation?.getBoundingClientRect();

        const measuredTop = hudRect && hudRect.bottom > viewportOffsetTop && hudRect.top < viewportBottom
          ? Math.min(viewportHeight, Math.max(0, hudRect.bottom - viewportOffsetTop))
          : 0;
        const measuredBottom = navigationRect && navigationRect.bottom > viewportOffsetTop && navigationRect.top < viewportBottom
          ? Math.min(viewportHeight, Math.max(0, viewportBottom - navigationRect.top))
          : 0;

        root.style.setProperty("--app-visual-viewport-offset-top", `${viewportOffsetTop}px`);
        root.style.setProperty("--app-visual-viewport-height", `${viewportHeight}px`);
        root.style.setProperty("--app-overlay-measured-top", `${measuredTop}px`);
        root.style.setProperty("--app-overlay-measured-bottom", `${measuredBottom}px`);
      });
    };

    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    const hud = document.querySelector<HTMLElement>("[data-app-hud]");
    const navigation = document.querySelector<HTMLElement>("[data-app-navigation]");
    if (hud) observer?.observe(hud);
    if (navigation) observer?.observe(navigation);

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    viewport?.addEventListener("resize", measure);
    viewport?.addEventListener("scroll", measure);

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      viewport?.removeEventListener("resize", measure);
      viewport?.removeEventListener("scroll", measure);
    };
  }, [refreshKey]);
}

type OverlayPanelProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export const OverlayPanel = forwardRef<HTMLElement, OverlayPanelProps>(function OverlayPanel(
  { className, children, ...props },
  ref,
) {
  return (
    <section ref={ref} tabIndex={-1} className={joinClasses("military-modal app-overlay__panel", className)} {...props}>
      {children}
    </section>
  );
});

export function OverlayHeader({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <header className={joinClasses("app-overlay__header", className)} {...props} />;
}

export function OverlayBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={joinClasses("app-overlay__body", className)} {...props} />;
}

export function OverlayFooter({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <footer className={joinClasses("app-overlay__footer", className)} {...props} />;
}

type AppDialogProps = {
  children: ReactNode;
  notification?: boolean;
  onClose?: () => void;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  layer?: Exclude<OverlayLayer, "exclusive">;
  layout?: "app-safe" | "viewport-safe";
  ariaLabel?: string;
  labelledBy?: string;
  describedBy?: string;
  overlayClassName?: string;
  panelClassName?: string;
  panelProps?: Omit<HTMLAttributes<HTMLElement>, "children" | "className">;
  initialFocusRef?: RefObject<HTMLElement | null>;
};

function AppDialog({
  children,
  notification = false,
  onClose,
  closeOnBackdrop = false,
  closeOnEscape = true,
  layer = "normal",
  layout = "app-safe",
  ariaLabel,
  labelledBy,
  describedBy,
  overlayClassName,
  panelClassName,
  panelProps,
  initialFocusRef,
  sheet,
}: AppDialogProps & { sheet: boolean }) {
  const panelRef = useRef<HTMLElement>(null);
  useBodyScrollLock(true);
  useDialogFocus(panelRef, onClose, closeOnEscape, initialFocusRef, FOCUS_LAYER_PRIORITY[layer], notification);

  return (
    <OverlayPortal>
      <div
        className={joinClasses(
          "app-overlay",
          sheet ? "app-overlay--sheet" : "app-overlay--modal",
          overlayClassName,
        )}
        data-overlay-layer={layer}
        data-overlay-layout={layout}
        onClick={(event) => {
          event.stopPropagation();
          if (closeOnBackdrop && event.target === event.currentTarget) onClose?.();
        }}
        onPointerDown={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <OverlayPanel
          ref={panelRef as Ref<HTMLElement>}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          className={joinClasses(sheet && "military-sheet", panelClassName)}
          {...panelProps}
        >
          {children}
        </OverlayPanel>
      </div>
    </OverlayPortal>
  );
}

export function AppModal(props: AppDialogProps) {
  return <AppDialog {...props} sheet={false} />;
}

export function AppBottomSheet(props: AppDialogProps) {
  return <AppDialog {...props} sheet />;
}

type ExclusiveFullscreenOverlayProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  layer?: "exclusive" | "system";
  ariaLabel?: string;
  onEscape?: () => void;
};

export function ExclusiveFullscreenOverlay({
  children,
  layer = "exclusive",
  ariaLabel,
  onEscape,
  className,
  ...props
}: ExclusiveFullscreenOverlayProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  useBodyScrollLock(true);
  useDialogFocus(contentRef, onEscape, Boolean(onEscape), undefined, FOCUS_LAYER_PRIORITY[layer]);

  return (
    <OverlayPortal>
      <div
        className="app-exclusive-overlay"
        data-overlay-layer={layer}
        role="application"
        aria-label={ariaLabel}
      >
        <div ref={contentRef} tabIndex={-1} className={joinClasses("app-exclusive-overlay__content", className)} {...props}>
          {children}
        </div>
      </div>
    </OverlayPortal>
  );
}
