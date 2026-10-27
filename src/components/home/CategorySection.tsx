import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CATEGORIES } from '../../constants/categories';
import { COLORS } from '../../constants/colors';

export interface CategorySectionProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryName: string | null) => void;
}

const PADDING = 12;

export function CategorySection({
  selectedCategory,
  onSelectCategory,
}: CategorySectionProps) {
  return (
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
                onSelectCategory(isSelected ? null : cat.name);
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
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkText,
    paddingHorizontal: PADDING,
    marginBottom: 10,
  },
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
});
