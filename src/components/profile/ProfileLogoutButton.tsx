import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../constants/colors';

export interface ProfileLogoutButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  isLoggingOut?: boolean;
}

export function ProfileLogoutButton({
  onPress,
  isLoading,
  isLoggingOut,
}: ProfileLogoutButtonProps) {
  const loading = isLoggingOut ?? isLoading ?? false;

  return (
    <View style={styles.logoutContainer}>
      <TouchableOpacity
        style={[styles.logoutButton, loading && styles.logoutButtonDisabled]}
        activeOpacity={0.8}
        onPress={onPress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.accentRed} />
        ) : (
          <Text style={styles.logoutButtonText}>Log Out</Text>
        )}
      </TouchableOpacity>
      <Text style={styles.logoutNote}>
        Keluar dari sesi akun Anda pada perangkat ini
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoutContainer: {
    marginTop: 10,
    marginBottom: 24,
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
    backgroundColor: '#FDEDEC',
    borderWidth: 1,
    borderColor: COLORS.accentRed,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.accentRed,
  },
  logoutNote: {
    fontSize: 12,
    color: COLORS.mutedText,
    marginTop: 8,
    textAlign: 'center',
  },
});
