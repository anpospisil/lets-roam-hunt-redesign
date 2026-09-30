// Let's Roam 2026 Q3 design system tokens, plus the contrast rules for this screen.
//
// Contrast rules (WCAG 2.2, checked with the relative-luminance formula):
//   black   on orange #E87722  7.09:1  AAA  -> primary buttons, badges
//   #505759 on white           7.37:1  AAA  -> secondary text
//   black   on green  #7FB141  8.27:1  AAA  -> "Done" states
//   white   on navy   #335573  7.81:1  AAA  -> annotation / info
//   white   on black           21:1    AAA  -> header
//   orange on black            7.09:1        -> progress fill in the header
// Avoid: white on orange (2.96:1), white on teal (2.55:1), grey #A7A8AA text (2.38:1).

export const colors = {
  orange: '#E87722',
  black: '#000000',
  gray4: '#2D2D2D',
  gray3: '#505759',
  gray1: '#D9D9D6',
  white: '#FFFFFF',
  white1: '#F2F2F2',
  light: '#ECECEC',
  offOrange: '#FDF1E9',
  cream: '#FFF4D4',
  brown: '#512A0C',
  green: '#7FB141',
  starYellow: '#FDD264',
  navy: '#335573',
  blue: '#53A6C4',
  red: '#E22222',
} as const;

export const font = {
  regular: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const radius = { pill: 50, card: 10, cardLg: 12, sheet: 20 } as const;

export const shadow = {
  card: {
    shadowColor: '#525252',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
} as const;

/** Minimum touch target (Apple HIG 44pt; Material 48dp). */
export const TOUCH = 44;
