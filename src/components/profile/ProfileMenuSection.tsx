import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { ProfileMenuItem, ProfileMenuItemProps } from './ProfileMenuItem';

export interface ProfileMenuSectionProps {
  title: string;
  items?: ProfileMenuItemProps[];
  children?: React.ReactNode;
}

export function ProfileMenuSection({
  title,
  items,
  children,
}: ProfileMenuSectionProps) {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.menuCard}>
        {items
          ? items.map((item, index) => (
              <ProfileMenuItem
                key={`${item.title}-${index}`}
                {...item}
                showDivider={item.showDivider ?? index < items.length - 1}
              />
            ))
          : children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.cardShadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
});
