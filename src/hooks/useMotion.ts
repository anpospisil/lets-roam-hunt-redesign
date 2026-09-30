import { createContext, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Follows the OS "Reduce motion" setting. */
export function useSystemReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => alive && setReduced(v)).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { alive = false; sub.remove(); };
  }, []);
  return reduced;
}

/** Resolved value (OS setting OR the demo panel's override), provided at the app root. */
export const ReducedMotionContext = createContext(false);
export const useReducedMotion = () => useContext(ReducedMotionContext);

/** Re-renders every `ms` so countdowns stay live. */
export function useNow(ms = 1000): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
