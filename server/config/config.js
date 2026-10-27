const path = require('path');

// Load environment variables dari file .env jika tersedia (Node.js 20.6+)
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
  } catch {
    // Lewati jika file .env belum dibuat
  }
}

const PORT = process.env.PORT || 3000;

// Konfigurasi JWT Secret dari environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'preloved_jwt_secret_key_default';
if (!process.env.JWT_SECRET) {
  console.warn('[Warning] Environment variable JWT_SECRET belum diatur. Menggunakan default secret untuk development.');
}

// Path berkas penyimpanan data pengguna (users.json) dan token dicabut (revoked_tokens.json)
const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE_PATH = path.join(DATA_DIR, 'users.json');
const REVOKED_TOKENS_FILE_PATH = path.join(DATA_DIR, 'revoked_tokens.json');

module.exports = {
  PORT,
  JWT_SECRET,
  DATA_DIR,
  USERS_FILE_PATH,
  REVOKED_TOKENS_FILE_PATH,
};
