import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Mendapatkan URL Base API secara dinamis berdasarkan platform dan host Expo.
 * - Expo Go (Device Fisik / WiFi): Menggunakan IP host developer dari hostUri (port 3000)
 * - Android Emulator: Menggunakan http://10.0.2.2:3000
 * - iOS Simulator / Web: Menggunakan http://localhost:3000
 */
export const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip) {
      return `http://${ip}:3000`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return 'http://localhost:3000';
};

/**
 * Endpoint REST API untuk mengambil data produk Preloved
 */
export const API_PRODUCTS_URL = `${getApiBaseUrl()}/api/products`;
