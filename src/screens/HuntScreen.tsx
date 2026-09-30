// The redesigned main hunt screen. Everything it shows is derived from hunt data + HuntState,
// and each redesign change is gated by its own feature flag (see src/logic/flags.ts).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Header, NavItem } from '../components/Header';
import { BottomBar, Menu, Toast } from '../components/Overlays';
import { FinishScreen, GallerySheet, MapSheet, NoticeSheet, ScoreHelpSheet, StopSheet } from '../components/Sheets';
import { HowToScore, NextStopCard, StopRow } from '../components/Stops';
import { T } from '../components/T';
import { imageFor } from '../data/images';
import type { Challenge, HuntData } from '../data/types';
import { useNow } from '../hooks/useMotion';
import { track } from '../logic/analytics';
import type { Flags } from '../logic/flags';
import { getStops, HuntAction, HuntState, progress, Stop, totalPoints } from '../logic/hunt';
import { colors } from '../theme/tokens';

type SheetState =
  | { kind: 'map'; source: string }
  | { kind: 'stop'; id: string }
  | { kind: 'gallery' }
  | { kind: 'help' }
  | { kind: 'notice'; title: string; body: string }
  | null;

interface Props {
  data: HuntData;
  state: HuntState;
  dispatch: (a: HuntAction) => void;
  flags: Flags;
  insets: { top: number; bottom: number };
  onRestart: () => void;
}

/** Short names keep the bottom-bar button on one line ("Head to Art Museum"). */
export function shortName(name: string): string {
  return name.replace(/^Denver /, '').replace(/ at Denver$/, '').replace(/^Colorado /, '').replace(/ Center$/, '');
}

export function HuntScreen({ data, state, dispatch, flags, insets, onRestart }: Props) {
  const now = useNow(1000);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerH, setHeaderH] = useState(140);
  const [celebrating, setCelebrating] = useState<HuntState['lastReward']>(null);
  const scrollRef = useRef<ScrollView>(null);

  const stops = useMemo(() => getStops(data, state), [data, state]);
  const prog = progress(stops);
  const points = totalPoints(stops);
  const next = prog.next;
  const info = data.group.info;
  const photoChallenges = Object.values(data.game_v2.allChallenges).filter(
    (c) => c.type === 'photo' && c.locationId && state.results[c.challengeId],
  );

  // Timer: counts down from timerLimitMinutes since landing.
  const limitMs = data.game_v2.timerLimitMinutes * 60000;
  const leftMs = Math.max(0, limitMs - (now - state.landedAt));
  const timeLeft = `${Math.floor(leftMs / 60000)}:${String(Math.floor((leftMs % 60000) / 1000)).padStart(2, '0')}`;

  // Reward carry-over: when a stop completes, celebrate on the hunt screen once the sheet is closed.
  useEffect(() => {
    if (!state.lastReward || sheet) return;
    const r = state.lastReward;
    const stop = stops[r.stopIndex];
    const checkinAt = state.checkedIn[r.locationId];
    track('stop_completed', {
      location_id: r.locationId, stop_index: r.stopIndex, points: r.points,
      ms_since_check_in: checkinAt ? r.at - checkinAt : null, locations_complete: prog.locationsDone,
    });
    if (state.finishedAt) {
      track('hunt_completed', { points, ms_total: state.finishedAt - state.landedAt });
    }
    dispatch({ type: 'CLEAR_REWARD' });
    if (!flags.hunt_reward_carryover || state.finishedAt) return;
    setCelebrating(r);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.lastReward, sheet]);

  useEffect(() => {
    if (!celebrating) return;
    const t = setTimeout(() => setCelebrating(null), 3400);
    return () => clearTimeout(t);
  }, [celebrating]);

  useEffect(() => {
    track('hunt_screen_viewed', { locations_complete: prog.locationsDone, next_stop: next?.location.locationId ?? null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.landedAt]);

  // ---------------------------------------------------------------- actions
  const openMap = (source: string) => {
    track('map_opened', { source, next_stop: next?.location.locationId ?? null });
    setSheet({ kind: 'map', source });
  };
  const openStop = (stop: Stop, source: string) => {
    track('stop_tapped', { location_id: stop.location.locationId, status: stop.status, source });
    setSheet({ kind: 'stop', id: stop.location.locationId });
  };
  const checkIn = (stop: Stop) => {
    const id = stop.location.locationId;
    if (Object.keys(state.checkedIn).length === 0) {
      track('first_check_in', { location_id: id, ms_since_landing: Date.now() - state.landedAt });
    }
    track('check_in', { location_id: id, stop_index: stop.index });
    dispatch({ type: 'CHECK_IN', locationId: id, at: Date.now() });
    setSheet({ kind: 'stop', id });
  };
  const arrive = (stop: Stop) => {
    track('arrived_at_stop', { location_id: stop.location.locationId, stop_index: stop.index });
    dispatch({ type: 'ARRIVE', locationId: stop.location.locationId, data });
  };
  const answer = (c: Challenge, a: string) => {
    track('challenge_answered', { challenge_id: c.challengeId, correct: a === c.correctAnswer, points: a === c.correctAnswer ? c.points : 0 });
    dispatch({ type: 'ANSWER', challengeId: c.challengeId, answer: a, at: Date.now(), data });
  };
  const photo = (c: Challenge) => {
    track('photo_submitted', { challenge_id: c.challengeId, points: c.points });
    dispatch({ type: 'PHOTO', challengeId: c.challengeId, at: Date.now(), data });
  };
  const openGallery = (source: string) => {
    track('gallery_opened', { source, photos: photoChallenges.length });
    setMenuOpen(false);
    setSheet({ kind: 'gallery' });
  };
  const nav = (item: NavItem | 'gallery') => {
    track('menu_item_selected', { item, via: flags.hunt_header_menu ? 'menu' : 'header_icon' });
    if (item === 'gallery') return openGallery(flags.hunt_header_menu ? 'menu' : 'header_icon');
    setMenuOpen(false);
    const copy: Record<string, [string, string]> = {
      home: ['Home', 'Leaves the hunt for the app home screen. Not part of this demo.'],
      settings: ['Hunt settings', 'Team, role and sound settings. Not part of this demo.'],
      progress: ['Hunt progress', 'The detailed hunt progress view. Not part of this demo, and what this icon does in the live app still needs confirming.'],
    };
    setSheet({ kind: 'notice', title: copy[item][0], body: copy[item][1] });
  };
  const help = () => { track('scoring_help_opened', { compact: flags.hunt_score_compact }); setSheet({ kind: 'help' }); };

  // Bottom bar primary action always names the next thing to do.
  let primary = 'See results';
  let onPrimary = () => {};
  if (next) {
    const checked = Boolean(state.checkedIn[next.location.locationId]);
    if (checked) { primary = 'Continue challenges'; onPrimary = () => openStop(next, 'bottom_bar'); }
    else if (next.here) { primary = 'Check in here'; onPrimary = () => checkIn(next); }
    else { primary = `Head to ${shortName(next.location.name)}`; onPrimary = () => openMap('bottom_bar_primary'); }
  }

  // ---------------------------------------------------------------- list
  const firstVisit = prog.locationsDone === 0 && Object.keys(state.checkedIn).length === 0;
  const justDone = celebrating?.locationId ?? null;
  const renderRow = (st: Stop) =>
    flags.hunt_next_stop_card && st.status === 'next'
      ? <NextStopCard key={st.location.locationId} stop={st} total={stops.length} onPress={() => openStop(st, 'next_card')} />
      : <StopRow key={st.location.locationId} stop={st} states={flags.hunt_row_states} justCompleted={justDone === st.location.locationId} onPress={() => openStop(st, 'row')} />;

  let list: React.ReactNode;
  if (flags.hunt_next_stop_card && firstVisit && next) {
    list = (
      <>
        <T w="extrabold" size={13} label style={s.label}>Start here</T>
        {renderRow(next)}
        <HowToScore compact={flags.hunt_score_compact} collapsed={false} onHelp={help} />
        <T w="extrabold" size={13} label style={s.label}>All stops · {stops.length}</T>
        {stops.filter((x) => x !== next).map(renderRow)}
      </>
    );
  } else {
    list = (
      <>
        <HowToScore compact={flags.hunt_score_compact} collapsed={flags.hunt_score_compact && !firstVisit} onHelp={help} />
        <T w="extrabold" size={13} label style={s.label}>Your route · {stops.length} stops</T>
        {stops.map(renderRow)}
      </>
    );
  }

  const barSpace = flags.hunt_bottom_action_bar ? 96 + Math.max(insets.bottom, 12) : insets.bottom + 24;
  const activeStop = sheet?.kind === 'stop' ? stops.find((x) => x.location.locationId === sheet.id) : undefined;

  return (
    <View style={s.root}>
      <View onLayout={(e) => setHeaderH(e.nativeEvent.layout.height)} style={{ zIndex: 22 }}>
        <Header
          teamName={info.teamName}
          teamPhoto={imageFor(info.groupPhoto)}
          rankPercentile={info.rankPercentile}
          photoCount={photoChallenges.length}
          points={points}
          locationsDone={prog.locationsDone}
          locationsTotal={prog.locationsTotal}
          percent={prog.percent}
          timeLeft={timeLeft}
          flags={flags}
          rewardPlus={celebrating ? celebrating.points : null}
          onRewardShown={() => {}}
          fillingIndex={celebrating ? celebrating.stopIndex : null}
          menuOpen={menuOpen}
          topInset={insets.top}
          onMenu={() => { if (!menuOpen) track('menu_opened', {}); setMenuOpen(!menuOpen); }}
          onGallery={openGallery}
          onNav={nav}
          onMap={() => openMap('header')}
        />
      </View>

      <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={[s.content, { paddingBottom: barSpace + 16 }]}>
        {list}
      </ScrollView>

      {flags.hunt_bottom_action_bar && !state.finishedAt && (
        <BottomBar primary={primary} onPrimary={onPrimary} onMap={() => openMap('bottom_bar')} bottomInset={insets.bottom} />
      )}

      {celebrating && flags.hunt_reward_carryover && (
        <Toast
          key={celebrating.at}
          title={`${stops[celebrating.stopIndex].location.name} complete!`}
          sub={`+${celebrating.points} pts · ${prog.locationsTotal - prog.locationsDone} stop${prog.locationsTotal - prog.locationsDone === 1 ? '' : 's'} to go`}
          bottom={barSpace + 8}
        />
      )}

      {menuOpen && flags.hunt_header_menu && (
        <Menu top={headerH - 12} photoCount={photoChallenges.length} onSelect={nav} onClose={() => setMenuOpen(false)} />
      )}

      {sheet?.kind === 'map' && (
        <MapSheet stops={stops} position={state.position} bottomInset={insets.bottom}
          onArrive={arrive} onCheckIn={checkIn} onClose={() => setSheet(null)} />
      )}
      {activeStop && (
        <StopSheet
          key={activeStop.location.locationId}
          stop={activeStop} state={state} total={stops.length} bottomInset={insets.bottom}
          onCheckIn={() => checkIn(activeStop)} onAnswer={answer} onPhoto={photo}
          onOpenChallenge={(c) => track('challenge_opened', { challenge_id: c.challengeId, type: c.type })}
          onShowMap={() => openMap('stop_sheet')} onClose={() => setSheet(null)}
        />
      )}
      {sheet?.kind === 'gallery' && <GallerySheet photos={photoChallenges} onClose={() => setSheet(null)} bottomInset={insets.bottom} />}
      {sheet?.kind === 'help' && <ScoreHelpSheet onClose={() => setSheet(null)} bottomInset={insets.bottom} />}
      {sheet?.kind === 'notice' && <NoticeSheet title={sheet.title} body={sheet.body} onClose={() => setSheet(null)} bottomInset={insets.bottom} />}

      {state.finishedAt && !sheet && (
        <FinishScreen
          points={points}
          possible={stops.reduce((a, x) => a + x.possible, 0)}
          minutes={Math.max(1, Math.round((state.finishedAt - state.landedAt) / 60000))}
          photos={photoChallenges.length}
          topInset={insets.top}
          onRate={(n) => track('satisfaction_rating', { rating: n, points })}
          onRestart={onRestart}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white1, overflow: 'hidden' },
  content: { paddingHorizontal: 16, paddingTop: 18, gap: 10 },
  label: { marginTop: 6, marginHorizontal: 2, marginBottom: -2 },
});
