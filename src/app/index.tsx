import { Redirect, router } from 'expo-router';
import { deleteAuthSession, getAuthSession } from '../utils/authStorage';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_PRODUCTS_URL } from '../constants/api';
import { COLORS } from '../constants/colors';
import { CATEGORIES } from '../constants/categories';
import { Product, RawProductPayload } from '../types/product';
import { formatRupiah } from '../utils/format';
import { BottomNav } from '../components/common/BottomNav';
import NetInfo from '@react-native-community/netinfo';

// Re-export untuk kompatibilitas
export type { Product, RawProductPayload };

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// REST API Endpoint: API_PRODUCTS_URL (GET /api/products)

// Pure React Native Icons
function SearchIcon({ size = 16, color = COLORS.mutedText }) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.72,
          height: size * 0.72,
          borderRadius: (size * 0.72) / 2,
          borderWidth: 2,
          borderColor: color,
          marginBottom: 2,
          marginRight: 2,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: size * 0.36,
          height: 2,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
          borderRadius: 1,
        }}
      />
    </View>
  );
}

function CartIcon({ size = 22, color = COLORS.darkText }) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.44,
          height: size * 0.3,
          borderTopLeftRadius: size * 0.22,
          borderTopRightRadius: size * 0.22,
          borderWidth: 1.8,
          borderBottomWidth: 0,
          borderColor: color,
          marginBottom: -1,
        }}
      />
      <View
        style={{
          width: size * 0.84,
          height: size * 0.54,
          borderWidth: 1.8,
          borderColor: color,
          borderRadius: 3,
          backgroundColor: 'transparent',
        }}
      />
    </View>
  );
}

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

      // 1. Ambil data dari REST API endpoint dengan header Authorization Bearer
      let response: Response;
      try {
        response = await fetch(API_PRODUCTS_URL, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (networkError) {
        // Penanganan error koneksi jaringan / server tidak dapat dijangkau
        console.error('Koneksi ke REST API gagal:', networkError);
        setErrorMessage(
          'Tidak dapat terhubung ke server. Pastikan server backend aktif dan periksa koneksi internet Anda.'
        );
        return;
      }

      // 2. Jika token ditolak oleh server (401: kedaluwarsa, tidak valid, atau telah dicabut)
      if (response.status === 401) {
        await deleteAuthSession();
        setAuthStatus('unauthenticated');
        router.replace('/login');
        return;
      }

      // 3. Penanganan HTTP error response (status non-2xx selain 401)
      if (!response.ok) {
        let serverMessage: string | null = null;
        try {
          const errorData = await response.json();
          if (errorData && typeof errorData.message === 'string' && errorData.message.trim()) {
            serverMessage = errorData.message.trim();
          }
        } catch {
          // Abaikan jika respons error server bukan format JSON valid
        }

        if (response.status === 404) {
          // Penanganan HTTP 404 Not Found
          setErrorMessage(
            serverMessage || 'Endpoint atau data produk tidak ditemukan (Error 404).'
          );
        } else if (response.status >= 500) {
          // Penanganan HTTP 500 dan Server Error lainnya
          setErrorMessage(
            serverMessage || `Server sedang bermasalah (Error ${response.status}). Silakan coba beberapa saat lagi.`
          );
        } else {
          // Penanganan HTTP error lainnya (misal 400, 403)
          setErrorMessage(
            serverMessage || `Gagal memuat produk dari server (status ${response.status}).`
          );
        }
        return;
      }

      // 4. Parse JSON response menjadi RawProductPayload[]
      let rawData: RawProductPayload[];
      try {
        rawData = await response.json();
      } catch {
        setErrorMessage('Format data produk dari server tidak valid.');
        return;
      }

      // 5. Mapping data mentah ke Data Model Product (Task 1 & Task 2)
      const mappedProducts: Product[] = Array.isArray(rawData)
        ? rawData.map((item: RawProductPayload) => ({
            id: Number(item.id),
            name: String(item.name),
            price: Number(item.price),
            location: String(item.location),
            condition: String(item.condition),
            category: String(item.category),
            image: String(item.image),
            tag: item.tag ?? null,
          }))
        : [];

      // 6. Simpan hasil mapping ke state untuk ditampilkan ke UI (Task 3)
      setProducts(mappedProducts);
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
      <View style={styles.topBar}>
        <View style={styles.searchBar}>
          <SearchIcon size={16} color={COLORS.mutedText} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari barang preloved..."
            placeholderTextColor={COLORS.mutedText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>

        <TouchableOpacity
          style={styles.cartButton}
          activeOpacity={0.7}
          onPress={() => handleNavPress('Keranjang')}
        >
          <CartIcon size={22} color={COLORS.darkText} />
          {/* Accent Red Notification Badge */}
          <View style={styles.cartBadge} />
        </TouchableOpacity>
      </View>

      {/* Week 6 Task 03: Banner Indikator Offline */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>
            ⚠️ Tidak ada koneksi internet. Mode offline aktif.
          </Text>
        </View>
      )}

      {/* SCROLLABLE MARKETPLACE CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1.2 KATEGORI SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Kategori</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedCategory(isSelected ? null : cat.name);
                  }}
                >
                  <View
                    style={[
                      styles.categoryIconBox,
                      isSelected && styles.categoryIconBoxActive,
                    ]}
                  >
                    <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                  </View>
                  <Text
                    style={[
                      styles.categoryName,
                      isSelected && styles.categoryNameActive,
                    ]}
                    numberOfLines={1}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

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
                <TouchableOpacity
                  key={item.id}
                  style={[styles.productCard, { width: cardWidth }]}
                  activeOpacity={0.85}
                  onPress={() =>
                    Alert.alert(
                      item.name,
                      `Harga: ${formatRupiah(item.price)}\nLokasi: ${item.location}\nKondisi: ${item.condition}`
                    )
                  }
                >
                  {/* Gambar Produk */}
                  <View style={styles.cardImageContainer}>
                    <Image source={{ uri: item.image }} style={styles.cardImage} />
                    {/* Accent Red Badge jika ada Promo/Highlight */}
                    {item.tag && (
                      <View style={styles.accentBadge}>
                        <Text style={styles.accentBadgeText}>{item.tag}</Text>
                      </View>
                    )}
                  </View>

                  {/* Detail Produk */}
                  <View style={styles.cardDetails}>
                    {/* Nama Produk (maksimal 2 baris) */}
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.name}
                    </Text>

                    {/* Harga (Informasi Paling Menonjol) */}
                    <Text style={styles.productPrice}>{formatRupiah(item.price)}</Text>

                    {/* Kondisi Badge */}
                    <View style={styles.conditionBadge}>
                      <Text style={styles.conditionBadgeText}>{item.condition}</Text>
                    </View>

                    {/* Lokasi */}
                    <View style={styles.locationRow}>
                      <Text style={styles.locationPin}>📍</Text>
                      <Text style={styles.locationText}>{item.location}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
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
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - PADDING * 2 - GAP) / 2);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // 1.1 TOP BAR / SEARCH
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PADDING,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13.5,
    color: COLORS.darkText,
    paddingVertical: 0,
  },
  cartButton: {
    marginLeft: 12,
    padding: 6,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentRed,
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

  // 1.2 KATEGORI
  categoryScroll: {
    paddingHorizontal: PADDING,
    gap: 12,
  },
  categoryItem: {
    alignItems: 'center',
    width: 62,
  },
  categoryIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  categoryIconBoxActive: {
    backgroundColor: COLORS.lightGreen,
    borderColor: COLORS.primaryGreen,
    borderWidth: 1.5,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.darkText,
    marginTop: 6,
    textAlign: 'center',
  },
  categoryNameActive: {
    color: COLORS.primaryGreen,
    fontWeight: '700',
  },

  // 1.3 & 1.4 PRODUK GRID (2 KOLOM)
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: GAP,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  cardImageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#F0F2F0',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  accentBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.accentRed,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  accentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  cardDetails: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.darkText,
    lineHeight: 18,
    minHeight: 36,
  },
  productPrice: {
    fontSize: 15.5,
    fontWeight: '700',
    color: COLORS.primaryGreen,
    marginTop: 4,
  },
  conditionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4,
    marginTop: 6,
  },
  conditionBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationPin: {
    fontSize: 10,
    marginRight: 2,
  },
  locationText: {
    fontSize: 11,
    color: COLORS.mutedText,
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
});
