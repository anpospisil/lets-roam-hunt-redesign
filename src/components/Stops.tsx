// Stop list pieces: the expanded next-stop card, compact rows, and "How to score".
// Flags: hunt_next_stop_card, hunt_row_states, hunt_score_compact.
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { imageFor } from '../data/images';
import { formatDistance, Stop, walkMinutes } from '../logic/hunt';
import { colors, radius, shadow, TOUCH } from '../theme/tokens';
import { Icon, IconName } from './Icon';
import { PopIn, PulseHalo } from './motion';
import { T } from './T';

// ------------------------------------------------------------ next stop card

export function NextStopCard({ stop, total, onPress }: { stop: Stop; total: number; onPress: () => void }) {
  const photo = imageFor(stop.location.photoLarge);
  const where = stop.here ? "You're here" : `${formatDistance(stop.distanceM)} · ${walkMinutes(stop.distanceM)} min walk`;
  return (
    <PulseHalo radius={radius.cardLg}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Next stop, ${stop.index + 1} of ${total}: ${stop.location.name}. ${where}. ${stop.challenges.length} challenges, ${stop.possible} points.`}
        accessibilityHint="Opens the stop and its challenges"
        style={({ pressed }) => [s.card, pressed && { opacity: 0.92 }]}
      >
        <View style={s.cardStrip}>
          <T w="extrabold" size={13} label>Next stop · {stop.index + 1} of {total}</T>
          <T w="extrabold" size={14}>{stop.possible} pts</T>
        </View>
        {photo ? (
          <Image source={photo} style={s.photo} accessibilityIgnoresInvertColors />
        ) : (
          <View style={s.photoPh}>
            <Icon name="image" size={26} color={colors.brown} />
            <T w="semibold" size={14} color={colors.brown}>[Location photo]</T>
          </View>
        )}
        <View style={s.cardBody}>
          <T w="extrabold" size={23} style={{ letterSpacing: -0.7, lineHeight: 27 }}>{stop.location.name}</T>
          <View style={s.inline}>
            <Icon name={stop.here ? 'pin' : 'walk'} size={17} color="#000" />
            <T w="bold" size={15}>{where}</T>
          </View>
          <T size={16} color={colors.gray4} style={{ lineHeight: 25 }} numberOfLines={4}>{stop.location.description}</T>
          <View style={[s.inline, { flexWrap: 'wrap', gap: 8, marginTop: 2 }]}>
            <Chip>{`${stop.challenges.length} challenges`}</Chip>
            <Chip>{stop.tasksDone > 0 ? `${stop.earned} / ${stop.possible} pts so far` : `Check-in +${stop.location.points}`}</Chip>
          </View>
        </View>
      </Pressable>
    </PulseHalo>
  );
}

function Chip({ children }: { children: string }) {
  return (
    <View style={s.chip}><T w="bold" size={14} color={colors.brown}>{children}</T></View>
  );
}

// ------------------------------------------------------------ compact rows

export function StopRow({ stop, states, justCompleted, onPress }: { stop: Stop; states: boolean; justCompleted: boolean; onPress: () => void }) {
  const done = stop.status === 'done';
  const next = stop.status === 'next';
  const loc = stop.location;

  if (!states) {
    // Fallback (control): every row carries equal weight, with an x/y counter like the original.
    return (
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${loc.name}, ${stop.tasksDone} of ${stop.tasksTotal} tasks`} style={({ pressed }) => [s.row, pressed && s.pressed]}>
        <View style={[s.num, { backgroundColor: colors.light }]}><T w="extrabold" size={17}>{stop.index + 1}</T></View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <T w="bold" size={17} style={{ letterSpacing: -0.3 }}>{loc.name}</T>
          <T size={15} color={colors.gray3}>{formatDistance(stop.distanceM)} · Complete {stop.challenges.length} challenges here</T>
        </View>
        <T w="bold" size={16}>{stop.tasksDone}/{stop.tasksTotal}</T>
      </Pressable>
    );
  }

  const meta = done
    ? `${stop.earned} / ${stop.possible} pts earned`
    : `${formatDistance(stop.distanceM)} · ${stop.challenges.length} challenges · ${stop.possible} pts`;
  const stateLabel = done ? 'Done' : next ? 'Next stop' : 'Upcoming';

  const circle = done ? (
    <PopIn active={justCompleted} style={[s.num, { backgroundColor: colors.green }]}>
      <Icon name="check" size={20} color="#000" stroke={3} />
    </PopIn>
  ) : next ? (
    <PulseHalo radius={19}><View style={[s.num, { backgroundColor: colors.orange }]}><T w="extrabold" size={17}>{stop.index + 1}</T></View></PulseHalo>
  ) : (
    <View style={[s.num, { backgroundColor: colors.light }]}><T w="extrabold" size={17}>{stop.index + 1}</T></View>
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Stop ${stop.index + 1}, ${loc.name}. ${stateLabel}. ${meta}`}
      style={({ pressed }) => [s.row, done && s.rowDone, pressed && s.pressed]}
    >
      {circle}
      <View style={{ flex: 1, minWidth: 0 }}>
        <T w="bold" size={17} style={{ letterSpacing: -0.3 }}>{loc.name}</T>
        <T size={15} color={colors.gray3}>{meta}</T>
      </View>
      {done ? (
        <View style={s.doneBadge}><T w="extrabold" size={13}>Done</T></View>
      ) : next ? (
        <View style={[s.doneBadge, { backgroundColor: colors.orange }]}><T w="extrabold" size={13}>Next</T></View>
      ) : (
        <Icon name="chev" size={22} color={colors.gray3} />
      )}
    </Pressable>
  );
}

// ------------------------------------------------------------ how to score

const SCORE_ITEMS: { icon: IconName; short: string; long: string }[] = [
  { icon: 'question', short: 'Challenges', long: 'Complete more challenges' },
  { icon: 'camera', short: 'Fun photos', long: 'Fun, accurate photos' },
  { icon: 'pin', short: 'Check-ins', long: 'Accurate check-ins' },
  { icon: 'bolt', short: 'Speed', long: 'Finish locations quickly' },
];

export function HowToScore({ compact, collapsed, onHelp }: { compact: boolean; collapsed: boolean; onHelp: () => void }) {
  if (!compact) {
    // Fallback (control): the original always-open, four-line grid (kept at AAA contrast).
    return (
      <View style={{ paddingHorizontal: 2, paddingVertical: 4 }}>
        <T w="bold" size={17} style={{ marginBottom: 8 }}>Complete Challenges Below & Earn Points By</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 }}>
          {SCORE_ITEMS.map((it) => (
            <View key={it.icon} style={[s.inline, { width: '50%', paddingRight: 8 }]}>
              <Icon name={it.icon} size={20} color="#000" />
              <T size={14} style={{ flex: 1 }}>{it.long}</T>
            </View>
          ))}
        </View>
      </View>
    );
  }
  if (collapsed) {
    return (
      <Pressable onPress={onHelp} accessibilityRole="button" accessibilityLabel="How to score" style={({ pressed }) => [s.scoreRow, pressed && s.pressed]}>
        <View style={{ flexDirection: 'row', paddingLeft: 6 }}>
          {SCORE_ITEMS.map((it) => (
            <View key={it.icon} style={s.miniIcon}><Icon name={it.icon} size={16} color="#000" /></View>
          ))}
        </View>
        <T w="bold" size={16} style={{ flex: 1 }}>How to score</T>
        <Icon name="chev" size={22} color={colors.gray3} />
      </Pressable>
    );
  }
  return (
    <View style={s.scoreCard}>
      <View style={[s.inline, { justifyContent: 'space-between', marginBottom: 10 }]}>
        <T w="extrabold" size={17} style={{ letterSpacing: -0.3 }}>How to score</T>
        <Pressable onPress={onHelp} accessibilityRole="button" accessibilityLabel="How scoring works" hitSlop={8} style={s.infoBtn}>
          <Icon name="info" size={22} color="#000" />
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row' }}>
        {SCORE_ITEMS.map((it) => (
          <View key={it.icon} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
            <View style={s.scoreIcon}><Icon name={it.icon} size={22} color="#000" /></View>
            <T w="bold" size={14} style={{ textAlign: 'center' }}>{it.short}</T>
          </View>
        ))}
      </View>
    </View>
  );
}

export const SCORE_HELP = SCORE_ITEMS;

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: radius.cardLg, overflow: 'hidden', borderWidth: 2, borderColor: '#000', ...shadow.card },
  cardStrip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 9, backgroundColor: colors.orange },
  photo: { width: '100%', height: 150 },
  photoPh: { height: 110, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center', gap: 6 },
  cardBody: { padding: 16, paddingTop: 14, gap: 8 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chip: { backgroundColor: colors.offOrange, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 72, paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fff', borderRadius: radius.card, ...shadow.card,
  },
  rowDone: { borderWidth: 1.5, borderColor: colors.green },
  pressed: { backgroundColor: colors.light },
  num: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  doneBadge: { backgroundColor: colors.green, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50 },
  scoreCard: { backgroundColor: '#fff', borderRadius: radius.card, padding: 16, paddingTop: 12, ...shadow.card },
  infoBtn: { width: TOUCH, height: TOUCH, marginRight: -10, alignItems: 'center', justifyContent: 'center' },
  scoreIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.offOrange, alignItems: 'center', justifyContent: 'center' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingHorizontal: 16, backgroundColor: '#fff', borderRadius: radius.card, ...shadow.card },
  miniIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.offOrange, alignItems: 'center', justifyContent: 'center', marginLeft: -6, borderWidth: 2, borderColor: '#fff' },
});
