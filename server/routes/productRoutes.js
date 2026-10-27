const express = require('express');
const { getProducts } = require('../controllers/productController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Endpoint GET /api/products mengembalikan daftar produk Preloved (dilindungi dengan JWT)
router.get('/', authenticateToken, getProducts);

module.exports = router;
