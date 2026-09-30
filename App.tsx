// App shell: loads fonts, owns hunt state + flags, and lays out the demo.
// Wide web screens: phone frame + demo panel side by side. Phones: full-screen app + "Demo" strip.
// Import only the four weights used, so the web build doesn't ship all 14 font files.
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { DemoPanel, Scenario } from './src/components/DemoPanel';
import { Icon } from './src/components/Icon';
import { T } from './src/components/T';
import huntData from './src/data/huntData';
import { ReducedMotionContext, useSystemReducedMotion } from './src/hooks/useMotion';
import { trackExposure } from './src/logic/analytics';
import { FlagKey, FlagMode, Flags, FLAGS, resolveFlags } from './src/logic/flags';
import { huntReducer, initialState, presetState } from './src/logic/hunt';
import { HuntScreen } from './src/screens/HuntScreen';
import { colors } from './src/theme/tokens';

export default function App() {
  const [loaded] = useFonts({ PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold });
  if (!loaded) {
    return <View style={[s.center, { flex: 1 }]}><ActivityIndicator color={colors.orange} /></View>;
  }
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Demo />
    </SafeAreaProvider>
  );
}

function Demo() {
  const data = huntData;
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const wide = Platform.OS === 'web' && width >= 980;

  const [state, dispatch] = useReducer(huntReducer, undefined, () => initialState(data, Date.now()));
  const [session, setSession] = useState(0);
  const [teamId, setTeamId] = useState(data.group.info.groupId);
  const [mode, setMode] = useState<FlagMode>('redesign');
  const [overrides, setOverrides] = useState<Partial<Flags>>({});
  const systemReduced = useSystemReducedMotion();
  const [forceReduced, setForceReduced] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const flags = useMemo(() => resolveFlags(teamId, mode, overrides), [teamId, mode, overrides]);
  useEffect(() => {
    FLAGS.forEach((f) => trackExposure(f.key, flags[f.key] ? 'treatment' : 'control', teamId));
  }, [flags, teamId]);

  const scenario = (sc: Scenario) => {
    const now = Date.now();
    let next = initialState(data, now);
    if (sc === 'mid') next = presetState(data, now, 2);
    if (sc === 'last') {
      next = presetState(data, now, 5);
      next = huntReducer(next, { type: 'ARRIVE', locationId: data.game_v2.locationList[5], data });
    }
    if (sc === 'reward') {
      next = presetState(data, now, 1);
      const id = data.game_v2.locationList[0];
      next = { ...next, lastReward: { locationId: id, stopIndex: 0, points: data.game_v2.locations[id].totalLocationPoints, at: now } };
    }
    dispatch({ type: 'LOAD', state: next });
    setSession((n) => n + 1);
    setPanelOpen(false);
  };

  const panel = (
    <DemoPanel
      teamId={teamId}
      mode={mode}
      flags={flags}
      reduceMotion={forceReduced || systemReduced}
      onScenario={scenario}
      onMode={(m) => { setMode(m); setOverrides({}); }}
      onToggle={(k: FlagKey, v) => setOverrides((o) => ({ ...o, [k]: v }))}
      onNewTeam={() => setTeamId(`team-${Math.random().toString(36).slice(2, 8)}`)}
      onReduceMotion={setForceReduced}
      onClose={wide ? undefined : () => setPanelOpen(false)}
    />
  );

  const screen = (topInset: number, bottomInset: number) => (
    <HuntScreen
      key={session}
      data={data}
      state={state}
      dispatch={dispatch}
      flags={flags}
      insets={{ top: topInset, bottom: bottomInset }}
      onRestart={() => scenario('landing')}
    />
  );

  return (
    <ReducedMotionContext.Provider value={forceReduced || systemReduced}>
      {wide ? (
        <View style={s.stage}>
          <View style={[s.phone, { height: Math.min(860, height - 48) }]}>{screen(0, 0)}</View>
          <View style={[s.side, { height: Math.min(860, height - 48) }]}>{panel}</View>
        </View>
      ) : (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <View style={{ paddingTop: insets.top, backgroundColor: '#000' }}>
            <Pressable onPress={() => setPanelOpen(true)} accessibilityRole="button" accessibilityLabel="Open demo controls" style={s.strip}>
              <Icon name="gear" size={16} color="#fff" />
              <T w="bold" size={13} color="#fff">Demo controls · flags & events</T>
            </Pressable>
          </View>
          <View style={{ flex: 1 }}>{screen(0, insets.bottom)}</View>
          {panelOpen && <View style={[StyleSheet.absoluteFill, { paddingTop: insets.top, backgroundColor: '#fff', zIndex: 100 }]}>{panel}</View>}
        </View>
      )}
    </ReducedMotionContext.Provider>
  );
}

const s = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  stage: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32, backgroundColor: '#E9E9E6', padding: 24 },
  phone: { width: 406, borderRadius: 36, overflow: 'hidden', borderWidth: 8, borderColor: '#000', backgroundColor: '#000' },
  side: { width: 460, borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 1, borderColor: colors.gray1 },
  strip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 36, backgroundColor: colors.gray4 },
});
