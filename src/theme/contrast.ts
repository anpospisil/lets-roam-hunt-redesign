// WCAG 2.2 contrast checks for the colour pairs this screen uses for text.
// Enforced by src/logic/__tests__/logic.test.ts so a token change can't silently break readability.
import { colors } from './tokens';

function luminance(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** [text, background, where it's used]. Every pair must meet AAA (7:1). */
export const TEXT_PAIRS: [string, string, string][] = [
  [colors.black, colors.orange, 'Primary buttons, next-stop strip, badges'],
  [colors.black, colors.white, 'Body text'],
  [colors.gray3, colors.white, 'Secondary text on cards'],
  [colors.gray4, colors.white, 'Descriptions'],
  [colors.black, colors.green, 'Done badges and checks'],
  [colors.brown, colors.offOrange, 'Chips'],
  [colors.brown, colors.cream, 'Notices, photo placeholders'],
  [colors.white, colors.black, 'Header text'],
  [colors.gray1, colors.black, 'Header secondary text'],
  [colors.white, colors.gray4, 'Header buttons, points pill'],
  [colors.gray1, colors.gray4, '"pts" label in the points pill'],
  [colors.black, colors.starYellow, '+points chip, photo badge'],
  [colors.white, colors.navy, 'Info'],
];
