import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// Color Palette konsisten dengan Home Week 2
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

export default function RegisterScreen() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Perhatian', 'Nama lengkap wajib diisi.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Perhatian', 'Email wajib diisi.');
      return;
    }

    if (!password) {
      Alert.alert('Perhatian', 'Password wajib diisi.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Perhatian', 'Password minimal 6 karakter.');
      return;
    }

    try {
      const registeredUser = {
        name: name.trim(),
        email: email.trim(),
        password,
      };
      await SecureStore.setItemAsync(
        'preloved_registered_user',
        JSON.stringify(registeredUser)
      );
    } catch (error) {
      console.error('Gagal menyimpan pendaftaran ke SecureStore:', error);
    }

    // Registrasi berhasil (tahap awal sebelum integrasi Secure Storage)
    Alert.alert('Berhasil', 'Registrasi berhasil', [
      { text: 'OK', onPress: () => router.push('/login') },
    ]);
  };

  const handleLoginPress = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Register */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Daftar Akun</Text>
            <Text style={styles.subtitle}>
              Masukkan data untuk membuat akun Preloved
            </Text>
          </View>

          {/* Form Input */}
          <View style={styles.formContainer}>
            {/* Input Nama Lengkap */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama Lengkap</Text>
              <TextInput
                style={styles.input}
                placeholder="Nama Lengkap"
                placeholderTextColor={COLORS.mutedText}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* Input Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.mutedText}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Input Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.mutedText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
            </View>

            {/* Tombol Daftar */}
            <TouchableOpacity
              style={styles.registerButton}
              activeOpacity={0.8}
              onPress={handleRegister}
            >
              <Text style={styles.registerButtonText}>Daftar</Text>
            </TouchableOpacity>

            {/* Teks Sudah punya akun? Masuk */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Sudah punya akun? </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={handleLoginPress}>
                <Text style={styles.loginLink}>Masuk</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  headerContainer: {
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.mutedText,
    lineHeight: 20,
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: COLORS.darkText,
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
  registerButton: {
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primaryGreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  footerText: {
    fontSize: 13.5,
    color: COLORS.mutedText,
  },
  loginLink: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
});
