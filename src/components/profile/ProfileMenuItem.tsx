import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { ProfileNavIcon } from '../common/BottomNav';

export type SettingIconType =
  | 'profile'
  | 'address'
  | 'security'
  | 'notification'
  | 'help'
  | 'about';

// Chevron panah kanan untuk item menu
export function ChevronRightIcon({ color = COLORS.mutedText }: { color?: string }) {
  return (
    <View style={{ width: 10, height: 14, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: 7,
          height: 7,
          borderTopWidth: 2,
          borderRightWidth: 2,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

// Icon dekoratif untuk setiap menu pengaturan
export function SettingIcon({ type }: { type: SettingIconType }) {
  const iconColor = COLORS.primaryGreen;

  switch (type) {
    case 'profile':
      return (
        <View style={styles.settingIconBadge}>
          <ProfileNavIcon active={true} />
        </View>
      );
    case 'address':
      return (
        <View style={styles.settingIconBadge}>
          <View style={{ width: 8, height: 8, borderRadius: 4, borderWidth: 1.8, borderColor: iconColor }} />
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: 3,
              borderRightWidth: 3,
              borderTopWidth: 4,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderTopColor: iconColor,
              marginTop: -1,
            }}
          />
        </View>
      );
    case 'security':
      return (
        <View style={styles.settingIconBadge}>
          <View
            style={{
              width: 8,
              height: 6,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              borderWidth: 1.6,
              borderBottomWidth: 0,
              borderColor: iconColor,
            }}
          />
          <View
            style={{
              width: 12,
              height: 8,
              borderRadius: 2,
              backgroundColor: iconColor,
            }}
          />
        </View>
      );
    case 'notification':
      return (
        <View style={styles.settingIconBadge}>
          <View
            style={{
              width: 10,
              height: 9,
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5,
              borderWidth: 1.6,
              borderBottomWidth: 0,
              borderColor: iconColor,
            }}
          />
          <View style={{ width: 12, height: 2, backgroundColor: iconColor, borderRadius: 1 }} />
        </View>
      );
    case 'help':
      return (
        <View style={styles.settingIconBadge}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: iconColor }}>?</Text>
        </View>
      );
    case 'about':
      return (
        <View style={styles.settingIconBadge}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: iconColor }}>i</Text>
        </View>
      );
    default:
      return null;
  }
}

export interface ProfileMenuItemProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconType?: SettingIconType;
  onPress: () => void;
  showDivider?: boolean;
}

export function ProfileMenuItem({
  title,
  subtitle,
  icon,
  iconType,
  onPress,
  showDivider = false,
}: ProfileMenuItemProps) {
  const renderedIcon =
    icon !== undefined ? icon : iconType ? <SettingIcon type={iconType} /> : null;

  return (
    <>
      <TouchableOpacity
        style={styles.menuItem}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <View style={styles.menuItemLeft}>
          {renderedIcon}
          <View style={styles.menuTextGroup}>
            <Text style={styles.menuTitle}>{title}</Text>
            {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        <ChevronRightIcon />
      </TouchableOpacity>
      {showDivider && <View style={styles.menuDivider} />}
    </>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextGroup: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.mutedText,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 66,
  },
});
