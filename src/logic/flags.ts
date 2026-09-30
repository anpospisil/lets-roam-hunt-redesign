// Feature flags: one per redesign change, so each can ship as its own A/B test.
//
// Assignment is sticky per TEAM (groupId), not per player, so everyone on a
// team sees the same hunt screen: a split team would be comparing different
// screens while walking together, which would contaminate both arms.
// In production this module would be backed by the flag service (LaunchDarkly,
// Statsig, PostHog...), with the same names and the same exposure events.

export type FlagKey =
  | 'hunt_next_stop_card'
  | 'hunt_bottom_action_bar'
  | 'hunt_location_progress'
  | 'hunt_row_states'
  | 'hunt_score_compact'
  | 'hunt_header_menu'
  | 'hunt_reward_carryover';

export interface FlagDef {
  key: FlagKey;
  /** Critique point number from the design canvas. */
  point: number;
  goal: 'Completion' | 'Clarity' | 'Fun';
  title: string;
  offBehaviour: string;
  metric: string;
}

export const FLAGS: FlagDef[] = [
  { key: 'hunt_next_stop_card', point: 1, goal: 'Completion', title: 'Next-stop card',
    offBehaviour: 'Plain list, no "Start here" card', metric: 'Time to first check-in · % finishing stop 1' },
  { key: 'hunt_bottom_action_bar', point: 2, goal: 'Completion', title: 'Bottom action bar',
    offBehaviour: 'Map button in the header, actions via rows', metric: 'Time between stops · map opens per stop' },
  { key: 'hunt_location_progress', point: 3, goal: 'Clarity', title: 'Location progress',
    offBehaviour: '"x% Complete" continuous bar', metric: 'Drop-off by stop · completion rate' },
  { key: 'hunt_row_states', point: 4, goal: 'Clarity', title: 'Row states',
    offBehaviour: 'All rows look the same with an x/y counter', metric: 'Stops visited in order · wrong-stop taps' },
  { key: 'hunt_score_compact', point: 5, goal: 'Clarity', title: 'Compact scoring',
    offBehaviour: 'Dense "Earn points by" grid, always open', metric: 'Scoring-help opens · photo completion' },
  { key: 'hunt_header_menu', point: 7, goal: 'Clarity', title: 'Header menu',
    offBehaviour: 'Four nav icons inline in the header', metric: 'Gallery opens · menu use' },
  { key: 'hunt_reward_carryover', point: 8, goal: 'Fun', title: 'Reward carry-over',
    offBehaviour: 'Numbers update silently', metric: 'End-of-hunt rating · challenges per stop' },
];

export type Variant = 'treatment' | 'control';
export type Flags = Record<FlagKey, boolean>;
export type FlagMode = 'redesign' | 'assigned' | 'control';

/** FNV-1a 32-bit: small, fast, stable across platforms. */
export function hash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** 50/50 split, bucketed per team + flag so flags are assigned independently. */
export function assignVariant(teamId: string, flag: FlagKey, treatmentPercent = 50): Variant {
  return hash(`${teamId}:${flag}`) % 100 < treatmentPercent ? 'treatment' : 'control';
}

export function resolveFlags(teamId: string, mode: FlagMode, overrides: Partial<Flags> = {}): Flags {
  const out = {} as Flags;
  for (const f of FLAGS) {
    const base = mode === 'redesign' ? true : mode === 'control' ? false : assignVariant(teamId, f.key) === 'treatment';
    out[f.key] = overrides[f.key] ?? base;
  }
  return out;
}
