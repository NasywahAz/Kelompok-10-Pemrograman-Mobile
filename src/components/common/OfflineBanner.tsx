import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface OfflineBannerProps {
  visible?: boolean;
  message?: string;
  onRetry?: () => void;
}

export function OfflineBanner({
  visible = true,
  message = '⚠️ Tidak ada koneksi internet. Mode offline aktif.',
  onRetry,
}: OfflineBannerProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.offlineBanner}>
      <Text style={styles.offlineBannerText}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          activeOpacity={0.7}
          onPress={onRetry}
        >
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  offlineBanner: {
    backgroundColor: '#FFF3CD',
    borderBottomWidth: 1,
    borderBottomColor: '#FFEEBA',
    paddingVertical: 7,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineBannerText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '500',
    textAlign: 'center',
  },
  retryButton: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#FFE8A1',
    borderRadius: 4,
  },
  retryButtonText: {
    fontSize: 11,
    color: '#856404',
    fontWeight: '600',
  },
});
