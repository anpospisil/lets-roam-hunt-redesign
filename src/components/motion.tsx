// Small animation primitives. All of them respect reduced motion (render the end state).
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import { useReducedMotion } from '../hooks/useMotion';
import { colors } from '../theme/tokens';

const native = true;

/** An orange halo that breathes around its child: marks "this is next". */
export function PulseHalo({ radius, style, children }: { radius: number; style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) { v.setValue(0); return; }
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: native }));
    loop.start();
    return () => loop.stop();
  }, [reduced, v]);
  return (
    <Animated.View style={[{ position: 'relative' }, style]}>
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute', top: -2, left: -2, right: -2, bottom: -2, borderRadius: radius + 2,
          borderWidth: 3, borderColor: colors.orange,
          opacity: reduced ? 0 : v.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.8, 0, 0] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }],
        }}
      />
      {children}
    </Animated.View>
  );
}

/** Rises in, holds, then fades out. `onDone` fires at the end (or at once when reduced). */
export function FloatUp({ children, style, onDone, hold = 1400 }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onDone?: () => void; hold?: number }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = reduced
      ? Animated.sequence([Animated.timing(v, { toValue: 0.5, duration: 0, useNativeDriver: native }), Animated.delay(hold + 600)])
      : Animated.sequence([
          Animated.timing(v, { toValue: 0.5, duration: 300, easing: Easing.out(Easing.back(1.5)), useNativeDriver: native }),
          Animated.delay(hold),
          Animated.timing(v, { toValue: 1, duration: 400, useNativeDriver: native }),
        ]);
    anim.start(() => onDone?.());
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={[style, {
        opacity: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] }),
        transform: [{ translateY: reduced ? 0 : v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [12, 0, -16] }) }],
      }]}
    >
      {children}
    </Animated.View>
  );
}

/** Slides up into place (toasts). */
export function RiseIn({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) return;
    Animated.spring(v, { toValue: 1, useNativeDriver: native, friction: 7 }).start();
  }, [reduced, v]);
  return (
    <Animated.View style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}

/** Scales in with a small overshoot (completed check marks). */
export function PopIn({ children, active, style }: { children: React.ReactNode; active: boolean; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(active && !reduced ? 0.3 : 1)).current;
  useEffect(() => {
    if (!active || reduced) { v.setValue(1); return; }
    v.setValue(0.3);
    Animated.spring(v, { toValue: 1, useNativeDriver: native, friction: 4, tension: 120 }).start();
  }, [active, reduced, v]);
  return <Animated.View style={[style, { transform: [{ scale: v }] }]}>{children}</Animated.View>;
}

/** Fills a bar segment from 0 to full width (progress carry-over). */
export function FillBar({ animate, color, height, radius }: { animate: boolean; color: string; height: number; radius: number }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(animate && !reduced ? 0 : 1)).current;
  useEffect(() => {
    if (!animate || reduced) { v.setValue(1); return; }
    v.setValue(0);
    Animated.timing(v, { toValue: 1, duration: 900, delay: 250, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [animate, reduced, v]);
  return (
    <Animated.View
      style={{ height, borderRadius: radius, backgroundColor: color, width: v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }}
    />
  );
}
