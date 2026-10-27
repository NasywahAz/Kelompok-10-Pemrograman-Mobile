import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';

export interface ProfileUserCardProps {
  avatarInitial: string;
  userName: string;
  userEmail: string;
}

export function ProfileUserCard({
  avatarInitial,
  userName,
  userEmail,
}: ProfileUserCardProps) {
  return (
    <View style={styles.userCard}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{avatarInitial}</Text>
      </View>

      <View style={styles.userInfo}>
        {/* Sapaan dinamis */}
        <Text style={styles.greetingText}>Hai, {userName}!</Text>
        {/* Email pengguna di bawah sapaan */}
        <Text style={styles.emailText}>{userEmail}</Text>

        <View style={styles.badgeContainer}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Akun Aktif</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.lightGreen,
    borderWidth: 2,
    borderColor: COLORS.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  userInfo: {
    flex: 1,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 3,
  },
  emailText: {
    fontSize: 13.5,
    color: COLORS.mutedText,
    marginBottom: 6,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primaryGreen,
    marginRight: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
});
