import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  getAuthSession,
  getAuthToken,
  deleteAuthSession,
  getRegisteredUser,
  AuthSession,
} from '../utils/authStorage';
import { getApiBaseUrl } from '../constants/api';
import { COLORS } from '../constants/colors';
import { BottomNav } from '../components/common/BottomNav';
import { ProfileTopBar } from '../components/profile/ProfileTopBar';
import { ProfileUserCard } from '../components/profile/ProfileUserCard';
import { ProfileMenuSection } from '../components/profile/ProfileMenuSection';
import { ProfileLogoutButton } from '../components/profile/ProfileLogoutButton';


export default function ProfilScreen() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  // Membaca sesi authentication saat halaman dibuka
  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      try {
        const currentSession = await getAuthSession();

        if (!currentSession || !currentSession.isLoggedIn) {
          // Jika belum ada sesi login yang valid, arahkan ke login
          if (isMounted) {
            router.replace('/login');
          }
          return;
        }

        if (isMounted) {
          setSession(currentSession);
          setUserEmail(currentSession.email);

          // Resolusi nama pengguna secara dinamis dari data akun
          let resolvedName = currentSession.name;

          if (!resolvedName) {
            // Jika name belum tersimpan di session, periksa akun terdaftar
            const registeredUser = await getRegisteredUser();
            if (
              registeredUser &&
              registeredUser.email &&
              registeredUser.email.toLowerCase() === currentSession.email.toLowerCase() &&
              registeredUser.name
            ) {
              resolvedName = registeredUser.name;
            } else if (currentSession.email.toLowerCase() === 'test@preloved.com') {
              resolvedName = 'Pengguna Preloved';
            } else {
              // Fallback dinamis: kapitalisasi awalan email
              const emailPrefix = currentSession.email.split('@')[0] || 'Pengguna';
              resolvedName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
            }
          }

          setUserName(resolvedName);
        }
      } catch (error) {
        console.error('Gagal memuat profil pengguna:', error);
        if (isMounted) {
          router.replace('/login');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handler eksekusi logout setelah konfirmasi
  const handleConfirmLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);

      // 1. Ambil JWT token menggunakan helper yang tersedia
      const token = await getAuthToken();

      // 2. Jika token tidak tersedia, hapus sesi lokal dan arahkan pengguna ke login
      // tanpa mengirim request logout yang tidak memiliki autentikasi
      if (!token || !token.trim()) {
        await deleteAuthSession();
        router.replace('/login');
        return;
      }

      // 3. Jika token tersedia, kirim request POST ke endpoint backend logout dengan Authorization Bearer
      let response: Response | null = null;
      try {
        response = await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (networkError) {
        // Tangani kegagalan jaringan: jangan mengklaim token sudah dicabut jika server tidak dapat dihubungi
        console.error('Gagal menghubungi server backend untuk logout:', networkError);

        const networkMessage =
          'Tidak dapat terhubung ke server untuk mencabut token. Sesi pada perangkat ini telah dibersihkan demi keamanan.';

        try {
          await deleteAuthSession();
        } catch (storageError) {
          console.error('Gagal menghapus sesi lokal:', storageError);
        }

        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined' && window.alert) {
            window.alert(networkMessage);
          }
          router.replace('/login');
          return;
        }

        Alert.alert('Koneksi Gagal', networkMessage, [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/login');
            },
          },
        ]);
        return;
      }

      // 4. Tangani respons backend:
      // Status 200: Logout berhasil, token dicabut di backend
      // Status 401: Token sudah tidak valid atau telah dicabut sebelumnya
      if (response && (response.status === 200 || response.status === 401)) {
        await deleteAuthSession();
        router.replace('/login');
        return;
      }

      // 5. Tangani respons server selain 200 dan 401
      const serverErrorMessage =
        'Terjadi kendala pada server saat memproses logout. Sesi pada perangkat ini telah dibersihkan demi keamanan.';

      try {
        await deleteAuthSession();
      } catch (storageError) {
        console.error('Gagal menghapus sesi lokal:', storageError);
      }

      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.alert) {
          window.alert(serverErrorMessage);
        }
        router.replace('/login');
        return;
      }

      Alert.alert('Peringatan Logout', serverErrorMessage, [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/login');
          },
        },
      ]);
    } catch (error) {
      console.error('Gagal melakukan logout:', error);
      try {
        await deleteAuthSession();
      } catch (storageError) {
        console.error('Gagal menghapus sesi lokal:', storageError);
      }
      router.replace('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handler tombol Log Out dengan dialog konfirmasi
  const handleLogoutPress = () => {
    if (isLoggingOut) {
      return;
    }

    if (Platform.OS === 'web') {
      const confirmLogout =
        typeof window !== 'undefined' && window.confirm
          ? window.confirm('Apakah Anda yakin ingin keluar (logout) dari akun Preloved?')
          : true;

      if (confirmLogout) {
        handleConfirmLogout();
      }
      return;
    }

    Alert.alert(
      'Konfirmasi Log Out',
      'Apakah Anda yakin ingin keluar dari akun Preloved?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: handleConfirmLogout,
        },
      ]
    );
  };


  // Handler klik menu pengaturan
  const handleSettingPress = (settingTitle: string) => {
    Alert.alert('Pengaturan', `Fitur ${settingTitle} akan tersedia pada tahap berikutnya.`);
  };

  // Tampilkan loading screen saat memeriksa sesi
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </SafeAreaView>
    );
  }

  // Jika sesi tidak valid
  if (!session) {
    return null;
  }

  // Inisial untuk avatar profil
  const avatarInitial = (userName.trim().charAt(0) || userEmail.trim().charAt(0) || 'U').toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* HEADER TOP BAR */}
      <ProfileTopBar />

      {/* KONTEN UTAMA SCROLLABLE */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* KARTU IDENTITAS PENGGUNA */}
        <ProfileUserCard
          avatarInitial={avatarInitial}
          userName={userName}
          userEmail={userEmail}
        />

        {/* SECTION: PENGATURAN AKUN */}
        <ProfileMenuSection
          title="Pengaturan Akun"
          items={[
            {
              iconType: 'profile',
              title: 'Edit Profil',
              subtitle: 'Ubah nama dan informasi profil',
              onPress: () => handleSettingPress('Edit Profil'),
            },
            {
              iconType: 'address',
              title: 'Alamat Pengiriman',
              subtitle: 'Atur alamat tujuan pengiriman barang',
              onPress: () => handleSettingPress('Alamat Saya'),
            },
            {
              iconType: 'security',
              title: 'Keamanan Akun',
              subtitle: 'Kata sandi dan verifikasi keamanan',
              onPress: () => handleSettingPress('Keamanan & Kata Sandi'),
            },
            {
              iconType: 'notification',
              title: 'Notifikasi',
              subtitle: 'Atur pemberitahuan transaksi dan promo',
              onPress: () => handleSettingPress('Notifikasi'),
            },
          ]}
        />

        {/* SECTION: PUSAT BANTUAN & TENTANG */}
        <ProfileMenuSection
          title="Pusat Informasi"
          items={[
            {
              iconType: 'help',
              title: 'Pusat Bantuan',
              subtitle: 'Pertanyaan umum dan hubungi admin',
              onPress: () => handleSettingPress('Bantuan & Dukungan'),
            },
            {
              iconType: 'about',
              title: 'Tentang Preloved',
              subtitle: 'Versi 1.0.0 • Proyek Mobile Preloved',
              onPress: () => handleSettingPress('Tentang Preloved'),
            },
          ]}
        />

        {/* TOMBOL LOG OUT DI BAGIAN BAWAH */}
        <ProfileLogoutButton
          onPress={handleLogoutPress}
          isLoggingOut={isLoggingOut}
        />
      </ScrollView>

      {/* 1.5 BOTTOM NAVIGATION */}
      <BottomNav activeTab="Profil" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },





});
