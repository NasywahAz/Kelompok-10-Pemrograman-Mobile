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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  AUTH_SESSION_KEY,
  AuthSession,
  deleteAuthSession,
  getAuthSession,
  getRegisteredUser,
  saveAuthSession,
} from '../utils/authStorage';

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

// Dummy Credential untuk demonstrasi Week 3
const DUMMY_CREDENTIALS = {
  name: 'Pengguna Preloved',
  email: 'test@preloved.com',
  password: '123456',
};

export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

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

    // Pengecekan kredensial (dummy credential atau akun yang didaftarkan lewat register.tsx)
    let isValid = false;
    let userName = '';

    if (
      trimmedEmail.toLowerCase() === DUMMY_CREDENTIALS.email.toLowerCase() &&
      password === DUMMY_CREDENTIALS.password
    ) {
      isValid = true;
      userName = DUMMY_CREDENTIALS.name;
    } else {
      try {
        const registeredUser = await getRegisteredUser();
        if (
          registeredUser &&
          registeredUser.email &&
          registeredUser.email.toLowerCase() === trimmedEmail.toLowerCase() &&
          registeredUser.password === password
        ) {
          isValid = true;
          userName = registeredUser.name;
        }
      } catch (error) {
        console.error('Gagal memeriksa akun terdaftar dari storage:', error);
      }
    }

    if (isValid) {
      try {
        // Simpan status/session authentication secara aman dan kompatibel (Web: localStorage, Mobile: SecureStore)
        // Password TIDAK disimpan ke session
        await saveAuthSession(trimmedEmail, userName);

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
      } catch (error) {
        console.error('Gagal menyimpan session ke storage:', error);
        Alert.alert('Error', 'Gagal menyimpan session authentication.');
      }
    } else {
      setErrorMessage('Email atau password salah.');
      Alert.alert('Gagal Masuk', 'Email atau password salah.');
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
              style={styles.loginButton}
              activeOpacity={0.8}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Masuk</Text>
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
