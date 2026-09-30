import huntData from '../../data/huntData';
import { assignVariant, FLAGS, hash, resolveFlags } from '../flags';
import {
  distanceMeters, formatDistance, getStops, huntReducer, initialState, locationChallenges, presetState, progress, totalPoints,
} from '../hunt';

const data = huntData;
const T0 = 1_700_000_000_000;

describe('hunt data', () => {
  it('has 6 locations and every challenge they reference exists', () => {
    expect(data.game_v2.locationList).toHaveLength(6);
    for (const id of data.game_v2.locationList) {
      const loc = data.game_v2.locations[id];
      expect(loc).toBeDefined();
      for (const c of loc.challengeList) expect(data.game_v2.allChallenges[c]).toBeDefined();
    }
  });

  it('totalLocationPoints = check-in + challenge points for every stop', () => {
    for (const id of data.game_v2.locationList) {
      const loc = data.game_v2.locations[id];
      const sum = loc.points + locationChallenges(data, loc).reduce((s, c) => s + c.points, 0);
      expect(sum).toBe(loc.totalLocationPoints);
    }
  });

  it('keeps the original library stop unchanged', () => {
    expect(data.game_v2.locations.library.challengeList).toEqual(['columns', 'symbol', 'teamphoto']);
  });
});

describe('stops and progress', () => {
  it('starts at 0 of 6 with the library as next and the team already there', () => {
    const stops = getStops(data, initialState(data, T0));
    const p = progress(stops);
    expect(p.locationsDone).toBe(0);
    expect(p.locationsTotal).toBe(6);
    expect(p.next?.location.locationId).toBe('library');
    expect(stops[0].here).toBe(true);
    expect(formatDistance(stops[0].distanceM)).toBe("You're here");
    expect(stops.filter((s) => s.status === 'next')).toHaveLength(1);
  });

  it('counts locations, not percent, and moves "next" forward', () => {
    const s = presetState(data, T0, 2);
    const stops = getStops(data, s);
    expect(progress(stops).locationsDone).toBe(2);
    expect(progress(stops).next?.location.locationId).toBe('mint');
    expect(stops.map((x) => x.status)).toEqual(['done', 'done', 'next', 'upcoming', 'upcoming', 'upcoming']);
    expect(totalPoints(stops)).toBe(800);
  });

  it('computes plausible walking distances', () => {
    const lib = data.game_v2.locations.library;
    const mint = data.game_v2.locations.mint;
    const m = distanceMeters(lib, mint);
    expect(m).toBeGreaterThan(300);
    expect(m).toBeLessThan(700);
  });
});

describe('reducer', () => {
  it('completes a stop only after check-in and every challenge, and sets a reward', () => {
    let s = initialState(data, T0);
    s = huntReducer(s, { type: 'CHECK_IN', locationId: 'library', at: T0 + 1 });
    s = huntReducer(s, { type: 'ANSWER', challengeId: 'columns', answer: 'Four', at: T0 + 2, data });
    s = huntReducer(s, { type: 'ANSWER', challengeId: 'symbol', answer: 'An anchor', at: T0 + 3, data });
    expect(s.completedStops.library).toBeUndefined();
    s = huntReducer(s, { type: 'PHOTO', challengeId: 'teamphoto', at: T0 + 4, data });
    expect(s.completedStops.library).toBe(T0 + 4);
    // 100 check-in + 100 correct + 0 wrong + 100 photo
    expect(s.lastReward).toEqual({ locationId: 'library', stopIndex: 0, points: 300, at: T0 + 4 });
    expect(huntReducer(s, { type: 'CLEAR_REWARD' }).lastReward).toBeNull();
  });

  it('allows one attempt per challenge', () => {
    let s = initialState(data, T0);
    s = huntReducer(s, { type: 'ANSWER', challengeId: 'columns', answer: 'Two', at: T0, data });
    const again = huntReducer(s, { type: 'ANSWER', challengeId: 'columns', answer: 'Four', at: T0 + 1, data });
    expect(again.results.columns.correct).toBe(false);
  });

  it('marks the hunt finished when the last stop completes', () => {
    const s = presetState(data, T0, 6);
    expect(s.finishedAt).not.toBeNull();
    expect(totalPoints(getStops(data, s))).toBe(2500);
  });
});

describe('feature flags', () => {
  it('hash is stable', () => {
    expect(hash('abc')).toBe(hash('abc'));
    expect(hash('abc')).not.toBe(hash('abd'));
  });

  it('assignment is sticky per team and flag', () => {
    for (const f of FLAGS) expect(assignVariant('team-1', f.key)).toBe(assignVariant('team-1', f.key));
  });

  it('splits roughly 50/50 across many teams', () => {
    const n = 4000;
    let t = 0;
    for (let i = 0; i < n; i++) if (assignVariant(`team-${i}`, 'hunt_next_stop_card') === 'treatment') t++;
    expect(t / n).toBeGreaterThan(0.45);
    expect(t / n).toBeLessThan(0.55);
  });

  it('modes and overrides resolve as expected', () => {
    expect(Object.values(resolveFlags('x', 'redesign')).every(Boolean)).toBe(true);
    expect(Object.values(resolveFlags('x', 'control')).some(Boolean)).toBe(false);
    expect(resolveFlags('x', 'redesign', { hunt_header_menu: false }).hunt_header_menu).toBe(false);
  });
});

import { contrastRatio, TEXT_PAIRS } from '../../theme/contrast';
import { colors } from '../../theme/tokens';

describe('accessibility: text contrast', () => {
  it.each(TEXT_PAIRS)('%s on %s meets WCAG AAA (7:1): %s', (fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(7);
  });

  it('documents why white-on-orange is not used', () => {
    expect(contrastRatio(colors.white, colors.orange)).toBeLessThan(4.5);
  });
});
