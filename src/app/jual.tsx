import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/colors';
import { CATEGORIES } from '../constants/categories';
import { BottomNav } from '../components/common/BottomNav';
import { getAuthSession } from '../utils/authStorage';
import { formatRupiah } from '../utils/format';

const CONDITIONS = [
  'Bekas - Seperti Baru',
  'Bekas - Sangat Baik',
  'Bekas - Baik',
  'Bekas - Cukup',
];

export default function JualScreen() {
  // Autentikasi state
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Form states
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [condition, setCondition] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // UI / Interaction states
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isPickingImage, setIsPickingImage] = useState<boolean>(false);

  // Pastikan user sudah login sebelum mengakses menu Jual
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        const session = await getAuthSession();
        if (!session || !session.isLoggedIn) {
          if (isMounted) {
            router.replace('/login');
          }
          return;
        }
      } catch (error) {
        console.error('[Jual] Gagal memeriksa sesi autentikasi:', error);
        if (isMounted) {
          router.replace('/login');
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handler: Mengambil foto langsung dengan kamera
  const handleTakePhoto = async () => {
    if (isPickingImage) return;

    try {
      setIsPickingImage(true);
      setErrorMessage('');

      // Minta izin kamera ke sistem operasi HP
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Izin Kamera Ditolak',
          'Aplikasi membutuhkan izin kamera untuk mengambil foto barang preloved Anda. Silakan berikan izin di pengaturan perangkat.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('[Jual] Error saat membuka kamera:', error);
      Alert.alert(
        'Kamera Bermasalah',
        'Tidak dapat membuka kamera pada perangkat ini. Pastikan perangkat memiliki modul kamera.'
      );
    } finally {
      setIsPickingImage(false);
    }
  };

  // Handler: Memilih foto dari galeri HP
  const handlePickFromGallery = async () => {
    if (isPickingImage) return;

    try {
      setIsPickingImage(true);
      setErrorMessage('');

      // Minta izin akses galeri/media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Izin Galeri Ditolak',
          'Aplikasi membutuhkan izin galeri untuk memilih foto barang preloved Anda. Silakan berikan izin di pengaturan perangkat.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('[Jual] Error saat memilih foto dari galeri:', error);
      Alert.alert('Galeri Bermasalah', 'Gagal memuat galeri foto perangkat.');
    } finally {
      setIsPickingImage(false);
    }
  };

  // Handler: Hapus foto yang sudah dipilih
  const handleRemovePhoto = () => {
    setImageUri(null);
  };

  // Handler: Validasi form & Simpan (Tahap 1: Validasi Frontend Saja)
  const handleFormSubmit = () => {
    setErrorMessage('');

    // Validasi field foto
    if (!imageUri) {
      setErrorMessage('Foto barang wajib disertakan.');
      Alert.alert('Perhatian', 'Foto barang wajib diambil atau dipilih dari galeri.');
      return;
    }

    // Validasi nama barang
    if (!name.trim()) {
      setErrorMessage('Nama barang wajib diisi.');
      Alert.alert('Perhatian', 'Nama barang wajib diisi.');
      return;
    }

    // Validasi harga
    const parsedPrice = parseInt(price.replace(/[^0-9]/g, ''), 10);
    if (!price.trim() || isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage('Harga barang wajib diisi dengan nominal yang valid.');
      Alert.alert('Perhatian', 'Harga barang harus berupa angka lebih dari 0.');
      return;
    }

    // Validasi kategori
    if (!category) {
      setErrorMessage('Kategori barang wajib dipilih.');
      Alert.alert('Perhatian', 'Silakan pilih salah satu kategori barang.');
      return;
    }

    // Validasi kondisi
    if (!condition) {
      setErrorMessage('Kondisi barang wajib dipilih.');
      Alert.alert('Perhatian', 'Silakan pilih kondisi barang preloved Anda.');
      return;
    }

    // Validasi lokasi
    if (!location.trim()) {
      setErrorMessage('Lokasi barang wajib diisi.');
      Alert.alert('Perhatian', 'Lokasi kota/kabupaten penjual wajib diisi.');
      return;
    }

    // Validasi deskripsi
    if (!description.trim()) {
      setErrorMessage('Deskripsi barang wajib diisi.');
      Alert.alert('Perhatian', 'Deskripsi detail mengenai barang wajib diisi.');
      return;
    }

    // Tahap 1: Penanda bahwa penyimpanan backend belum dihubungkan
    Alert.alert(
      'Validasi Berhasil',
      `Formulir Jual telah tervalidasi dengan lengkap!\n\n• Barang: ${name.trim()}\n• Harga: ${formatRupiah(parsedPrice)}\n• Kategori: ${category}\n• Kondisi: ${condition}\n• Lokasi: ${location.trim()}\n\nCatatan: Penyimpanan ke backend/database akan dihubungkan pada tahap integrasi berikutnya.`,
      [{ text: 'Mengerti' }]
    );
  };

  if (isCheckingAuth) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </SafeAreaView>
    );
  }

  const numericPrice = parseInt(price.replace(/[^0-9]/g, ''), 10);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jual Barang</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section: Upload / Ambil Foto */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Foto Barang</Text>
            <Text style={styles.sectionSubtitle}>
              Ambil foto menggunakan kamera atau pilih dari galeri HP Anda
            </Text>

            {imageUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <View style={styles.previewActions}>
                  <TouchableOpacity
                    style={[styles.smallButton, styles.changeButton]}
                    activeOpacity={0.8}
                    onPress={handlePickFromGallery}
                  >
                    <Text style={styles.smallButtonText}>Ganti Foto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallButton, styles.removeButton]}
                    activeOpacity={0.8}
                    onPress={handleRemovePhoto}
                  >
                    <Text style={styles.removeButtonText}>Hapus</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.photoPlaceholderBox}>
                <Text style={styles.photoPlaceholderIcon}>📷</Text>
                <Text style={styles.photoPlaceholderText}>Belum ada foto yang dipilih</Text>
              </View>
            )}

            <View style={styles.photoButtonsRow}>
              <TouchableOpacity
                style={[styles.photoActionButton, isPickingImage && styles.buttonDisabled]}
                activeOpacity={0.8}
                onPress={handleTakePhoto}
                disabled={isPickingImage}
              >
                <Text style={styles.photoActionButtonIcon}>📸</Text>
                <Text style={styles.photoActionButtonText}>Ambil Foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.photoActionButton,
                  styles.photoActionButtonSecondary,
                  isPickingImage && styles.buttonDisabled,
                ]}
                activeOpacity={0.8}
                onPress={handlePickFromGallery}
                disabled={isPickingImage}
              >
                <Text style={styles.photoActionButtonIcon}>🖼️</Text>
                <Text style={styles.photoActionButtonTextSecondary}>Pilih Galeri</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: Pesan Error Inline */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          ) : null}

          {/* Section: Detail Produk */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Detail Barang</Text>

            {/* Nama Barang */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Nama Barang <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Jaket Denim Vintage"
                placeholderTextColor={COLORS.mutedText}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errorMessage) setErrorMessage('');
                }}
                maxLength={80}
              />
            </View>

            {/* Harga Barang */}
            <View style={styles.inputGroup}>
              <View style={styles.labelWithPreview}>
                <Text style={styles.inputLabel}>
                  Harga (Rp) <Text style={styles.requiredStar}>*</Text>
                </Text>
                {!isNaN(numericPrice) && numericPrice > 0 ? (
                  <Text style={styles.priceFormattedText}>
                    {formatRupiah(numericPrice)}
                  </Text>
                ) : null}
              </View>
              <TextInput
                style={styles.input}
                placeholder="Contoh: 150000"
                placeholderTextColor={COLORS.mutedText}
                value={price}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setPrice(cleaned);
                  if (errorMessage) setErrorMessage('');
                }}
                keyboardType="numeric"
              />
            </View>

            {/* Pilihan Kategori */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Kategori <Text style={styles.requiredStar}>*</Text>
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsScroll}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.name;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryChip,
                        isSelected && styles.categoryChipSelected,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        setCategory(cat.name);
                        if (errorMessage) setErrorMessage('');
                      }}
                    >
                      <Text style={styles.categoryChipEmoji}>{cat.icon}</Text>
                      <Text
                        style={[
                          styles.categoryChipText,
                          isSelected && styles.categoryChipTextSelected,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Pilihan Kondisi */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Kondisi Barang <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View style={styles.conditionsGrid}>
                {CONDITIONS.map((cond) => {
                  const isSelected = condition === cond;
                  return (
                    <TouchableOpacity
                      key={cond}
                      style={[
                        styles.conditionChip,
                        isSelected && styles.conditionChipSelected,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        setCondition(cond);
                        if (errorMessage) setErrorMessage('');
                      }}
                    >
                      <Text
                        style={[
                          styles.conditionChipText,
                          isSelected && styles.conditionChipTextSelected,
                        ]}
                      >
                        {cond}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Lokasi */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Lokasi Kota / Kabupaten <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Malang"
                placeholderTextColor={COLORS.mutedText}
                value={location}
                onChangeText={(text) => {
                  setLocation(text);
                  if (errorMessage) setErrorMessage('');
                }}
              />
            </View>

            {/* Deskripsi */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Deskripsi Lengkap <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Jelaskan ukuran, kelengkapan, minus, atau alasan dijual..."
                placeholderTextColor={COLORS.mutedText}
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  if (errorMessage) setErrorMessage('');
                }}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Tombol Simpan/Jual */}
          <View style={styles.submitSection}>
            <TouchableOpacity
              style={styles.submitButton}
              activeOpacity={0.8}
              onPress={handleFormSubmit}
            >
              <Text style={styles.submitButtonText}>Jual Sekarang</Text>
            </TouchableOpacity>

            <Text style={styles.submitNote}>
              Pastikan informasi barang dan kondisi telah sesuai dengan barang asli
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Navigation */}
      <BottomNav activeTab="Jual" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 16,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: COLORS.mutedText,
    marginTop: -6,
    marginBottom: 4,
  },
  photoPlaceholderBox: {
    height: 160,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  photoPlaceholderIcon: {
    fontSize: 34,
  },
  photoPlaceholderText: {
    fontSize: 13,
    color: COLORS.mutedText,
    fontWeight: '500',
  },
  previewContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
    backgroundColor: '#EAEAEA',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  smallButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeButton: {
    backgroundColor: COLORS.lightGreen,
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
  },
  smallButtonText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  removeButton: {
    backgroundColor: '#FDEDEC',
    borderWidth: 1,
    borderColor: COLORS.accentRed,
  },
  removeButtonText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.accentRed,
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  photoActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primaryGreen,
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.25,
        shadowRadius: 2,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  photoActionButtonSecondary: {
    backgroundColor: COLORS.lightGreen,
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  photoActionButtonIcon: {
    fontSize: 16,
  },
  photoActionButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.white,
  },
  photoActionButtonTextSecondary: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorContainer: {
    backgroundColor: '#FDEDEC',
    borderWidth: 1,
    borderColor: COLORS.accentRed,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    color: COLORS.accentRed,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  inputGroup: {
    gap: 6,
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  labelWithPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceFormattedText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  requiredStar: {
    color: COLORS.accentRed,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: COLORS.darkText,
  },
  textArea: {
    height: 96,
    paddingTop: 12,
    paddingBottom: 12,
  },
  chipsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.lightGreen,
    borderColor: COLORS.primaryGreen,
    borderWidth: 1.5,
  },
  categoryChipEmoji: {
    fontSize: 15,
  },
  categoryChipText: {
    fontSize: 12.5,
    color: COLORS.darkText,
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: COLORS.primaryGreen,
    fontWeight: '700',
  },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  conditionChipSelected: {
    backgroundColor: COLORS.lightGreen,
    borderColor: COLORS.primaryGreen,
    borderWidth: 1.5,
  },
  conditionChipText: {
    fontSize: 12,
    color: COLORS.darkText,
    fontWeight: '500',
  },
  conditionChipTextSelected: {
    color: COLORS.primaryGreen,
    fontWeight: '700',
  },
  submitSection: {
    marginTop: 6,
    gap: 8,
  },
  submitButton: {
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primaryGreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 15.5,
    fontWeight: '700',
  },
  submitNote: {
    fontSize: 11.5,
    color: COLORS.mutedText,
    textAlign: 'center',
    lineHeight: 16,
  },
});
