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

// Controller untuk mengambil daftar produk
function getProducts(req, res) {
  res.json(prelovedProducts);
}

module.exports = {
  getProducts,
  prelovedProducts,
};
