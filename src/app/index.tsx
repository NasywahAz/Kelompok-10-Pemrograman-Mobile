import React, { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Color Palette
const COLORS = {
  primaryGreen: '#2E7D5B',
  accentRed: '#D95C5C',
  background: '#F8F9F7',
  white: '#FFFFFF',
  darkText: '#263238',
  lightGreen: '#E8F3EE',
  mutedText: '#78909C',
  border: '#E8EBE9',
};

// Data Dummy Kategori
const CATEGORIES = [
  { id: '1', name: 'Elektronik', icon: '💻' },
  { id: '2', name: 'Fashion', icon: '👕' },
  { id: '3', name: 'Buku', icon: '📚' },
  { id: '4', name: 'Rumah', icon: '🏠' },
  { id: '5', name: 'Hobi', icon: '🎮' },
  { id: '6', name: 'Kecantikan', icon: '💄' },
  { id: '7', name: 'Lainnya', icon: '📦' },
];

// Data Dummy Produk
const DUMMY_PRODUCTS = [
  {
    id: '1',
    name: 'Laptop ASUS VivoBook',
    price: 'Rp4.500.000',
    location: 'Malang',
    condition: 'Bekas - Sangat Baik',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80',
    category: 'Elektronik',
    tag: null,
  },
  {
    id: '2',
    name: 'iPhone 12 128GB',
    price: 'Rp5.200.000',
    location: 'Malang',
    condition: 'Bekas - Baik',
    image: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=500&q=80',
    category: 'Elektronik',
    tag: null,
  },
  {
    id: '3',
    name: 'Kamera Canon EOS M10',
    price: 'Rp3.100.000',
    location: 'Batu',
    condition: 'Bekas - Sangat Baik',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80',
    category: 'Elektronik',
    tag: null,
  },
  {
    id: '4',
    name: 'Hoodie Oversize',
    price: 'Rp120.000',
    location: 'Malang',
    condition: 'Bekas - Baik',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80',
    category: 'Fashion',
    tag: 'Promo',
  },
  {
    id: '5',
    name: 'Meja Belajar Minimalis',
    price: 'Rp350.000',
    location: 'Malang',
    condition: 'Bekas - Baik',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&q=80',
    category: 'Rumah',
    tag: null,
  },
  {
    id: '6',
    name: 'Headphone Wireless',
    price: 'Rp275.000',
    location: 'Malang',
    condition: 'Bekas - Sangat Baik',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    category: 'Elektronik',
    tag: null,
  },
];

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

interface NavIconProps {
  active: boolean;
}

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

function SellNavIcon() {
  return (
    <View style={styles.sellIconContainer}>
      <View style={styles.sellIconHorizontal} />
      <View style={styles.sellIconVertical} />
    </View>
  );
}

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

type AuthStatus = 'checking' | 'unauthenticated' | 'authenticated';

export default function HomeScreen() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
  const { width: windowWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(windowWidth || SCREEN_WIDTH);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Authentication Route Guard: Mengecek session authentication saat aplikasi dibuka
  useEffect(() => {
    let isMounted = true;

    const checkAuthSession = async () => {
      try {
        const sessionString = await SecureStore.getItemAsync('preloved_auth_session');
        if (sessionString) {
          const session = JSON.parse(sessionString);
          if (session && session.isLoggedIn === true) {
            if (isMounted) {
              setAuthStatus('authenticated');
            }
            return;
          }
        }

        // Jika session tidak ada atau user belum login
        if (isMounted) {
          setAuthStatus('unauthenticated');
          router.replace('/login');
        }
      } catch (error) {
        console.error('Gagal membaca session di Home:', error);
        if (isMounted) {
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

  // Tampilkan loading screen sederhana di tengah layar saat memeriksa session
  // agar pengguna tidak langsung melihat Home terlebih dahulu sebelum login
  if (authStatus !== 'authenticated') {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </SafeAreaView>
    );
  }

  // Navigasi Alert untuk menu selain Home
  const handleNavPress = (menuName: string) => {
    Alert.alert('Info', 'Fitur ini akan tersedia pada tahap berikutnya.');
  };

  // Perhitungan lebar card responsif 2 kolom
  const currentWidth = containerWidth > 0 ? containerWidth : (windowWidth || SCREEN_WIDTH);
  const cardWidth = Math.floor((currentWidth - PADDING * 2 - GAP) / 2);

  // Filter produk berdasarkan pencarian dan kategori aktif (opsional jika dipilih)
  const filteredProducts = DUMMY_PRODUCTS.filter((product) => {
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

          {/* 1.4 PRODUCT CARD GRID (2 KOLOM) */}
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
                  Alert.alert(item.name, `Harga: ${item.price}\nLokasi: ${item.location}\nKondisi: ${item.condition}`)
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
                  <Text style={styles.productPrice}>{item.price}</Text>

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

          {filteredProducts.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Tidak ada produk ditemukan.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 1.5 BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => {}}
        >
          <HomeNavIcon active={true} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => handleNavPress('Kategori')}
        >
          <CategoryNavIcon active={false} />
          <Text style={styles.navLabel}>Kategori</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() => handleNavPress('Jual')}
        >
          <SellNavIcon />
          <Text style={styles.navLabel}>Jual</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => handleNavPress('Chat')}
        >
          <ChatNavIcon active={false} />
          <Text style={styles.navLabel}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => handleNavPress('Profil')}
        >
          <ProfileNavIcon active={false} />
          <Text style={styles.navLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
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

  // 1.5 BOTTOM NAVIGATION
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
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
