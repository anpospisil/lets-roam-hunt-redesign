// Pure hunt logic: derive the hunt screen from hunt data + team progress.
// No React here, so it can be unit tested and reused by any UI.
import type { Challenge, HuntData, HuntLocation } from '../data/types';

export type StopStatus = 'done' | 'next' | 'upcoming';

export interface LatLng { lat: number; long: number }

export interface ChallengeResult { correct: boolean; points: number; at: number }

export interface HuntState {
  /** When the team landed on the hunt screen (ms). */
  landedAt: number;
  /** Simulated team position (no live GPS in the demo). */
  position: LatLng;
  checkedIn: Record<string, number>;
  results: Record<string, ChallengeResult>;
  completedStops: Record<string, number>;
  /** Set when a stop is completed, cleared once the hunt screen has celebrated it. */
  lastReward: { locationId: string; stopIndex: number; points: number; at: number } | null;
  finishedAt: number | null;
}

export interface Stop {
  index: number;
  location: HuntLocation;
  challenges: Challenge[];
  status: StopStatus;
  earned: number;
  possible: number;
  tasksDone: number;
  tasksTotal: number;
  distanceM: number;
  here: boolean;
}

/** Within this distance the team counts as "at" a stop and can check in. */
export const ARRIVAL_RADIUS_M = 40;
/** Average walking pace used for "x min walk". */
export const WALK_M_PER_MIN = 80;

export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.long - a.long);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(m: number): string {
  if (m <= ARRIVAL_RADIUS_M) return "You're here";
  const mi = m / 1609.34;
  return `${mi < 0.1 ? '0.1' : mi.toFixed(1)} mi`;
}

export function walkMinutes(m: number): number {
  return Math.max(1, Math.round(m / WALK_M_PER_MIN));
}

export function initialState(data: HuntData, now: number): HuntState {
  const { latitude, longitude } = data.location.region;
  return {
    landedAt: now,
    position: { lat: latitude, long: longitude },
    checkedIn: {},
    results: {},
    completedStops: {},
    lastReward: null,
    finishedAt: null,
  };
}

export function locationChallenges(data: HuntData, loc: HuntLocation): Challenge[] {
  return loc.challengeList.map((id) => data.game_v2.allChallenges[id]).filter(Boolean);
}

/** Ordered stops with their status. The hunt screen lists locations only. */
export function getStops(data: HuntData, state: HuntState): Stop[] {
  let nextAssigned = false;
  return data.game_v2.locationList.map((id, index) => {
    const location = data.game_v2.locations[id];
    const challenges = locationChallenges(data, location);
    const done = Boolean(state.completedStops[id]);
    let status: StopStatus = 'upcoming';
    if (done) status = 'done';
    else if (!nextAssigned) { status = 'next'; nextAssigned = true; }
    const checkin = state.checkedIn[id] ? location.points : 0;
    const earned = checkin + challenges.reduce((s, c) => s + (state.results[c.challengeId]?.points ?? 0), 0);
    const tasksDone = (state.checkedIn[id] ? 1 : 0) + challenges.filter((c) => state.results[c.challengeId]).length;
    const distanceM = distanceMeters(state.position, location);
    return {
      index, location, challenges, status, earned,
      possible: location.totalLocationPoints,
      tasksDone, tasksTotal: challenges.length + 1,
      distanceM, here: distanceM <= ARRIVAL_RADIUS_M,
    };
  });
}

export function totalPoints(stops: Stop[]): number {
  return stops.reduce((s, x) => s + x.earned, 0);
}

export function progress(stops: Stop[]) {
  const done = stops.filter((s) => s.status === 'done').length;
  const tasksDone = stops.reduce((s, x) => s + x.tasksDone, 0);
  const tasksTotal = stops.reduce((s, x) => s + x.tasksTotal, 0);
  return {
    locationsDone: done,
    locationsTotal: stops.length,
    /** Used by the fallback (flag off) "% Complete" readout, as in the original. */
    percent: tasksTotal ? Math.round((tasksDone / tasksTotal) * 100) : 0,
    next: stops.find((s) => s.status === 'next') ?? null,
  };
}

// ---------------------------------------------------------------- reducer

export type HuntAction =
  | { type: 'ARRIVE'; locationId: string; data: HuntData }
  | { type: 'CHECK_IN'; locationId: string; at: number }
  | { type: 'ANSWER'; challengeId: string; answer: string; at: number; data: HuntData }
  | { type: 'PHOTO'; challengeId: string; at: number; data: HuntData }
  | { type: 'CLEAR_REWARD' }
  | { type: 'LOAD'; state: HuntState };

function resolveStop(state: HuntState, data: HuntData, locationId: string, at: number): HuntState {
  const loc = data.game_v2.locations[locationId];
  if (!loc || state.completedStops[locationId]) return state;
  const all = locationChallenges(data, loc).every((c) => state.results[c.challengeId]);
  if (!all || !state.checkedIn[locationId]) return state;
  const stopIndex = data.game_v2.locationList.indexOf(locationId);
  const completedStops = { ...state.completedStops, [locationId]: at };
  const stops = getStops(data, { ...state, completedStops });
  const finished = stops.every((s) => s.status === 'done');
  return {
    ...state,
    completedStops,
    lastReward: { locationId, stopIndex, points: stops[stopIndex].earned, at },
    finishedAt: finished ? at : null,
  };
}

export function huntReducer(state: HuntState, action: HuntAction): HuntState {
  switch (action.type) {
    case 'ARRIVE': {
      const loc = action.data.game_v2.locations[action.locationId];
      return loc ? { ...state, position: { lat: loc.lat, long: loc.long } } : state;
    }
    case 'CHECK_IN':
      if (state.checkedIn[action.locationId]) return state;
      return { ...state, checkedIn: { ...state.checkedIn, [action.locationId]: action.at } };
    case 'ANSWER': {
      const c = action.data.game_v2.allChallenges[action.challengeId];
      if (!c || state.results[c.challengeId]) return state;
      const correct = c.correctAnswer === action.answer;
      const next = { ...state, results: { ...state.results, [c.challengeId]: { correct, points: correct ? c.points : 0, at: action.at } } };
      return c.locationId ? resolveStop(next, action.data, c.locationId, action.at) : next;
    }
    case 'PHOTO': {
      const c = action.data.game_v2.allChallenges[action.challengeId];
      if (!c || state.results[c.challengeId]) return state;
      const next = { ...state, results: { ...state.results, [c.challengeId]: { correct: true, points: c.points, at: action.at } } };
      return c.locationId ? resolveStop(next, action.data, c.locationId, action.at) : next;
    }
    case 'CLEAR_REWARD':
      return state.lastReward ? { ...state, lastReward: null } : state;
    case 'LOAD':
      return action.state;
    default:
      return state;
  }
}

// ---------------------------------------------------------------- demo presets

/** Build a state where the first `n` stops are fully complete (every answer correct). */
export function presetState(data: HuntData, now: number, completeCount: number): HuntState {
  let s = initialState(data, now - completeCount * 12 * 60000);
  const ids = data.game_v2.locationList.slice(0, completeCount);
  ids.forEach((id, i) => {
    const t = s.landedAt + (i + 1) * 12 * 60000;
    s = huntReducer(s, { type: 'ARRIVE', locationId: id, data });
    s = huntReducer(s, { type: 'CHECK_IN', locationId: id, at: t });
    for (const c of locationChallenges(data, data.game_v2.locations[id])) {
      s = c.type === 'photo'
        ? huntReducer(s, { type: 'PHOTO', challengeId: c.challengeId, at: t, data })
        : huntReducer(s, { type: 'ANSWER', challengeId: c.challengeId, answer: c.correctAnswer ?? '', at: t, data });
    }
  });
  return { ...s, lastReward: null };
}
