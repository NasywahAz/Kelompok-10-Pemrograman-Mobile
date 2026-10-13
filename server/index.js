const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load environment variables dari file .env jika tersedia (Node.js 20.6+)
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
  } catch {
    // Lewati jika file .env belum dibuat
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi JWT Secret dari environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'preloved_jwt_secret_key_default';
if (!process.env.JWT_SECRET) {
  console.warn('[Warning] Environment variable JWT_SECRET belum diatur. Menggunakan default secret untuk development.');
}

// Path berkas penyimpanan data pengguna (users.json)
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE_PATH = path.join(DATA_DIR, 'users.json');

// Memastikan direktori dan file data pengguna tersedia tanpa menimpa data yang sudah ada
function initUsersStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE_PATH)) {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify([], null, 2), 'utf8');
  }
}

// Helper untuk membaca daftar pengguna dari users.json
function readUsers() {
  initUsersStorage();
  try {
    const rawData = fs.readFileSync(USERS_FILE_PATH, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('[Storage Error] Gagal membaca users.json:', error);
    return [];
  }
}

// Helper untuk menyimpan daftar pengguna ke users.json
function writeUsers(users) {
  initUsersStorage();
  try {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf8');
  } catch (error) {
    console.error('[Storage Error] Gagal menulis ke users.json:', error);
    throw error;
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Data 6 Produk Asli Preloved (Week 2 & Week 4)
const prelovedProducts = [
  {
    id: 1,
    name: 'Laptop ASUS VivoBook',
    price: 4500000,
    location: 'Malang',
    condition: 'Bekas - Sangat Baik',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80',
    category: 'Elektronik',
    tag: null,
  },
  {
    id: 2,
    name: 'iPhone 12 128GB',
    price: 5200000,
    location: 'Malang',
    condition: 'Bekas - Baik',
    image: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=500&q=80',
    category: 'Elektronik',
    tag: null,
  },
  {
    id: 3,
    name: 'Kamera Canon EOS M10',
    price: 3100000,
    location: 'Batu',
    condition: 'Bekas - Sangat Baik',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80',
    category: 'Elektronik',
    tag: null,
  },
  {
    id: 4,
    name: 'Hoodie Oversize',
    price: 120000,
    location: 'Malang',
    condition: 'Bekas - Baik',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80',
    category: 'Fashion',
    tag: 'Promo',
  },
  {
    id: 5,
    name: 'Meja Belajar Minimalis',
    price: 350000,
    location: 'Malang',
    condition: 'Bekas - Baik',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&q=80',
    category: 'Rumah',
    tag: null,
  },
  {
    id: 6,
    name: 'Headphone Wireless',
    price: 275000,
    location: 'Malang',
    condition: 'Bekas - Sangat Baik',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    category: 'Elektronik',
    tag: null,
  },
];

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Preloved REST API is active',
  });
});

// Endpoint GET /api/products mengembalikan 6 produk Preloved
app.get('/api/products', (req, res) => {
  res.json(prelovedProducts);
});

// Endpoint POST /api/auth/register untuk pendaftaran pengguna baru
app.post('/api/auth/register', async (req, res) => {
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
});

// Endpoint POST /api/auth/login untuk autentikasi pengguna menggunakan JWT
app.post('/api/auth/login', async (req, res) => {
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
});

// Jalankan server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Preloved REST API server running on http://localhost:${PORT}`);
  console.log(`Endpoint: http://localhost:${PORT}/api/products`);
  console.log(`Endpoint Register: http://localhost:${PORT}/api/auth/register`);
  console.log(`Endpoint Login: http://localhost:${PORT}/api/auth/login`);
});
