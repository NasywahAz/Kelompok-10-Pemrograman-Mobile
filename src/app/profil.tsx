import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
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
import { BottomNav, ProfileNavIcon } from '../components/common/BottomNav';

// Chevron panah kanan untuk item menu
function ChevronRightIcon({ color = COLORS.mutedText }: { color?: string }) {
  return (
    <View style={{ width: 10, height: 14, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: 7,
          height: 7,
          borderTopWidth: 2,
          borderRightWidth: 2,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

// Icon dekoratif untuk setiap menu pengaturan
function SettingIcon({ type }: { type: 'profile' | 'address' | 'security' | 'notification' | 'help' | 'about' }) {
  const iconColor = COLORS.primaryGreen;

  switch (type) {
    case 'profile':
      return (
        <View style={styles.settingIconBadge}>
          <ProfileNavIcon active={true} />
        </View>
      );
    case 'address':
      return (
        <View style={styles.settingIconBadge}>
          <View style={{ width: 8, height: 8, borderRadius: 4, borderWidth: 1.8, borderColor: iconColor }} />
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: 3,
              borderRightWidth: 3,
              borderTopWidth: 4,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderTopColor: iconColor,
              marginTop: -1,
            }}
          />
        </View>
      );
    case 'security':
      return (
        <View style={styles.settingIconBadge}>
          <View
            style={{
              width: 8,
              height: 6,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              borderWidth: 1.6,
              borderBottomWidth: 0,
              borderColor: iconColor,
            }}
          />
          <View
            style={{
              width: 12,
              height: 8,
              borderRadius: 2,
              backgroundColor: iconColor,
            }}
          />
        </View>
      );
    case 'notification':
      return (
        <View style={styles.settingIconBadge}>
          <View
            style={{
              width: 10,
              height: 9,
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5,
              borderWidth: 1.6,
              borderBottomWidth: 0,
              borderColor: iconColor,
            }}
          />
          <View style={{ width: 12, height: 2, backgroundColor: iconColor, borderRadius: 1 }} />
        </View>
      );
    case 'help':
      return (
        <View style={styles.settingIconBadge}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: iconColor }}>?</Text>
        </View>
      );
    case 'about':
      return (
        <View style={styles.settingIconBadge}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: iconColor }}>i</Text>
        </View>
      );
    default:
      return null;
  }
}

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
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Profil Saya</Text>
      </View>

      {/* KONTEN UTAMA SCROLLABLE */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* KARTU IDENTITAS PENGGUNA */}
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

        {/* SECTION: PENGATURAN AKUN */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Pengaturan Akun</Text>

          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => handleSettingPress('Edit Profil')}
            >
              <View style={styles.menuItemLeft}>
                <SettingIcon type="profile" />
                <View style={styles.menuTextGroup}>
                  <Text style={styles.menuTitle}>Edit Profil</Text>
                  <Text style={styles.menuSubtitle}>Ubah nama dan informasi profil</Text>
                </View>
              </View>
              <ChevronRightIcon />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => handleSettingPress('Alamat Saya')}
            >
              <View style={styles.menuItemLeft}>
                <SettingIcon type="address" />
                <View style={styles.menuTextGroup}>
                  <Text style={styles.menuTitle}>Alamat Pengiriman</Text>
                  <Text style={styles.menuSubtitle}>Atur alamat tujuan pengiriman barang</Text>
                </View>
              </View>
              <ChevronRightIcon />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => handleSettingPress('Keamanan & Kata Sandi')}
            >
              <View style={styles.menuItemLeft}>
                <SettingIcon type="security" />
                <View style={styles.menuTextGroup}>
                  <Text style={styles.menuTitle}>Keamanan Akun</Text>
                  <Text style={styles.menuSubtitle}>Kata sandi dan verifikasi keamanan</Text>
                </View>
              </View>
              <ChevronRightIcon />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => handleSettingPress('Notifikasi')}
            >
              <View style={styles.menuItemLeft}>
                <SettingIcon type="notification" />
                <View style={styles.menuTextGroup}>
                  <Text style={styles.menuTitle}>Notifikasi</Text>
                  <Text style={styles.menuSubtitle}>Atur pemberitahuan transaksi dan promo</Text>
                </View>
              </View>
              <ChevronRightIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION: PUSAT BANTUAN & TENTANG */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Pusat Informasi</Text>

          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => handleSettingPress('Bantuan & Dukungan')}
            >
              <View style={styles.menuItemLeft}>
                <SettingIcon type="help" />
                <View style={styles.menuTextGroup}>
                  <Text style={styles.menuTitle}>Pusat Bantuan</Text>
                  <Text style={styles.menuSubtitle}>Pertanyaan umum dan hubungi admin</Text>
                </View>
              </View>
              <ChevronRightIcon />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => handleSettingPress('Tentang Preloved')}
            >
              <View style={styles.menuItemLeft}>
                <SettingIcon type="about" />
                <View style={styles.menuTextGroup}>
                  <Text style={styles.menuTitle}>Tentang Preloved</Text>
                  <Text style={styles.menuSubtitle}>Versi 1.0.0 • Proyek Mobile Preloved</Text>
                </View>
              </View>
              <ChevronRightIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* TOMBOL LOG OUT DI BAGIAN BAWAH */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
            activeOpacity={0.8}
            onPress={handleLogoutPress}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color={COLORS.accentRed} />
            ) : (
              <Text style={styles.logoutButtonText}>Log Out</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.logoutNote}>
            Keluar dari sesi akun Anda pada perangkat ini
          </Text>
        </View>
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
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.darkText,
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

  // USER CARD
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

  // SECTION
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextGroup: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.mutedText,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 66,
  },

  // LOGOUT
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
