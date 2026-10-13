const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Jalankan server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Preloved REST API server running on http://localhost:${PORT}`);
  console.log(`Endpoint: http://localhost:${PORT}/api/products`);
  console.log(`Endpoint Register: http://localhost:${PORT}/api/auth/register`);
});
