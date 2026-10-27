/**
 * Helper untuk memformat angka harga ke format mata uang Rupiah pada UI.
 * Contoh: 4500000 -> "Rp4.500.000"
 */
export const formatRupiah = (price: number): string => {
  return `Rp${price.toLocaleString('id-ID')}`;
};
