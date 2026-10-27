const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');
const { readUsers, writeUsers, revokeToken } = require('../services/storageService');

// Endpoint POST /api/auth/register untuk pendaftaran pengguna baru
async function register(req, res) {
  try {
    const { name, email, password } = req.body || {};

    // 1. Validasi input wajib ada dan bertipe string
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Nama lengkap wajib diisi.',
      });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Email wajib diisi.',
      });
    }

    // Validasi format email dasar
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim();
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        status: 'error',
        message: 'Format email tidak valid.',
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Password wajib diisi.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password minimal 6 karakter.',
      });
    }

    const trimmedName = name.trim();
    const normalizedEmail = trimmedEmail.toLowerCase();

    // 2. Baca data pengguna dan cek duplikasi email (case-insensitive)
    const users = readUsers();
    const isEmailRegistered = users.some(
      (user) => user.email && user.email.toLowerCase() === normalizedEmail
    );

    if (isEmailRegistered) {
      return res.status(400).json({
        status: 'error',
        message: 'Email sudah terdaftar.',
      });
    }

    // 3. Hash password dengan bcryptjs (salt rounds = 10)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Buat objek pengguna baru dengan id unik
    const newId = users.length > 0 ? Math.max(...users.map((u) => u.id || 0)) + 1 : 1;
    const newUser = {
      id: newId,
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    // 5. Simpan pengguna baru ke users.json
    users.push(newUser);
    writeUsers(users);

    // 6. Kembalikan respons berhasil tanpa password dan tanpa hash password
    return res.status(201).json({
      status: 'success',
      message: 'Registrasi berhasil.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('[Register Error] Gagal memproses registrasi:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server saat memproses registrasi.',
    });
  }
}

// Endpoint POST /api/auth/login untuk autentikasi pengguna menggunakan JWT
async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    // 1. Validasi input wajib ada dan bertipe string
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Email wajib diisi.',
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Password wajib diisi.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Cari akun pengguna berdasarkan email (case-insensitive)
    const users = readUsers();
    const user = users.find(
      (u) => u.email && u.email.toLowerCase() === normalizedEmail
    );

    // 3. Jika pengguna tidak ditemukan, kembalikan 401 Unauthorized tanpa token
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Email atau password salah.',
      });
    }

    // 4. Verifikasi password menggunakan bcrypt.compare terhadap password hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // 5. Jika password tidak cocok, kembalikan 401 Unauthorized tanpa token
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Email atau password salah.',
      });
    }

    // 6. Buat payload JWT hanya berisi identitas pengguna yang aman (tanpa password/hash)
    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    // 7. Buat token JWT dengan masa berlaku 1 jam (1h) menggunakan secret dari environment variable
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

    // 8. Kembalikan respons berhasil beserta token dan data pengguna yang aman
    return res.status(200).json({
      status: 'success',
      message: 'Login berhasil.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('[Login Error] Gagal memproses login:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server saat memproses login.',
    });
  }
}

// Endpoint POST /api/auth/logout untuk mencabut token (Week 5 - Tahap 4)
function logout(req, res) {
  try {
    const token = req.token;

    // Simpan token ke dalam revoked_tokens.json secara persisten
    revokeToken(token, req.user);

    return res.status(200).json({
      status: 'success',
      message: 'Logout berhasil. Token telah dicabut.',
    });
  } catch (error) {
    console.error('[Logout Error] Gagal memproses logout:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server saat memproses logout.',
    });
  }
}

module.exports = {
  register,
  login,
  logout,
};
