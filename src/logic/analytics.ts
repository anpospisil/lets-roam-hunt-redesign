// Minimal analytics client. Events are what the A/B metrics are computed from;
// the demo panel subscribes and shows them live. In production, `send` would
// forward to the real pipeline (Segment, Amplitude, PostHog...).

export type EventName =
  | 'hunt_screen_viewed'
  | 'flag_exposure'
  | 'stop_tapped'
  | 'map_opened'
  | 'arrived_at_stop'
  | 'first_check_in'
  | 'check_in'
  | 'challenge_opened'
  | 'challenge_answered'
  | 'photo_submitted'
  | 'stop_completed'
  | 'scoring_help_opened'
  | 'menu_opened'
  | 'menu_item_selected'
  | 'gallery_opened'
  | 'hunt_completed'
  | 'satisfaction_rating';

export type EventProps = Record<string, string | number | boolean | null>;

export interface TrackedEvent { id: number; name: EventName; at: number; props: EventProps }

type Listener = (events: TrackedEvent[]) => void;

let events: TrackedEvent[] = [];
let seq = 0;
const listeners = new Set<Listener>();
const exposed = new Set<string>();

export function track(name: EventName, props: EventProps = {}, at: number = Date.now()): TrackedEvent {
  const e = { id: ++seq, name, at, props };
  events = [e, ...events].slice(0, 200);
  listeners.forEach((l) => l(events));
  return e;
}

/** Log a flag exposure once per session per flag+variant (the denominator of every test). */
export function trackExposure(flag: string, variant: string, teamId: string) {
  const k = `${flag}:${variant}`;
  if (exposed.has(k)) return;
  exposed.add(k);
  track('flag_exposure', { flag, variant, team_id: teamId });
}

export function subscribe(l: Listener): () => void {
  listeners.add(l);
  l(events);
  return () => { listeners.delete(l); };
}

export function resetAnalytics() {
  events = [];
  exposed.clear();
  listeners.forEach((l) => l(events));
}
