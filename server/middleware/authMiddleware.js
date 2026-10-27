const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');
const { isTokenRevoked } = require('../services/storageService');

// Middleware Autentikasi JWT (Week 5 - Tahap 3 & 4)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  // 1. Tolak jika header Authorization tidak disediakan
  if (!authHeader) {
    return res.status(401).json({
      status: 'error',
      message: 'Akses ditolak. Header Authorization tidak ditemukan.',
    });
  }

  // 2. Validasi format Bearer <token>
  const parts = authHeader.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      status: 'error',
      message: 'Format token tidak valid. Gunakan format: Bearer <token>.',
    });
  }

  const token = parts[1];
  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Akses ditolak. Token tidak boleh kosong.',
    });
  }

  // 3. Verifikasi token menggunakan secret dan konfigurasi yang sama dengan endpoint login
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token telah kedaluwarsa. Silakan login kembali.',
        });
      }
      return res.status(401).json({
        status: 'error',
        message: 'Token tidak valid atau tanda tangan digital tidak cocok.',
      });
    }

    // 4. Periksa apakah token telah dicabut (revoked / logout)
    if (isTokenRevoked(token)) {
      return res.status(401).json({
        status: 'error',
        message: 'Akses ditolak. Token telah dicabut (logout). Silakan login kembali.',
      });
    }

    // 5. Simpan token dan data pengguna yang terverifikasi ke dalam request (bukan dari request body)
    req.token = token;
    req.user = decoded;
    next();
  });
}

module.exports = {
  authenticateToken,
};
