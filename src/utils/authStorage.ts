import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Key untuk menyimpan session authentication di storage
export const AUTH_SESSION_KEY = 'preloved_auth_session';

// Key untuk menyimpan akun pendaftaran lokal (simulasi/demo)
export const REGISTERED_USER_KEY = 'preloved_registered_user';

// Tipe data session authentication (tanpa menyimpan password)
export interface AuthSession {
  isLoggedIn: boolean;
  email: string;
  name?: string;
  loginAt: string;
}

// Tipe data akun terdaftar untuk keperluan demonstrasi lokal
export interface RegisteredUser {
  name: string;
  email: string;
  password?: string;
}

/**
 * CATATAN KEAMANAN:
 * Mekanisme penyimpanan ini dirancang untuk demonstrasi lokal pengembangan (local demo project),
 * BUKAN implementasi autentikasi tingkat produksi (production-ready).
 *
 * Pada Web Browser:
 * Menggunakan window.localStorage karena Expo SecureStore tidak didukung di lingkungan web
 * dan menyebabkan runtime error (TypeError: getValueWithKeyAsync is not a function).
 * Pada browser, data sesi disimpan tanpa password.
 *
 * Pada Mobile (Android / iOS / Expo Go):
 * Menggunakan Expo SecureStore untuk menyimpan data sesi secara aman di keystore/keychain perangkat.
 */

const isWeb = Platform.OS === 'web';

/**
 * Helper internal untuk membaca nilai string dari storage berdasarkan platform:
 * - Web: window.localStorage
 * - Native (Android/iOS): Expo SecureStore
 */
const getStorageItem = async (key: string): Promise<string | null> => {
  if (isWeb) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error(`[authStorage] Gagal membaca key "${key}" dari localStorage:`, error);
      return null;
    }
  }

  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`[authStorage] Gagal membaca key "${key}" dari SecureStore:`, error);
    return null;
  }
};

/**
 * Helper internal untuk menyimpan nilai string ke storage berdasarkan platform:
 * - Web: window.localStorage
 * - Native (Android/iOS): Expo SecureStore
 */
const setStorageItem = async (key: string, value: string): Promise<void> => {
  if (isWeb) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`[authStorage] Gagal menyimpan key "${key}" ke localStorage:`, error);
      throw error;
    }
    return;
  }

  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`[authStorage] Gagal menyimpan key "${key}" ke SecureStore:`, error);
    throw error;
  }
};

/**
 * Helper internal untuk menghapus key dari storage berdasarkan platform:
 * - Web: window.localStorage
 * - Native (Android/iOS): Expo SecureStore
 */
const deleteStorageItem = async (key: string): Promise<void> => {
  if (isWeb) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`[authStorage] Gagal menghapus key "${key}" dari localStorage:`, error);
      throw error;
    }
    return;
  }

  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`[authStorage] Gagal menghapus key "${key}" dari SecureStore:`, error);
    throw error;
  }
};

/**
 * Menyimpan status/session authentication secara aman dan kompatibel multi-platform.
 * Password TIDAK disimpan dalam data sesi.
 *
 * @param email Email pengguna yang berhasil login
 * @param name Nama pengguna yang berhasil login (opsional)
 */
export const saveAuthSession = async (email: string, name?: string): Promise<void> => {
  const sessionData: AuthSession = {
    isLoggedIn: true,
    email,
    name: name || undefined,
    loginAt: new Date().toISOString(),
  };

  await setStorageItem(
    AUTH_SESSION_KEY,
    JSON.stringify(sessionData)
  );
};

/**
 * Membaca session authentication yang tersimpan dari storage secara kompatibel.
 * @returns AuthSession jika ditemukan dan valid, atau null jika belum ada sesi atau terjadi error
 */
export const getAuthSession = async (): Promise<AuthSession | null> => {
  try {
    const sessionString = await getStorageItem(AUTH_SESSION_KEY);
    if (!sessionString) {
      return null;
    }
    const session: AuthSession = JSON.parse(sessionString);
    return session;
  } catch (error) {
    console.error('[authStorage] Gagal membaca session dari storage:', error);
    return null;
  }
};

/**
 * Memeriksa apakah session login pengguna masih tersedia dan berstatus aktif.
 * @returns true jika session aktif (isLoggedIn === true), false jika tidak
 */
export const checkIsLoggedIn = async (): Promise<boolean> => {
  const session = await getAuthSession();
  return session !== null && session.isLoggedIn === true;
};

/**
 * Menghapus session authentication dari storage (digunakan saat Logout).
 */
export const deleteAuthSession = async (): Promise<void> => {
  try {
    await deleteStorageItem(AUTH_SESSION_KEY);
  } catch (error) {
    console.error('[authStorage] Gagal menghapus session dari storage:', error);
    throw error;
  }
};

/**
 * Menyimpan data akun pendaftaran (simulasi demonstrasi lokal).
 */
export const saveRegisteredUser = async (user: RegisteredUser): Promise<void> => {
  try {
    await setStorageItem(REGISTERED_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('[authStorage] Gagal menyimpan pendaftaran ke storage:', error);
    throw error;
  }
};

/**
 * Membaca data akun pendaftaran (simulasi demonstrasi lokal).
 */
export const getRegisteredUser = async (): Promise<RegisteredUser | null> => {
  try {
    const dataString = await getStorageItem(REGISTERED_USER_KEY);
    if (!dataString) {
      return null;
    }
    const user: RegisteredUser = JSON.parse(dataString);
    return user;
  } catch (error) {
    console.error('[authStorage] Gagal membaca pendaftaran user dari storage:', error);
    return null;
  }
};
