const express = require('express');
const { register, login, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Endpoint POST /api/auth/register untuk pendaftaran pengguna baru
router.post('/register', register);

// Endpoint POST /api/auth/login untuk autentikasi pengguna menggunakan JWT
router.post('/login', login);

// Endpoint POST /api/auth/logout untuk mencabut token (dilindungi dengan JWT)
router.post('/logout', authenticateToken, logout);

module.exports = router;
