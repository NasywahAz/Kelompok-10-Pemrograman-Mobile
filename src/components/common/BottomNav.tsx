import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '../../constants/colors';

export type BottomNavTab = 'Home' | 'Kategori' | 'Jual' | 'Chat' | 'Profil';

export interface NavIconProps {
  active?: boolean;
}

// Icon Navigasi Home
export function HomeNavIcon({ active }: NavIconProps) {
  const color = active ? COLORS.primaryGreen : COLORS.mutedText;
  return (
    <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 9,
          borderRightWidth: 9,
          borderBottomWidth: 8,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
        }}
      />
      <View
        style={{
          width: 14,
          height: 9,
          backgroundColor: color,
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
          marginTop: -1,
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            width: 4,
            height: 4.5,
            backgroundColor: COLORS.white,
            borderTopLeftRadius: 1,
            borderTopRightRadius: 1,
          }}
        />
      </View>
    </View>
  );
}

// Icon Navigasi Kategori
export function CategoryNavIcon({ active }: NavIconProps) {
  const color = active ? COLORS.primaryGreen : COLORS.mutedText;
  return (
    <View style={{ width: 18, height: 18, justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: 7.5, height: 7.5, borderRadius: 2, backgroundColor: color }} />
        <View style={{ width: 7.5, height: 7.5, borderRadius: 2, backgroundColor: color }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: 7.5, height: 7.5, borderRadius: 2, backgroundColor: color }} />
        <View style={{ width: 7.5, height: 7.5, borderRadius: 2, backgroundColor: color }} />
      </View>
    </View>
  );
}

// Icon Navigasi Jual
export function SellNavIcon() {
  return (
    <View style={styles.sellIconContainer}>
      <View style={styles.sellIconHorizontal} />
      <View style={styles.sellIconVertical} />
    </View>
  );
}

// Icon Navigasi Chat
export function ChatNavIcon({ active }: NavIconProps) {
  const color = active ? COLORS.primaryGreen : COLORS.mutedText;
  return (
    <View style={{ width: 22, height: 20, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 19,
          height: 14,
          borderRadius: 5,
          borderWidth: 1.8,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 1.5,
          left: 4,
          width: 0,
          height: 0,
          borderLeftWidth: 2.5,
          borderRightWidth: 2.5,
          borderTopWidth: 3.5,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: color,
        }}
      />
    </View>
  );
}

// Icon Navigasi Profil
export function ProfileNavIcon({ active }: NavIconProps) {
  const color = active ? COLORS.primaryGreen : COLORS.mutedText;
  return (
    <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          borderWidth: 1.8,
          borderColor: color,
        }}
      />
      <View
        style={{
          width: 15,
          height: 7,
          borderTopLeftRadius: 7.5,
          borderTopRightRadius: 7.5,
          borderWidth: 1.8,
          borderBottomWidth: 0,
          borderColor: color,
          marginTop: 1.5,
        }}
      />
    </View>
  );
}

export interface BottomNavProps {
  activeTab: BottomNavTab;
  onTabPress?: (tab: BottomNavTab) => void;
}

export function BottomNav({ activeTab, onTabPress }: BottomNavProps) {
  const handlePress = (tab: BottomNavTab) => {
    if (onTabPress) {
      onTabPress(tab);
      return;
    }

    if (tab === activeTab) {
      return;
    }

    if (tab === 'Home') {
      router.replace('/');
      return;
    }

    if (tab === 'Profil') {
      router.push('/profil');
      return;
    }

    Alert.alert('Info', `Fitur ${tab} akan tersedia pada tahap berikutnya.`);
  };

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.7}
        onPress={() => handlePress('Home')}
      >
        <HomeNavIcon active={activeTab === 'Home'} />
        <Text style={[styles.navLabel, activeTab === 'Home' && styles.navLabelActive]}>
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.7}
        onPress={() => handlePress('Kategori')}
      >
        <CategoryNavIcon active={activeTab === 'Kategori'} />
        <Text style={[styles.navLabel, activeTab === 'Kategori' && styles.navLabelActive]}>
          Kategori
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.8}
        onPress={() => handlePress('Jual')}
      >
        <SellNavIcon />
        <Text style={[styles.navLabel, activeTab === 'Jual' && styles.navLabelActive]}>
          Jual
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.7}
        onPress={() => handlePress('Chat')}
      >
        <ChatNavIcon active={activeTab === 'Chat'} />
        <Text style={[styles.navLabel, activeTab === 'Chat' && styles.navLabelActive]}>
          Chat
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.7}
        onPress={() => handlePress('Profil')}
      >
        <ProfileNavIcon active={activeTab === 'Profil'} />
        <Text style={[styles.navLabel, activeTab === 'Profil' && styles.navLabelActive]}>
          Profil
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 18 : 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  navLabel: {
    fontSize: 10.5,
    color: COLORS.mutedText,
    marginTop: 3,
    fontWeight: '500',
  },
  navLabelActive: {
    color: COLORS.primaryGreen,
    fontWeight: '700',
  },
  sellIconContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primaryGreen,
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sellIconHorizontal: {
    width: 12,
    height: 2,
    backgroundColor: COLORS.white,
    borderRadius: 1,
  },
  sellIconVertical: {
    position: 'absolute',
    width: 2,
    height: 12,
    backgroundColor: COLORS.white,
    borderRadius: 1,
  },
});

export default BottomNav;
