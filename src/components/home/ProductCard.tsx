import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { Product } from '../../types/product';
import { formatRupiah } from '../../utils/format';

export interface ProductCardProps {
  product: Product;
  cardWidth?: number;
  onPress?: (product: Product) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PADDING = 12;
const GAP = 10;
const DEFAULT_CARD_WIDTH = Math.floor((SCREEN_WIDTH - PADDING * 2 - GAP) / 2);

export function ProductCard({
  product,
  cardWidth,
  onPress,
}: ProductCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress(product);
    } else {
      Alert.alert(
        product.name,
        `Harga: ${formatRupiah(product.price)}\nLokasi: ${product.location}\nKondisi: ${product.condition}`
      );
    }
  };

  return (
    <TouchableOpacity
      style={[styles.productCard, { width: cardWidth ?? DEFAULT_CARD_WIDTH }]}
      activeOpacity={0.85}
      onPress={handlePress}
    >
      {/* Gambar Produk */}
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: product.image }} style={styles.cardImage} />
        {/* Accent Red Badge jika ada Promo/Highlight */}
        {product.tag && (
          <View style={styles.accentBadge}>
            <Text style={styles.accentBadgeText}>{product.tag}</Text>
          </View>
        )}
      </View>

      {/* Detail Produk */}
      <View style={styles.cardDetails}>
        {/* Nama Produk (maksimal 2 baris) */}
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Harga (Informasi Paling Menonjol) */}
        <Text style={styles.productPrice}>{formatRupiah(product.price)}</Text>

        {/* Kondisi Badge */}
        <View style={styles.conditionBadge}>
          <Text style={styles.conditionBadgeText}>{product.condition}</Text>
        </View>

        {/* Lokasi */}
        <View style={styles.locationRow}>
          <Text style={styles.locationPin}>📍</Text>
          <Text style={styles.locationText}>{product.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  productCard: {
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
});
