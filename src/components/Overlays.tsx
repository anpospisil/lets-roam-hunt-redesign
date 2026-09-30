// Bottom bar, sheets, toast and menu. Sheets render inside the app frame (not a native Modal)
// so the web demo stays inside its phone frame.
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { colors, radius, TOUCH } from '../theme/tokens';
import { Icon, IconName } from './Icon';
import { RiseIn } from './motion';
import { T } from './T';

// ------------------------------------------------------------ buttons

export function PrimaryButton({ label, onPress, icon = 'arrow', style, disabled }: { label: string; onPress: () => void; icon?: IconName | null; style?: any; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [s.primary, pressed && { backgroundColor: '#FF8A32' }, disabled && { opacity: 0.5 }, style]}
    >
      <T w="extrabold" size={17} style={{ letterSpacing: -0.2 }} numberOfLines={1}>{label}</T>
      {icon && <Icon name={icon} size={18} color="#000" stroke={2.4} />}
    </Pressable>
  );
}

export function SecondaryButton({ label, icon, onPress, style }: { label: string; icon?: IconName; onPress: () => void; style?: any }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [s.secondary, pressed && { backgroundColor: colors.light }, style]}>
      {icon && <Icon name={icon} size={20} color="#000" />}
      <T w="bold" size={17}>{label}</T>
    </Pressable>
  );
}

// ------------------------------------------------------------ bottom action bar (flag: hunt_bottom_action_bar)

export function BottomBar({ primary, onPrimary, onMap, bottomInset }: { primary: string; onPrimary: () => void; onMap: () => void; bottomInset: number }) {
  return (
    <View style={[s.bar, { paddingBottom: Math.max(bottomInset, 12) + 12 }]} accessibilityRole="toolbar" accessibilityLabel="Hunt actions">
      <SecondaryButton label="Map" icon="map" onPress={onMap} />
      <PrimaryButton label={primary} onPress={onPrimary} style={{ flex: 1 }} />
    </View>
  );
}

// ------------------------------------------------------------ sheet

export function Sheet({ title, onClose, children, footer, bottomInset = 0 }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; bottomInset?: number }) {
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 50 }]} accessibilityViewIsModal>
      <Pressable style={s.backdrop} onPress={onClose} accessibilityLabel="Close" accessibilityRole="button" />
      <RiseIn style={s.sheet}>
        <View style={s.sheetHead}>
          <T w="extrabold" size={20} style={{ flex: 1, letterSpacing: -0.5 }} accessibilityRole="header">{title}</T>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" style={s.close}>
            <Icon name="x" size={22} color="#000" />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 10 }}>{children}</ScrollView>
        {footer && <View style={[s.sheetFoot, { paddingBottom: Math.max(bottomInset, 12) + 12 }]}>{footer}</View>}
      </RiseIn>
    </View>
  );
}

// ------------------------------------------------------------ toast (flag: hunt_reward_carryover)

export function Toast({ title, sub, bottom }: { title: string; sub: string; bottom: number }) {
  return (
    <RiseIn style={[s.toast, { bottom }]}>
      <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={s.toastCheck}><Icon name="check" size={22} color="#000" stroke={3} /></View>
        <View style={{ flex: 1 }}>
          <T w="extrabold" size={16} color="#fff">{title}</T>
          <T w="semibold" size={15} color={colors.gray1}>{sub}</T>
        </View>
      </View>
    </RiseIn>
  );
}

// ------------------------------------------------------------ menu (flag: hunt_header_menu)

export function Menu({ top, photoCount, onSelect, onClose }: { top: number; photoCount: number; onSelect: (item: 'gallery' | 'home' | 'settings' | 'progress') => void; onClose: () => void }) {
  const items: { key: 'gallery' | 'home' | 'settings' | 'progress'; icon: IconName; label: string; sub?: string }[] = [
    { key: 'gallery', icon: 'image', label: 'Team photos', sub: `${photoCount} photo${photoCount === 1 ? '' : 's'} so far` },
    { key: 'home', icon: 'home', label: 'Home' },
    { key: 'settings', icon: 'gear', label: 'Hunt settings' },
    { key: 'progress', icon: 'flag', label: 'Hunt progress' },
  ];
  return (
    <>
      <Pressable style={[s.backdrop, { zIndex: 20 }]} onPress={onClose} accessibilityLabel="Close menu" accessibilityRole="button" />
      <View style={[s.menu, { top }]} accessibilityRole="menu">
        <T w="extrabold" size={13} label style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10 }}>Menu</T>
        {items.map((it) => (
          <Pressable key={it.key} onPress={() => onSelect(it.key)} accessibilityRole="menuitem" accessibilityLabel={it.label} style={({ pressed }) => [s.menuItem, pressed && { backgroundColor: colors.light }]}>
            <Icon name={it.icon} size={22} color="#000" />
            <View style={{ flex: 1 }}>
              <T w="bold" size={17}>{it.label}</T>
              {it.sub && <T w="semibold" size={14} color={colors.gray3}>{it.sub}</T>}
            </View>
            <Icon name="chev" size={20} color={colors.gray3} />
          </Pressable>
        ))}
      </View>
    </>
  );
}

const s = StyleSheet.create({
  primary: { height: 56, paddingHorizontal: 18, borderRadius: radius.pill, backgroundColor: colors.orange, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondary: { height: 56, paddingHorizontal: 18, borderRadius: radius.pill, borderWidth: 2, borderColor: '#000', backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  bar: {
    position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.gray1, zIndex: 5,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: -6 }, elevation: 8,
  },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '88%', backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  sheetHead: { flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 8, paddingTop: 10, paddingBottom: 6 },
  sheetFoot: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.gray1, gap: 8 },
  close: { width: TOUCH, height: TOUCH, alignItems: 'center', justifyContent: 'center' },
  toast: {
    position: 'absolute', left: 16, right: 16, zIndex: 15, backgroundColor: '#000', borderRadius: 12, padding: 14, paddingHorizontal: 16,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 10,
  },
  toastCheck: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  menu: {
    position: 'absolute', right: 12, width: 280, zIndex: 30, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 32, shadowOffset: { width: 0, height: 12 }, elevation: 12,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 56, paddingHorizontal: 18, paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.light },
});
