// Sheet contents: map (with simulated arrival), a stop and its challenges, gallery, scoring help, finish.
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polyline, Text as SvgText } from 'react-native-svg';
import { imageFor, mascots } from '../data/images';
import type { Challenge } from '../data/types';
import { formatDistance, HuntState, LatLng, Stop, walkMinutes } from '../logic/hunt';
import { colors, radius, shadow } from '../theme/tokens';
import { Icon } from './Icon';
import { PrimaryButton, SecondaryButton, Sheet } from './Overlays';
import { PopIn } from './motion';
import { SCORE_HELP } from './Stops';
import { T } from './T';

// ------------------------------------------------------------ map

export function MapSheet({ stops, position, onArrive, onCheckIn, onClose, bottomInset }: {
  stops: Stop[]; position: LatLng; onArrive: (s: Stop) => void; onCheckIn: (s: Stop) => void; onClose: () => void; bottomInset: number;
}) {
  const next = stops.find((s) => s.status === 'next') ?? null;
  const W = 358, H = 250, pad = 28;
  const pts = [...stops.map((s) => s.location), position];
  const lats = pts.map((p) => p.lat), longs = pts.map((p) => p.long);
  const [minLat, maxLat, minLong, maxLong] = [Math.min(...lats), Math.max(...lats), Math.min(...longs), Math.max(...longs)];
  const sx = (W - pad * 2) / Math.max(maxLong - minLong, 1e-6);
  const sy = (H - pad * 2) / Math.max(maxLat - minLat, 1e-6);
  const k = Math.min(sx, sy * 0.78); // rough lon/lat aspect at Denver's latitude
  const xy = (p: LatLng) => ({ x: W / 2 + (p.long - (minLong + maxLong) / 2) * k, y: H / 2 - (p.lat - (minLat + maxLat) / 2) * (k / 0.78) });
  const route = stops.map((s) => xy(s.location)).map((p) => `${p.x},${p.y}`).join(' ');
  const me = xy(position);

  return (
    <Sheet
      title="Hunt map"
      onClose={onClose}
      bottomInset={bottomInset}
      footer={next && (next.here
        ? <PrimaryButton label={`Check in at ${next.location.name}`} onPress={() => onCheckIn(next)} />
        : <>
            <PrimaryButton label={`Arrive at ${next.location.name}`} icon="walk" onPress={() => onArrive(next)} />
            <T w="semibold" size={14} color={colors.gray3} style={{ textAlign: 'center' }}>Demo: simulates walking there (no live GPS in this build)</T>
          </>)}
    >
      <View style={s.map} accessible accessibilityLabel={`Map of ${stops.length} stops. ${next ? `Next: ${next.location.name}, ${formatDistance(next.distanceM)}` : 'All stops complete'}`}>
        <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
          {[40, 90, 140, 190, 240].map((y) => <Line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} stroke="#DDE3DF" strokeWidth={6} />)}
          {[50, 120, 190, 260, 330].map((x) => <Line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} stroke="#DDE3DF" strokeWidth={6} />)}
          <Polyline points={route} fill="none" stroke={colors.gray3} strokeWidth={3} strokeDasharray="6 6" />
          {stops.map((st) => {
            const p = xy(st.location);
            const fill = st.status === 'done' ? colors.green : st.status === 'next' ? colors.orange : '#fff';
            const r = st.status === 'next' ? 16 : 13;
            return (
              <G key={st.location.locationId}>
                <Circle cx={p.x} cy={p.y} r={r} fill={fill} stroke="#000" strokeWidth={2} />
                {st.status === 'done'
                  ? <Path d={`M${p.x - 6} ${p.y}l4 4 8-8`} stroke="#000" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  : <SvgText x={p.x} y={p.y + 5} fontSize={14} fontWeight="800" fill="#000" textAnchor="middle">{String(st.index + 1)}</SvgText>}
              </G>
            );
          })}
          <Circle cx={me.x} cy={me.y} r={9} fill={colors.navy} stroke="#fff" strokeWidth={3} />
        </Svg>
        <View style={s.mapLegend}>
          <Legend color={colors.navy} label="You" />
          <Legend color={colors.orange} label="Next" />
          <Legend color={colors.green} label="Done" />
        </View>
      </View>
      {next ? (
        <View style={s.infoCard}>
          <T w="extrabold" size={13} label>Next stop · {next.index + 1} of {stops.length}</T>
          <T w="extrabold" size={20} style={{ letterSpacing: -0.5 }}>{next.location.name}</T>
          <T size={15} color={colors.gray3}>{next.location.address}</T>
          <View style={s.inline}>
            <Icon name={next.here ? 'pin' : 'walk'} size={17} color="#000" />
            <T w="bold" size={15}>{next.here ? "You're here" : `${formatDistance(next.distanceM)} · ${walkMinutes(next.distanceM)} min walk`}</T>
          </View>
        </View>
      ) : (
        <T w="bold" size={16}>Every stop is complete.</T>
      )}
    </Sheet>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={s.inline}>
      <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: color, borderWidth: 2, borderColor: '#000' }} />
      <T w="semibold" size={14}>{label}</T>
    </View>
  );
}

// ------------------------------------------------------------ stop + challenges

export function StopSheet({ stop, state, total, onCheckIn, onAnswer, onPhoto, onOpenChallenge, onShowMap, onClose, bottomInset }: {
  stop: Stop; state: HuntState; total: number;
  onCheckIn: () => void; onAnswer: (c: Challenge, a: string) => void; onPhoto: (c: Challenge) => void;
  onOpenChallenge: (c: Challenge) => void; onShowMap: () => void; onClose: () => void; bottomInset: number;
}) {
  const [active, setActive] = useState<Challenge | null>(null);
  const checkedIn = Boolean(state.checkedIn[stop.location.locationId]);
  const complete = stop.status === 'done';

  if (active) {
    return (
      <ChallengeView
        challenge={active}
        result={state.results[active.challengeId]}
        stopComplete={complete}
        onAnswer={(a) => onAnswer(active, a)}
        onPhoto={() => onPhoto(active)}
        onBack={() => (complete ? onClose() : setActive(null))}
        onClose={onClose}
        bottomInset={bottomInset}
      />
    );
  }

  const footer = complete ? (
    <PrimaryButton label="Back to the hunt" onPress={onClose} />
  ) : !checkedIn ? (
    stop.here
      ? <PrimaryButton label={`Check in  ·  +${stop.location.points} pts`} icon="pin" onPress={onCheckIn} />
      : <SecondaryButton label={`Head here · ${formatDistance(stop.distanceM)}`} icon="map" onPress={onShowMap} />
  ) : null;

  return (
    <Sheet title={stop.location.name} onClose={onClose} footer={footer} bottomInset={bottomInset}>
      <View style={[s.inline, { flexWrap: 'wrap', gap: 8 }]}>
        <Pill icon="star">{`${stop.earned} / ${stop.possible} pts`}</Pill>
        <Pill icon="question">{`${stop.challenges.filter((c) => state.results[c.challengeId]).length} / ${stop.challenges.length} challenges`}</Pill>
        <Pill icon="flag">{`Stop ${stop.index + 1} of ${total}`}</Pill>
      </View>
      <T size={16} color={colors.gray4} style={{ lineHeight: 25 }}>{stop.location.description}</T>
      {!checkedIn && (
        <View style={s.notice}>
          <Icon name="pin" size={20} color={colors.brown} />
          <T w="semibold" size={15} color={colors.brown} style={{ flex: 1 }}>
            {stop.here ? 'Check in to unlock this stop’s challenges.' : 'Get to this stop and check in to unlock its challenges.'}
          </T>
        </View>
      )}
      {checkedIn && stop.challenges.map((c) => {
        const r = state.results[c.challengeId];
        return (
          <Pressable
            key={c.challengeId}
            onPress={() => { onOpenChallenge(c); setActive(c); }}
            accessibilityRole="button"
            accessibilityLabel={`${c.name}. ${c.question}. ${r ? (r.correct ? `Done, ${r.points} points` : 'Answered, 0 points') : `${c.points} points`}`}
            style={({ pressed }) => [s.chal, r && r.correct && { borderWidth: 1.5, borderColor: colors.green }, pressed && { backgroundColor: colors.light }]}
          >
            <View style={s.chalIcon}><Icon name={c.type === 'photo' ? 'camera' : 'question'} size={26} color="#000" /></View>
            <View style={{ flex: 1, gap: 2 }}>
              <T w="bold" size={13} color={colors.gray3} label>{c.type === 'photo' ? 'Photo' : 'Trivia'} · {c.points} pts</T>
              <T w="bold" size={17} style={{ letterSpacing: -0.3 }}>{c.name}</T>
              <T size={15} color={colors.gray4}>{c.question}</T>
            </View>
            {r ? (
              r.correct
                ? <View style={s.checkDot}><Icon name="check" size={18} color="#000" stroke={3} /></View>
                : <T w="bold" size={14} color={colors.gray3}>0 pts</T>
            ) : <Icon name="chev" size={22} color={colors.gray3} />}
          </Pressable>
        );
      })}
    </Sheet>
  );
}

function Pill({ icon, children }: { icon: 'star' | 'question' | 'flag'; children: string }) {
  return (
    <View style={s.pill}>
      <Icon name={icon} size={15} color={icon === 'star' ? colors.brown : colors.brown} />
      <T w="bold" size={14} color={colors.brown}>{children}</T>
    </View>
  );
}

function ChallengeView({ challenge: c, result, stopComplete, onAnswer, onPhoto, onBack, onClose, bottomInset }: {
  challenge: Challenge; result?: { correct: boolean; points: number }; stopComplete: boolean;
  onAnswer: (a: string) => void; onPhoto: () => void; onBack: () => void; onClose: () => void; bottomInset: number;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const answered = Boolean(result);
  const backLabel = stopComplete ? 'Stop complete! Back to the hunt' : 'Back to challenges';
  return (
    <Sheet
      title={c.name}
      onClose={onClose}
      bottomInset={bottomInset}
      footer={answered ? <PrimaryButton label={backLabel} onPress={onBack} icon={stopComplete ? 'check' : 'chev'} /> : null}
    >
      <T w="bold" size={13} color={colors.gray3} label>{c.type === 'photo' ? 'Photo challenge' : 'Trivia'} · {c.points} pts</T>
      <T w="extrabold" size={21} style={{ letterSpacing: -0.5, lineHeight: 28 }}>{c.question}</T>

      {c.type === 'multiple_choice' && (c.answers ?? []).map((a) => {
        const isPicked = picked === a;
        const isRight = answered && a === c.correctAnswer;
        const isWrongPick = answered && isPicked && !result?.correct;
        return (
          <Pressable
            key={a}
            disabled={answered}
            onPress={() => { setPicked(a); onAnswer(a); }}
            accessibilityRole="button"
            accessibilityLabel={`${a}${isRight ? ', correct answer' : isWrongPick ? ', your answer, incorrect' : ''}`}
            accessibilityState={{ disabled: answered, selected: isPicked }}
            style={({ pressed }) => [s.answer, pressed && { backgroundColor: colors.light }, isRight && { backgroundColor: colors.green }, isWrongPick && { backgroundColor: '#000' }]}
          >
            <T w="bold" size={17} color={isWrongPick ? '#fff' : '#000'} style={{ flex: 1 }}>{a}</T>
            {isRight && <Icon name="check" size={20} color="#000" stroke={3} />}
            {isWrongPick && <Icon name="x" size={20} color="#fff" stroke={3} />}
          </Pressable>
        );
      })}

      {c.type === 'photo' && (
        <View style={s.photoFrame}>
          {answered ? (
            <Image source={imageFor('team.jpg')!} style={{ width: '100%', height: '100%' }} accessibilityLabel="Your team photo" />
          ) : (
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Image source={mascots.camera} style={{ width: 110, height: 123 }} resizeMode="contain" accessibilityIgnoresInvertColors />
              <T w="semibold" size={15} color={colors.brown}>Camera preview (simulated)</T>
            </View>
          )}
        </View>
      )}
      {c.type === 'photo' && !answered && <PrimaryButton label="Take the photo" icon="camera" onPress={onPhoto} />}

      {answered && (
        <PopIn active style={[s.result, { backgroundColor: result?.correct ? colors.offOrange : colors.light }]}>
          <T w="extrabold" size={18}>{result?.correct ? `Nice! +${result.points} pts` : 'Not quite: 0 pts'}</T>
          {!result?.correct && c.correctAnswer && <T size={15} color={colors.gray4}>The answer was {c.correctAnswer}.</T>}
        </PopIn>
      )}
    </Sheet>
  );
}

// ------------------------------------------------------------ gallery / help / notice

export function GallerySheet({ photos, onClose, bottomInset }: { photos: Challenge[]; onClose: () => void; bottomInset: number }) {
  return (
    <Sheet title="Team photos" onClose={onClose} bottomInset={bottomInset}>
      {photos.length === 0 ? (
        <View style={{ alignItems: 'center', gap: 10, paddingVertical: 16 }}>
          <Image source={mascots.camera} style={{ width: 120, height: 134 }} resizeMode="contain" />
          <T w="bold" size={17}>No photos yet</T>
          <T size={15} color={colors.gray3} style={{ textAlign: 'center' }}>Photo challenges at each stop land here. They’re the best part to share after the hunt.</T>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {photos.map((p) => (
            <View key={p.challengeId} style={{ width: '48%', gap: 4 }}>
              <Image source={imageFor('team.jpg')!} style={{ width: '100%', aspectRatio: 1, borderRadius: radius.card }} accessibilityLabel={p.name} />
              <T w="bold" size={14}>{p.name}</T>
            </View>
          ))}
        </View>
      )}
    </Sheet>
  );
}

export function ScoreHelpSheet({ onClose, bottomInset }: { onClose: () => void; bottomInset: number }) {
  return (
    <Sheet title="How to score" onClose={onClose} bottomInset={bottomInset}>
      {SCORE_HELP.map((it) => (
        <View key={it.icon} style={[s.inline, { gap: 14, paddingVertical: 6 }]}>
          <View style={s.chalIcon}><Icon name={it.icon} size={24} color="#000" /></View>
          <View style={{ flex: 1 }}>
            <T w="bold" size={17}>{it.short}</T>
            <T size={15} color={colors.gray4}>{it.long}</T>
          </View>
        </View>
      ))}
    </Sheet>
  );
}

export function NoticeSheet({ title, body, onClose, bottomInset }: { title: string; body: string; onClose: () => void; bottomInset: number }) {
  return (
    <Sheet title={title} onClose={onClose} bottomInset={bottomInset}>
      <T size={16} color={colors.gray4}>{body}</T>
    </Sheet>
  );
}

// ------------------------------------------------------------ finish

export function FinishScreen({ points, possible, minutes, photos, onRate, onRestart, topInset }: {
  points: number; possible: number; minutes: number; photos: number; onRate: (n: number) => void; onRestart: () => void; topInset: number;
}) {
  const [rating, setRating] = useState(0);
  return (
    <View style={[StyleSheet.absoluteFill, s.finish, { paddingTop: topInset + 24 }]}>
      <Image source={mascots.celebrating} style={{ width: 150, height: 170 }} resizeMode="contain" accessibilityIgnoresInvertColors />
      <T w="extrabold" size={34} color="#fff" style={{ letterSpacing: -1.5, lineHeight: 38 }} accessibilityRole="header">Hunt complete!</T>
      <View style={s.finishStats}>
        <Stat value={points.toLocaleString()} label={`of ${possible.toLocaleString()} pts`} />
        <Stat value={`${minutes}`} label="minutes" />
        <Stat value={`${photos}`} label="photos" />
      </View>
      <T w="bold" size={17} color="#fff" style={{ marginTop: 8 }}>How much fun was this hunt?</T>
      <View style={[s.inline, { gap: 4 }]} accessibilityRole="radiogroup" accessibilityLabel="Rate the hunt">
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            onPress={() => { setRating(n); onRate(n); }}
            accessibilityRole="radio"
            accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}
            accessibilityState={{ checked: rating === n }}
            style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="star" size={38} color={n <= rating ? colors.starYellow : colors.gray3} />
          </Pressable>
        ))}
      </View>
      <T w="semibold" size={15} color={colors.gray1} style={{ minHeight: 21 }}>{rating ? 'Thanks! That helps us make hunts better.' : ' '}</T>
      <PrimaryButton label="Play again" icon="arrow" onPress={onRestart} style={{ alignSelf: 'stretch', marginTop: 8 }} />
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <T w="extrabold" size={26} color={colors.orange}>{value}</T>
      <T w="semibold" size={14} color={colors.gray1}>{label}</T>
    </View>
  );
}

const s = StyleSheet.create({
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  map: { borderRadius: radius.cardLg, overflow: 'hidden', backgroundColor: '#EEF2EF', borderWidth: 1, borderColor: colors.gray1 },
  mapLegend: { flexDirection: 'row', gap: 16, padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.gray1 },
  infoCard: { gap: 4, padding: 14, borderRadius: radius.card, backgroundColor: colors.offOrange },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: radius.card, backgroundColor: colors.cream },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.offOrange, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50 },
  chal: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: radius.card, backgroundColor: '#fff', ...shadow.card },
  chalIcon: { width: 52, height: 52, borderRadius: 12, backgroundColor: colors.offOrange, alignItems: 'center', justifyContent: 'center' },
  checkDot: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  answer: { flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingHorizontal: 18, borderRadius: 14, borderWidth: 2, borderColor: '#000', backgroundColor: '#fff' },
  photoFrame: { height: 240, borderRadius: radius.cardLg, overflow: 'hidden', backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  result: { padding: 14, borderRadius: radius.card, gap: 4 },
  finish: { backgroundColor: '#000', alignItems: 'center', paddingHorizontal: 24, gap: 10, zIndex: 60 },
  finishStats: { flexDirection: 'row', alignSelf: 'stretch', backgroundColor: colors.gray4, borderRadius: radius.cardLg, paddingVertical: 14, marginTop: 6 },
});
