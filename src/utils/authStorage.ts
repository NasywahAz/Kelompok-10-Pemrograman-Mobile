import * as SecureStore from 'expo-secure-store';

// Key untuk menyimpan session authentication di Secure Storage
export const AUTH_SESSION_KEY = 'preloved_auth_session';

// Tipe data session authentication (tanpa menyimpan password)
export interface AuthSession {
  isLoggedIn: boolean;
  email: string;
  loginAt: string;
}

/**
 * Menyimpan status/session authentication secara aman menggunakan SecureStore.
 * @param email Email pengguna yang berhasil login
 */
export const saveAuthSession = async (email: string): Promise<void> => {
  const sessionData: AuthSession = {
    isLoggedIn: true,
    email,
    loginAt: new Date().toISOString(),
  };

  await SecureStore.setItemAsync(
    AUTH_SESSION_KEY,
    JSON.stringify(sessionData)
  );
};

/**
 * Membaca session authentication yang tersimpan dari SecureStore.
 * @returns AuthSession jika ditemukan, atau null jika belum ada sesi
 */
export const getAuthSession = async (): Promise<AuthSession | null> => {
  try {
    const sessionString = await SecureStore.getItemAsync(AUTH_SESSION_KEY);
    if (!sessionString) {
      return null;
    }
    const session: AuthSession = JSON.parse(sessionString);
    return session;
  } catch (error) {
    console.error('Gagal membaca session dari SecureStore:', error);
    return null;
  }
};

/**
 * Memeriksa secara sederhana apakah session login masih tersedia dan aktif.
 * @returns true jika session valid dan aktif, false jika tidak
 */
export const checkIsLoggedIn = async (): Promise<boolean> => {
  const session = await getAuthSession();
  return session !== null && session.isLoggedIn === true;
};

/**
 * Menghapus session authentication dari SecureStore.
 * Disiapkan untuk tahap Logout pada tahap berikutnya.
 */
export const deleteAuthSession = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
  } catch (error) {
    console.error('Gagal menghapus session dari SecureStore:', error);
  }
};
