import React from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../constants/colors';

interface IconProps {
  size?: number;
  color?: string;
}

function SearchIcon({ size = 16, color = COLORS.mutedText }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.72,
          height: size * 0.72,
          borderRadius: (size * 0.72) / 2,
          borderWidth: 2,
          borderColor: color,
          marginBottom: 2,
          marginRight: 2,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: size * 0.36,
          height: 2,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
          borderRadius: 1,
        }}
      />
    </View>
  );
}

function CartIcon({ size = 22, color = COLORS.darkText }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.44,
          height: size * 0.3,
          borderTopLeftRadius: size * 0.22,
          borderTopRightRadius: size * 0.22,
          borderWidth: 1.8,
          borderBottomWidth: 0,
          borderColor: color,
          marginBottom: -1,
        }}
      />
      <View
        style={{
          width: size * 0.84,
          height: size * 0.54,
          borderWidth: 1.8,
          borderColor: color,
          borderRadius: 3,
          backgroundColor: 'transparent',
        }}
      />
    </View>
  );
}

export interface HomeTopBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onCartPress: () => void;
}

const PADDING = 12;

export function HomeTopBar({ searchQuery, onSearchChange, onCartPress }: HomeTopBarProps) {
  return (
    <View style={styles.topBar}>
      <View style={styles.searchBar}>
        <SearchIcon size={16} color={COLORS.mutedText} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari barang preloved..."
          placeholderTextColor={COLORS.mutedText}
          value={searchQuery}
          onChangeText={onSearchChange}
          returnKeyType="search"
        />
      </View>

      <TouchableOpacity
        style={styles.cartButton}
        activeOpacity={0.7}
        onPress={onCartPress}
      >
        <CartIcon size={22} color={COLORS.darkText} />
        {/* Accent Red Notification Badge */}
        <View style={styles.cartBadge} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PADDING,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13.5,
    color: COLORS.darkText,
    paddingVertical: 0,
  },
  cartButton: {
    marginLeft: 12,
    padding: 6,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentRed,
  },
});
