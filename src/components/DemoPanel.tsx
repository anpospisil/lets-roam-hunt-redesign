// Reviewer-only panel: jump between hunt states, flip the A/B flags live, and watch analytics events.
// Not part of the product UI.
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { resetAnalytics, subscribe, TrackedEvent } from '../logic/analytics';
import { assignVariant, FlagKey, FlagMode, Flags, FLAGS } from '../logic/flags';
import { colors, radius } from '../theme/tokens';
import { Icon } from './Icon';
import { T } from './T';

export type Scenario = 'landing' | 'reward' | 'mid' | 'last';

interface Props {
  teamId: string;
  mode: FlagMode;
  flags: Flags;
  reduceMotion: boolean;
  onScenario: (s: Scenario) => void;
  onMode: (m: FlagMode) => void;
  onToggle: (k: FlagKey, v: boolean) => void;
  onNewTeam: () => void;
  onReduceMotion: (v: boolean) => void;
  onClose?: () => void;
}

// react-native-web's Switch tints the thumb teal unless activeThumbColor is set.
const webSwitch = (Platform.OS === 'web' ? { activeThumbColor: '#fff' } : {}) as object;

const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, monospace' });

export function DemoPanel(p: Props) {
  const [events, setEvents] = useState<TrackedEvent[]>([]);
  useEffect(() => subscribe(setEvents), []);
  const first = events.length ? events[events.length - 1].at : 0;

  return (
    <ScrollView style={s.panel} contentContainerStyle={{ padding: 20, gap: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <T w="extrabold" size={22} style={{ letterSpacing: -0.6 }}>Demo controls</T>
          <T size={14} color={colors.gray3}>For reviewers: not part of the product UI.</T>
        </View>
        {p.onClose && (
          <Pressable onPress={p.onClose} accessibilityRole="button" accessibilityLabel="Close demo controls" style={s.close}>
            <Icon name="x" size={22} color="#000" />
          </Pressable>
        )}
      </View>

      <Section title="Jump to a moment">
        <View style={s.grid}>
          <Btn label="Landing (0 of 6)" onPress={() => p.onScenario('landing')} />
          <Btn label="Stop complete reward" onPress={() => p.onScenario('reward')} />
          <Btn label="Mid-hunt (2 of 6)" onPress={() => p.onScenario('mid')} />
          <Btn label="Last stop (5 of 6)" onPress={() => p.onScenario('last')} />
        </View>
      </Section>

      <Section title="A/B feature flags">
        <View style={s.seg} accessibilityRole="radiogroup">
          {([['redesign', 'Full redesign'], ['assigned', 'By team'], ['control', 'All control']] as [FlagMode, string][]).map(([m, l]) => (
            <Pressable key={m} onPress={() => p.onMode(m)} accessibilityRole="radio" accessibilityState={{ checked: p.mode === m }}
              style={[s.segBtn, p.mode === m && { backgroundColor: '#000' }]}>
              <T w="bold" size={14} color={p.mode === m ? '#fff' : '#000'}>{l}</T>
            </Pressable>
          ))}
        </View>
        {p.mode === 'assigned' && (
          <View style={s.team}>
            <T size={14} style={{ flex: 1 }}>Team <T w="bold" size={14} style={{ fontFamily: mono }}>{p.teamId}</T> is bucketed 50/50 per flag (sticky per team).</T>
            <Btn label="New team" onPress={p.onNewTeam} small />
          </View>
        )}
        {FLAGS.map((f) => {
          const on = p.flags[f.key];
          return (
            <View key={f.key} style={s.flag}>
              <View style={{ flex: 1, gap: 2 }}>
                <T w="bold" size={15}>#{f.point} {f.title} <T size={13} color={colors.gray3}>· {f.goal}</T></T>
                <T size={12} color={colors.gray3} style={{ fontFamily: mono }}>{f.key} · team bucket: {assignVariant(p.teamId, f.key)}</T>
                <T size={13} color={colors.gray4}>{on ? `Metric: ${f.metric}` : `Off: ${f.offBehaviour}`}</T>
              </View>
              <Switch
                value={on}
                onValueChange={(v) => p.onToggle(f.key, v)}
                accessibilityLabel={`${f.title} ${on ? 'on' : 'off'}`}
                trackColor={{ true: colors.orange, false: colors.gray1 }}
                thumbColor="#fff"
                {...webSwitch}
              />
            </View>
          );
        })}
        <T size={13} color={colors.gray3}>#6 Readability (AAA contrast, type scale, 44pt targets) is the baseline for everyone, not a test.</T>
      </Section>

      <Section title="Accessibility preview">
        <View style={s.flag}>
          <T w="bold" size={15} style={{ flex: 1 }}>Reduce motion</T>
          <Switch value={p.reduceMotion} onValueChange={p.onReduceMotion} accessibilityLabel="Reduce motion"
            trackColor={{ true: colors.orange, false: colors.gray1 }} thumbColor="#fff" {...webSwitch} />
        </View>
      </Section>

      <Section title={`Analytics events (${events.length})`} action={<Btn label="Clear" small onPress={resetAnalytics} />}>
        {events.length === 0 && <T size={14} color={colors.gray3}>Interact with the hunt to see events.</T>}
        {events.slice(0, 40).map((e) => (
          <View key={e.id} style={s.event}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T w="bold" size={13} style={{ fontFamily: mono }}>{e.name}</T>
              <T size={12} color={colors.gray3} style={{ fontFamily: mono }}>+{((e.at - first) / 1000).toFixed(1)}s</T>
            </View>
            {Object.keys(e.props).length > 0 && (
              <T size={12} color={colors.gray4} style={{ fontFamily: mono }}>
                {Object.entries(e.props).map(([k, v]) => `${k}=${v}`).join('  ')}
              </T>
            )}
          </View>
        ))}
      </Section>
    </ScrollView>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <T w="extrabold" size={13} label>{title}</T>
        {action}
      </View>
      {children}
    </View>
  );
}

function Btn({ label, onPress, small }: { label: string; onPress: () => void; small?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => [s.btn, small && { minHeight: 36, paddingHorizontal: 12 }, pressed && { backgroundColor: colors.light }]}>
      <T w="bold" size={small ? 13 : 14}>{label}</T>
    </Pressable>
  );
}

const s = StyleSheet.create({
  panel: { flex: 1, backgroundColor: '#fff' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btn: { minHeight: 44, paddingHorizontal: 14, justifyContent: 'center', borderRadius: radius.pill, borderWidth: 2, borderColor: '#000', backgroundColor: '#fff' },
  seg: { flexDirection: 'row', borderRadius: radius.pill, borderWidth: 2, borderColor: '#000', overflow: 'hidden' },
  segBtn: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  team: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.card, backgroundColor: colors.offOrange },
  flag: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.light },
  event: { paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.light, gap: 2 },
});
