import { Redirect, router } from 'expo-router';
import { deleteAuthSession, getAuthSession } from '../utils/authStorage';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { fetchPrelovedProducts } from '../utils/api';
import { Product, RawProductPayload } from '../types/product';
import { formatRupiah } from '../utils/format';
import { BottomNav } from '../components/common/BottomNav';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { CategorySection } from '../components/home/CategorySection';
import { HomeTopBar } from '../components/home/HomeTopBar';
import { ProductCard } from '../components/home/ProductCard';
import NetInfo from '@react-native-community/netinfo';

// Re-export untuk kompatibilitas
export type { Product, RawProductPayload };

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// REST API Endpoint: GET /api/products (via src/utils/api.ts)

type AuthStatus = 'checking' | 'unauthenticated' | 'authenticated';

export default function HomeScreen() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
  const { width: windowWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(windowWidth || SCREEN_WIDTH);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // State untuk menyimpan Product sesuai Data Model Task 1 & Task 2
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Week 6 Task 03: State koneksi offline/online
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const wasOfflineRef = useRef<boolean>(false);
  const isFetchingRef = useRef<boolean>(false);
  const authStatusRef = useRef<AuthStatus>(authStatus);

  useEffect(() => {
    authStatusRef.current = authStatus;
  }, [authStatus]);

  // Week 4 Task 2, Week 5 (JWT), Week 6 Task 01 (API Error) & Task 03 (Offline)
  const loadPrelovedProducts = async (passedToken?: unknown) => {
    // Cegah pemanggilan request ganda jika sedang dalam proses pemanggilan API
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setErrorMessage(null);

      // Pastikan token tersedia dari argumen atau dari session storage
      let token = typeof passedToken === 'string' ? passedToken : undefined;
      if (!token) {
        const session = await getAuthSession();
        if (!session || !session.isLoggedIn || !session.token || !session.token.trim()) {
          await deleteAuthSession();
          setAuthStatus('unauthenticated');
          router.replace('/login');
          return;
        }
        token = session.token;
      }

      // Ambil data produk melalui API utility
      const result = await fetchPrelovedProducts(token);

      // Jika token ditolak oleh server (401: kedaluwarsa, tidak valid, atau telah dicabut)
      if (result.isUnauthorized) {
        await deleteAuthSession();
        setAuthStatus('unauthenticated');
        router.replace('/login');
        return;
      }

      // Jika request gagal (network error, status non-2xx, parse JSON error)
      if (!result.success || !result.data) {
        setErrorMessage(result.errorMessage || 'Gagal memuat produk dari server.');
        return;
      }

      // Simpan hasil data produk ke state untuk ditampilkan ke UI
      setProducts(result.data);
    } catch (error) {
      console.error('Terjadi kesalahan tak terduga saat memproses produk:', error);
      setErrorMessage('Terjadi kesalahan saat memproses data produk.');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Authentication Route Guard: Mengecek session authentication saat aplikasi dibuka
  useEffect(() => {
    let isMounted = true;

    const checkAuthSession = async () => {
      try {
        const session = await getAuthSession();
        // Sesi harus aktif dan memiliki token JWT
        if (session && session.isLoggedIn === true && session.token && session.token.trim()) {
          if (isMounted) {
            setAuthStatus('authenticated');
            // Hanya muat data produk setelah user terverifikasi login dan memiliki token
            loadPrelovedProducts(session.token);
          }
          return;
        }

        // Jika session tidak ada, kosong, tidak valid, atau tidak memiliki token
        if (isMounted) {
          await deleteAuthSession();
          setAuthStatus('unauthenticated');
          router.replace('/login');
        }
      } catch (error) {
        console.error('Gagal membaca session di Home:', error);
        if (isMounted) {
          await deleteAuthSession();
          setAuthStatus('unauthenticated');
          router.replace('/login');
        }
      }
    };

    checkAuthSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Week 6 Task 03: Deteksi perubahan koneksi secara real-time & auto-recovery saat koneksi pulih
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const currentlyOffline = state.isConnected === false;
      setIsOffline(currentlyOffline);

      if (currentlyOffline) {
        wasOfflineRef.current = true;
      } else if (state.isConnected === true) {
        // Jika sebelumnya offline dan sekarang koneksi pulih (online)
        if (wasOfflineRef.current) {
          wasOfflineRef.current = false;
          // Panggil loadPrelovedProducts hanya jika user terverifikasi dan tidak sedang fetching
          if (authStatusRef.current === 'authenticated' && !isFetchingRef.current) {
            loadPrelovedProducts();
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Tampilkan loading screen di tengah layar saat memeriksa session
  // agar pengguna tidak langsung melihat Home terlebih dahulu sebelum login
  if (authStatus === 'checking') {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </SafeAreaView>
    );
  }

  // Jika unauthenticated, arahkan ke /login dan jangan render Home
  if (authStatus === 'unauthenticated') {
    return <Redirect href="/login" />;
  }

  // Navigasi untuk menu navigasi bawah
  const handleNavPress = (menuName: string) => {
    if (menuName === 'Profil') {
      router.push('/profil');
      return;
    }
    Alert.alert('Info', `Fitur ${menuName} akan tersedia pada tahap berikutnya.`);
  };

  // Perhitungan lebar card responsif 2 kolom
  const currentWidth = containerWidth > 0 ? containerWidth : (windowWidth || SCREEN_WIDTH);
  const cardWidth = Math.floor((currentWidth - PADDING * 2 - GAP) / 2);

  // Filter produk berdasarkan pencarian dan kategori aktif (opsional jika dipilih)
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 1.1 TOP BAR / SEARCH */}
      <HomeTopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCartPress={() => handleNavPress('Keranjang')}
      />

      {/* Week 6 Task 03: Banner Indikator Offline */}
      <OfflineBanner
        visible={isOffline}
        onRetry={() => loadPrelovedProducts()}
      />

      {/* SCROLLABLE MARKETPLACE CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1.2 KATEGORI SECTION */}
        <CategorySection
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* 1.3 PRODUK / REKOMENDASI SECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Rekomendasi Untukmu</Text>
            {selectedCategory && (
              <TouchableOpacity
                onPress={() => setSelectedCategory(null)}
                style={styles.resetCategoryButton}
              >
                <Text style={styles.resetCategoryText}>Semua</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Status Loading */}
          {isLoading && (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="small" color={COLORS.primaryGreen} />
              <Text style={styles.loadingText}>Memuat produk...</Text>
            </View>
          )}

          {/* Status Error */}
          {!isLoading && errorMessage && (
            <View style={styles.stateContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                activeOpacity={0.7}
                onPress={() => loadPrelovedProducts()}
              >
                <Text style={styles.retryButtonText}>Coba Lagi</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 1.4 PRODUCT CARD GRID (2 KOLOM) */}
          {!isLoading && !errorMessage && (
            <View
              style={styles.productGrid}
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                if (w > 0 && Math.abs(w - containerWidth) > 1) {
                  setContainerWidth(w);
                }
              }}
            >
              {filteredProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  cardWidth={cardWidth}
                  onPress={(product) =>
                    Alert.alert(
                      product.name,
                      `Harga: ${formatRupiah(product.price)}\nLokasi: ${product.location}\nKondisi: ${product.condition}`
                    )
                  }
                />
              ))}
            </View>
          )}

          {!isLoading && !errorMessage && filteredProducts.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Tidak ada produk ditemukan.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 1.5 BOTTOM NAVIGATION */}
      <BottomNav activeTab="Home" />
    </SafeAreaView>
  );
}

// Perhitungan lebar card untuk grid 2 kolom yang responsif
const PADDING = 12;
const GAP = 10;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // SCROLL CONTENT
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // SECTION GENERAL
  sectionContainer: {
    marginTop: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkText,
    paddingHorizontal: PADDING,
    marginBottom: 10,
  },
  resetCategoryButton: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: COLORS.lightGreen,
    borderRadius: 6,
  },
  resetCategoryText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },

  // 1.3 & 1.4 PRODUK GRID (2 KOLOM)
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING,
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    color: COLORS.mutedText,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateContainer: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.mutedText,
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.accentRed,
    fontWeight: '500',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.lightGreen,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
});
