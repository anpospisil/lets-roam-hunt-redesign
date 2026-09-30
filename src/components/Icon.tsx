// Stroke icons drawn to match the design system's Phosphor-style set.
// The DS set has no map/menu/check/camera glyphs, so these fill the gap (see DS README caveat).
import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'map' | 'menu' | 'x' | 'star' | 'check' | 'timer' | 'pin' | 'walk' | 'camera' | 'question'
  | 'bolt' | 'trophy' | 'home' | 'image' | 'gear' | 'flag' | 'chev' | 'arrow' | 'info';

interface Props { name: IconName; size?: number; color?: string; stroke?: number }

export function Icon({ name, size = 20, color = '#000', stroke = 2 }: Props) {
  const p = { stroke: color, strokeWidth: stroke, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  let body: React.ReactNode;
  switch (name) {
    case 'map': body = <><Path {...p} d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" /><Path {...p} d="M9 4v14M15 6v14" /></>; break;
    case 'menu': body = <Path {...p} d="M4 7h16M4 12h16M4 17h16" />; break;
    case 'x': body = <Path {...p} d="M6 6l12 12M18 6 6 18" />; break;
    case 'star': body = <Path fill={color} d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />; break;
    case 'check': body = <Path {...p} d="m5 12.5 4.5 4.5L19 7.5" />; break;
    case 'timer': body = <><Circle {...p} cx={12} cy={13} r={8} /><Path {...p} d="M12 9v4l2.5 2.5M9 2h6" /></>; break;
    case 'pin': body = <><Path {...p} d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><Circle {...p} cx={12} cy={9.5} r={2.5} /></>; break;
    case 'walk': body = <><Circle {...p} cx={13} cy={4} r={2} /><Path {...p} d="m9 21 2.5-7M14.5 21l-1.5-5-2-2 1-5 3 3 3 1M8 12l2-4 3-1" /></>; break;
    case 'camera': body = <><Path {...p} d="M4 8h3l2-3h6l2 3h3v11H4z" /><Circle {...p} cx={12} cy={13} r={3.5} /></>; break;
    case 'question': body = <><Circle {...p} cx={12} cy={12} r={9} /><Path {...p} d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5v.7" /><Circle fill={color} cx={12} cy={17} r={1} /></>; break;
    case 'bolt': body = <Path {...p} d="M13 3 5 14h6l-1 7 8-11h-6z" />; break;
    case 'trophy': body = <Path {...p} d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4" />; break;
    case 'home': body = <Path {...p} d="M4 11 12 4l8 7v9h-5v-6H9v6H4z" />; break;
    case 'image': body = <><Rect {...p} x={3} y={5} width={18} height={14} rx={2} /><Circle {...p} cx={9} cy={10} r={1.8} /><Path {...p} d="m21 16-5-5-8 8" /></>; break;
    case 'gear': body = <><Circle {...p} cx={12} cy={12} r={3} /><Path {...p} d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" /></>; break;
    case 'flag': body = <Path {...p} d="M5 21V4M5 4h11l-2 4 2 4H5" />; break;
    case 'chev': body = <Path {...p} d="m9 6 6 6-6 6" />; break;
    case 'arrow': body = <Path {...p} d="M7 17 17 7M9 7h8v8" />; break;
    case 'info': body = <><Circle {...p} cx={12} cy={12} r={9} /><Path {...p} d="M12 11v6" /><Circle fill={color} cx={12} cy={7.8} r={1} /></>; break;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {body}
    </Svg>
  );
}
