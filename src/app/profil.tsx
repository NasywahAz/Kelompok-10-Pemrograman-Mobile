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
  deleteAuthSession,
  getRegisteredUser,
  AuthSession,
} from '../utils/authStorage';

// Color Palette konsisten dengan Home Week 2 dan Login/Register
const COLORS = {
  primaryGreen: '#2E7D5B',
  accentRed: '#D95C5C',
  background: '#F8F9F7',
  white: '#FFFFFF',
  darkText: '#263238',
  lightGreen: '#E8F3EE',
  mutedText: '#78909C',
  border: '#E8EBE9',
  cardShadow: '#000000',
};

// Interface props icon navigasi
interface NavIconProps {
  active?: boolean;
}

// Icon Navigasi Home
function HomeNavIcon({ active }: NavIconProps) {
  const color = active ? COLORS.primaryGreen : COLORS.mutedText;
  return (
    <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 9,
          borderRightWidth: 9,
          borderBottomWidth: 8,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
        }}
      />
      <View
        style={{
          width: 14,
          height: 9,
          backgroundColor: color,
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
          marginTop: -1,
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            width: 4,
            height: 4.5,
            backgroundColor: COLORS.white,
            borderTopLeftRadius: 1,
            borderTopRightRadius: 1,
          }}
        />
      </View>
    </View>
  );
}

// Icon Navigasi Kategori
function CategoryNavIcon({ active }: NavIconProps) {
  const color = active ? COLORS.primaryGreen : COLORS.mutedText;
  return (
    <View style={{ width: 18, height: 18, justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: 7.5, height: 7.5, borderRadius: 2, backgroundColor: color }} />
        <View style={{ width: 7.5, height: 7.5, borderRadius: 2, backgroundColor: color }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: 7.5, height: 7.5, borderRadius: 2, backgroundColor: color }} />
        <View style={{ width: 7.5, height: 7.5, borderRadius: 2, backgroundColor: color }} />
      </View>
    </View>
  );
}

// Icon Navigasi Jual
function SellNavIcon() {
  return (
    <View style={styles.sellIconContainer}>
      <View style={styles.sellIconHorizontal} />
      <View style={styles.sellIconVertical} />
    </View>
  );
}

// Icon Navigasi Chat
function ChatNavIcon({ active }: NavIconProps) {
  const color = active ? COLORS.primaryGreen : COLORS.mutedText;
  return (
    <View style={{ width: 22, height: 20, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 19,
          height: 14,
          borderRadius: 5,
          borderWidth: 1.8,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 1.5,
          left: 4,
          width: 0,
          height: 0,
          borderLeftWidth: 2.5,
          borderRightWidth: 2.5,
          borderTopWidth: 3.5,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: color,
        }}
      />
    </View>
  );
}

// Icon Navigasi Profil
function ProfileNavIcon({ active }: NavIconProps) {
  const color = active ? COLORS.primaryGreen : COLORS.mutedText;
  return (
    <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          borderWidth: 1.8,
          borderColor: color,
        }}
      />
      <View
        style={{
          width: 15,
          height: 7,
          borderTopLeftRadius: 7.5,
          borderTopRightRadius: 7.5,
          borderWidth: 1.8,
          borderBottomWidth: 0,
          borderColor: color,
          marginTop: 1.5,
        }}
      />
    </View>
  );
}

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
    try {
      // Hapus sesi login saja, jangan menghapus data pendaftaran akun terdaftar
      await deleteAuthSession();
      router.replace('/login');
    } catch (error) {
      console.error('Gagal melakukan logout:', error);
      Alert.alert('Error', 'Gagal keluar dari sesi. Silakan coba lagi.');
    }
  };

  // Handler tombol Log Out dengan dialog konfirmasi
  const handleLogoutPress = () => {
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

  // Handler untuk menu navigasi bawah
  const handleBottomNav = (tab: string) => {
    if (tab === 'Home') {
      router.replace('/');
      return;
    }
    if (tab === 'Profil') {
      // Sudah berada di halaman profil
      return;
    }
    Alert.alert('Info', `Fitur ${tab} akan tersedia pada tahap berikutnya.`);
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
            style={styles.logoutButton}
            activeOpacity={0.8}
            onPress={handleLogoutPress}
          >
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
          <Text style={styles.logoutNote}>
            Keluar dari sesi akun Anda pada perangkat ini
          </Text>
        </View>
      </ScrollView>

      {/* 1.5 BOTTOM NAVIGATION KONSISTEN DENGAN HOME */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => handleBottomNav('Home')}
        >
          <HomeNavIcon active={false} />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => handleBottomNav('Kategori')}
        >
          <CategoryNavIcon active={false} />
          <Text style={styles.navLabel}>Kategori</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() => handleBottomNav('Jual')}
        >
          <SellNavIcon />
          <Text style={styles.navLabel}>Jual</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => handleBottomNav('Chat')}
        >
          <ChatNavIcon active={false} />
          <Text style={styles.navLabel}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => handleBottomNav('Profil')}
        >
          {/* Menu Profil ditandai aktif */}
          <ProfileNavIcon active={true} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Profil</Text>
        </TouchableOpacity>
      </View>
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

  // 1.5 BOTTOM NAVIGATION (Sama persis dengan Home)
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 18 : 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  navLabel: {
    fontSize: 10.5,
    color: COLORS.mutedText,
    marginTop: 3,
    fontWeight: '500',
  },
  navLabelActive: {
    color: COLORS.primaryGreen,
    fontWeight: '700',
  },
  sellIconContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primaryGreen,
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sellIconHorizontal: {
    width: 12,
    height: 2,
    backgroundColor: COLORS.white,
    borderRadius: 1,
  },
  sellIconVertical: {
    position: 'absolute',
    width: 2,
    height: 12,
    backgroundColor: COLORS.white,
    borderRadius: 1,
  },
});
