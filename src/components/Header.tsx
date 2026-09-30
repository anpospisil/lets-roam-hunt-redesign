// Hunt header: orientation only (team, rank, points, progress, timer).
// Flags: hunt_location_progress (segments vs % bar), hunt_header_menu (menu vs inline nav icons),
// hunt_reward_carryover (+pts float), hunt_bottom_action_bar (when off, Map lives here).
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import type { Flags } from '../logic/flags';
import { colors, TOUCH } from '../theme/tokens';
import { Icon, IconName } from './Icon';
import { FillBar, FloatUp } from './motion';
import { T } from './T';

export type NavItem = 'home' | 'gallery' | 'settings' | 'progress';

interface Props {
  teamName: string;
  teamPhoto: any;
  rankPercentile: number;
  photoCount: number;
  points: number;
  locationsDone: number;
  locationsTotal: number;
  percent: number;
  timeLeft: string;
  flags: Flags;
  rewardPlus: number | null;
  onRewardShown: () => void;
  /** Index of the segment that just completed (fills with animation). */
  fillingIndex: number | null;
  menuOpen: boolean;
  topInset: number;
  onMenu: () => void;
  onGallery: (source: 'avatar' | 'header_icon') => void;
  onNav: (item: NavItem) => void;
  onMap: () => void;
}

export function Header(p: Props) {
  const { flags } = p;
  return (
    <View style={[s.wrap, { paddingTop: p.topInset + 12 }]} accessibilityRole="header">
      <View style={s.row}>
        <Pressable
          onPress={() => p.onGallery('avatar')}
          accessibilityRole="button"
          accessibilityLabel={`Team photos, ${p.photoCount} so far`}
          style={s.avatarBtn}
        >
          <Image source={p.teamPhoto} style={s.avatar} />
          <View style={s.photoBadge}>
            <Icon name="camera" size={11} color="#000" stroke={2.6} />
            <T w="extrabold" size={12}>{p.photoCount}</T>
          </View>
        </Pressable>

        <View style={{ flex: 1, minWidth: 0 }}>
          <T w="bold" size={17} color="#fff" numberOfLines={1} style={{ letterSpacing: -0.3 }}>{p.teamName}</T>
          <View style={s.subRow}>
            <View style={s.rank}>
              <Icon name="trophy" size={15} color={colors.starYellow} />
              <T w="semibold" size={14} color={colors.gray1}>Rank: Top {p.rankPercentile}%</T>
            </View>
            <View style={s.points} accessible accessibilityLabel={`${p.points} points`}>
              {flags.hunt_reward_carryover && p.rewardPlus != null && (
                <FloatUp key={p.points} style={s.plus} onDone={p.onRewardShown}>
                  <T w="extrabold" size={14}>+{p.rewardPlus}</T>
                </FloatUp>
              )}
              <Icon name="star" size={15} color={colors.starYellow} />
              <T w="extrabold" size={15} color="#fff" style={{ fontVariant: ['tabular-nums'] }}>{p.points.toLocaleString()}</T>
              <T w="semibold" size={14} color={colors.gray1}>pts</T>
            </View>
          </View>
        </View>

        {flags.hunt_header_menu ? (
          <HeaderBtn icon={p.menuOpen ? 'x' : 'menu'} label={p.menuOpen ? 'Close menu' : 'Open menu'} onPress={p.onMenu} />
        ) : null}
      </View>

      {!flags.hunt_header_menu && (
        // Fallback (control): the original header's inline navigation icons.
        <View style={[s.row, { marginTop: 12, gap: 8 }]}>
          <HeaderBtn icon="home" label="Home" onPress={() => p.onNav('home')} />
          <HeaderBtn icon="image" label="Team photos" onPress={() => p.onGallery('header_icon')} />
          <HeaderBtn icon="gear" label="Hunt settings" onPress={() => p.onNav('settings')} />
          <HeaderBtn icon="flag" label="Hunt progress" onPress={() => p.onNav('progress')} />
          <View style={{ flex: 1 }} />
          {!flags.hunt_bottom_action_bar && <HeaderBtn icon="map" label="Map" onPress={p.onMap} />}
        </View>
      )}
      {flags.hunt_header_menu && !flags.hunt_bottom_action_bar && (
        <View style={[s.row, { marginTop: 12, justifyContent: 'flex-end' }]}>
          <HeaderBtn icon="map" label="Map" onPress={p.onMap} />
        </View>
      )}

      {flags.hunt_location_progress ? (
        <>
          <View style={s.progressText}>
            <T w="bold" size={15} color="#fff">
              {p.locationsDone} of {p.locationsTotal} locations <T w="semibold" size={15} color={colors.gray1}>complete</T>
            </T>
            <Timer timeLeft={p.timeLeft} />
          </View>
          <View
            style={s.segments}
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel="Hunt progress"
            accessibilityValue={{ min: 0, max: p.locationsTotal, now: p.locationsDone, text: `${p.locationsDone} of ${p.locationsTotal} locations complete` }}
          >
            {Array.from({ length: p.locationsTotal }).map((_, i) => {
              const done = i < p.locationsDone;
              const next = i === p.locationsDone;
              return (
                <View key={i} style={[s.seg, next && { borderWidth: 2, borderColor: colors.orange }]}>
                  {done && (
                    <FillBar
                      animate={flags.hunt_reward_carryover && p.fillingIndex === i}
                      color={colors.orange}
                      height={10}
                      radius={5}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </>
      ) : (
        // Fallback (control): an unlabelled percentage, like the original ring.
        <>
          <View style={s.progressText}>
            <T w="bold" size={15} color="#fff">{p.percent}% Complete</T>
            <Timer timeLeft={p.timeLeft} />
          </View>
          <View
            style={[s.seg, { flex: 0, marginTop: 10 }]}
            accessible
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: p.percent }}
          >
            <View style={{ width: `${p.percent}%`, height: 10, borderRadius: 5, backgroundColor: colors.orange }} />
          </View>
        </>
      )}
    </View>
  );
}

function Timer({ timeLeft }: { timeLeft: string }) {
  return (
    <View style={s.timer} accessible accessibilityLabel={`${timeLeft} left`}>
      <Icon name="timer" size={16} color="#fff" />
      <T w="bold" size={15} color="#fff" style={{ fontVariant: ['tabular-nums'] }}>{timeLeft}</T>
      <T w="semibold" size={15} color={colors.gray1}>left</T>
    </View>
  );
}

function HeaderBtn({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [s.hbtn, pressed && { backgroundColor: '#444' }]}>
      <Icon name={icon} size={22} color="#fff" />
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { backgroundColor: colors.black, paddingHorizontal: 16, paddingBottom: 16, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, zIndex: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarBtn: { width: 50, height: 50 },
  avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: colors.orange },
  photoBadge: {
    position: 'absolute', right: -5, bottom: -4, height: 22, minWidth: 22, paddingHorizontal: 5, borderRadius: 11,
    backgroundColor: colors.starYellow, borderWidth: 2, borderColor: '#000', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2,
  },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  rank: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  points: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 30, paddingHorizontal: 11, borderRadius: 50, backgroundColor: colors.gray4 },
  plus: { position: 'absolute', right: -4, top: -30, backgroundColor: colors.starYellow, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 50 },
  hbtn: { width: TOUCH, height: TOUCH, borderRadius: TOUCH / 2, backgroundColor: colors.gray4, alignItems: 'center', justifyContent: 'center' },
  progressText: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  segments: { flexDirection: 'row', gap: 5, marginTop: 10 },
  seg: { flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.gray3, overflow: 'hidden' },
});
