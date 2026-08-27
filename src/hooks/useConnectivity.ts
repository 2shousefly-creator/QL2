import { useEffect, useRef, useState } from "react";
import { gameConfig } from "../game/config";

export function useConnectivity(): {
  isVerifiedOnline: boolean;
  verifyNow: () => Promise<boolean>;
} {
  const [lastVerifiedAt, setLastVerifiedAt] = useState<number | null>(null);
  const checkInProgressRef = useRef<boolean>(false);

  const verifyNow = async (): Promise<boolean> => {
    if (checkInProgressRef.current) {
      const now = Date.now();
      return lastVerifiedAt !== null && now - lastVerifiedAt <= gameConfig.connectivityGraceMs;
    }

    checkInProgressRef.current = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), gameConfig.connectivityTimeoutMs);

    try {
      // Add timestamp query parameter to prevent browser caching
      const response = await fetch(`/connectivity-check.txt?t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const now = Date.now();
        setLastVerifiedAt(now);
        checkInProgressRef.current = false;
        return true;
      }
    } catch (err) {
      clearTimeout(timeoutId);
    }

    checkInProgressRef.current = false;
    return false;
  };

  useEffect(() => {
    // Initial verification
    verifyNow();

    const interval = setInterval(() => {
      verifyNow();
    }, gameConfig.connectivityHeartbeatMs);

    return () => clearInterval(interval);
  }, []);

  const now = Date.now();
  const isVerifiedOnline =
    lastVerifiedAt !== null && now - lastVerifiedAt <= gameConfig.connectivityGraceMs;

  return { isVerifiedOnline, verifyNow };
}
