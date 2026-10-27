const express = require('express');
const cors = require('cors');
const { PORT } = require('./config/config');
const { initStorage } = require('./services/storageService');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

// Pastikan direktori dan file data awal tersedia
initStorage();

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Preloved REST API is active',
  });
});

// Daftarkan rute modular
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Jalankan server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Preloved REST API server running on http://localhost:${PORT}`);
  console.log(`Endpoint Products: http://localhost:${PORT}/api/products (Protected with JWT)`);
  console.log(`Endpoint Register: http://localhost:${PORT}/api/auth/register`);
  console.log(`Endpoint Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`Endpoint Logout: http://localhost:${PORT}/api/auth/logout (Protected with JWT)`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Server Error] Port ${PORT} sedang digunakan oleh proses lain.`);
  } else {
    console.error('[Server Error]', err);
  }
});

module.exports = app;
