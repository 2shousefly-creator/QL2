import { useEffect, useRef, useState } from "react";

export function useWakeLock(requested: boolean) {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) {
      setIsSupported(false);
      return;
    }

    async function acquireLock() {
      try {
        if (requested && !wakeLockRef.current) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        }
      } catch (err) {
        setIsSupported(false);
      }
    }

    async function releaseLock() {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
        } catch (err) {}
        wakeLockRef.current = null;
      }
    }

    if (requested) {
      acquireLock();
    } else {
      releaseLock();
    }

    return () => {
      releaseLock();
    };
  }, [requested]);

  return { isSupported };
}
