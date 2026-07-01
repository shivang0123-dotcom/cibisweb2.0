"use client";

import { useEffect } from "react";

/**
 * iOS Safari only applies the CSS :active state during a touch when the
 * document has a touchstart listener. This registers a no-op one so button
 * press feedback works on iPhones too.
 */
export function TouchActive() {
  useEffect(() => {
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });
    return () => document.removeEventListener("touchstart", noop);
  }, []);

  return null;
}
