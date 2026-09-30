// Text with the design system's type baked in (Plus Jakarta Sans, black by default).
import React from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';
import { colors, font } from '../theme/tokens';

type Weight = keyof typeof font;

interface Props extends TextProps {
  w?: Weight;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  /** Letter-spaced uppercase label (DS "label" style, tightened for mobile). */
  label?: boolean;
}

export function T({ w = 'regular', size = 16, color = colors.black, label, style, ...rest }: Props) {
  return (
    <Text
      {...rest}
      style={[
        { fontFamily: font[w], fontSize: size, color, lineHeight: Math.round(size * (label ? 1.3 : 1.4)) },
        label && { letterSpacing: size * 0.16, textTransform: 'uppercase' },
        style,
      ]}
    />
  );
}
