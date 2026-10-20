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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  AUTH_SESSION_KEY,
  AuthSession,
  deleteAuthSession,
  getAuthSession,
  saveAuthSession,
} from '../utils/authStorage';
import { getApiBaseUrl } from '../constants/api';

// Re-export untuk kompatibilitas jika dipanggil modul lain
export { AUTH_SESSION_KEY, deleteAuthSession };
export type { AuthSession };

// Color Palette konsisten dengan Home Week 2 dan Register Week 3
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

export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Membaca session authentication dari storage untuk mendeteksi status sesi
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const session = await getAuthSession();
        if (session) {
          if (session.isLoggedIn === true) {
            // Jika sudah memiliki session aktif, langsung arahkan ke Home
            router.replace('/');
            return;
          }
          if (session.email) {
            setEmail(session.email);
          }
        }
      } catch (error) {
        console.error('Gagal membaca sesi authentication dari storage:', error);
      }
    };

    checkExistingSession();
  }, []);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    // Reset pesan error sebelumnya
    setErrorMessage('');

    // Validasi dasar
    if (!trimmedEmail) {
      setErrorMessage('Email wajib diisi.');
      Alert.alert('Perhatian', 'Email wajib diisi.');
      return;
    }

    if (!password) {
      setErrorMessage('Password wajib diisi.');
      Alert.alert('Perhatian', 'Password wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password minimal 6 karakter.');
      Alert.alert('Perhatian', 'Password minimal 6 karakter.');
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const loginUrl = `${getApiBaseUrl()}/api/auth/login`;
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
        }),
      });

      let responseData: any = null;
      try {
        responseData = await response.json();
      } catch {
        // Jika response bukan JSON valid
      }

      if (response.ok && responseData?.token && responseData?.user) {
        const { token, user } = responseData;

        // Validasi tipe data token dan user dari respons backend
        if (typeof token !== 'string' || !token.trim() || !user.email) {
          throw new Error('Format respons autentikasi tidak valid dari server.');
        }

        // Simpan sesi autentikasi dengan urutan argumen: saveAuthSession(user.email, user.name, token)
        // Password TIDAK disimpan ke session
        await saveAuthSession(user.email, user.name, token);

        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined' && window.alert) {
            window.alert('Login berhasil');
          }
          router.replace('/');
          return;
        }

        Alert.alert('Login berhasil', 'Login berhasil', [
          {
            text: 'OK',
            onPress: () => router.replace('/'),
          },
        ]);
      } else {
        // Ambil pesan error dari respons backend jika tersedia
        const backendMessage =
          typeof responseData?.message === 'string' && responseData.message.trim()
            ? responseData.message.trim()
            : 'Email atau password salah.';

        setErrorMessage(backendMessage);
        Alert.alert('Gagal Masuk', backendMessage);
      }
    } catch (error) {
      console.error('[Login] Terjadi kesalahan saat menghubungi server:', error);
      const networkErrorMessage =
        'Tidak dapat terhubung ke server. Pastikan server backend aktif dan koneksi tersedia.';
      setErrorMessage(networkErrorMessage);
      Alert.alert('Koneksi Gagal', networkErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterPress = () => {
    router.push('/register');
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
          {/* Header Login */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Masuk ke Preloved</Text>
            <Text style={styles.subtitle}>
              Masuk untuk melanjutkan ke akunmu
            </Text>
          </View>

          {/* Form Input */}
          <View style={styles.formContainer}>
            {/* Tampilan Pesan Error Inline jika tidak valid */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Input Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  errorMessage && !email.trim() ? styles.inputError : null,
                ]}
                placeholder="Email"
                placeholderTextColor={COLORS.mutedText}
                value={email}
                onChangeText={(text: string) => {
                  setEmail(text);
                  if (errorMessage) setErrorMessage('');
                }}
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
                style={[
                  styles.input,
                  errorMessage && (!password || password.length < 6)
                    ? styles.inputError
                    : null,
                ]}
                placeholder="Password"
                placeholderTextColor={COLORS.mutedText}
                value={password}
                onChangeText={(text: string) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage('');
                }}
                secureTextEntry={true}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            {/* Tombol Masuk */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.loginButtonText}>Masuk</Text>
              )}
            </TouchableOpacity>

            {/* Teks Belum punya akun? Daftar */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Belum punya akun? </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleRegisterPress}
              >
                <Text style={styles.registerLink}>Daftar</Text>
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
  inputError: {
    borderColor: COLORS.accentRed,
  },
  loginButton: {
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
  loginButtonText: {
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
  registerLink: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
});
