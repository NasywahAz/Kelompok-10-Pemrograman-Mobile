import { API_PRODUCTS_URL } from '../constants/api';
import { Product, RawProductPayload } from '../types/product';

export interface FetchProductsResult {
  success: boolean;
  data?: Product[];
  errorMessage?: string;
  isUnauthorized?: boolean;
}

/**
 * Mengambil data produk dari REST API dengan header Authorization Bearer token.
 * Menangani network error, status non-2xx (401, 404, 500+), dan parsing JSON.
 *
 * @param token Token JWT yang valid dari session user
 * @returns FetchProductsResult berisi status keberhasilan, data produk terpetakan, atau pesan error
 */
export async function fetchPrelovedProducts(token: string): Promise<FetchProductsResult> {
  // 1. Ambil data dari REST API endpoint dengan header Authorization Bearer
  let response: Response;
  try {
    response = await fetch(API_PRODUCTS_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (networkError) {
    // Penanganan error koneksi jaringan / server tidak dapat dijangkau
    console.error('Koneksi ke REST API gagal:', networkError);
    return {
      success: false,
      errorMessage:
        'Tidak dapat terhubung ke server. Pastikan server backend aktif dan periksa koneksi internet Anda.',
    };
  }

  // 2. Jika token ditolak oleh server (401: kedaluwarsa, tidak valid, atau telah dicabut)
  if (response.status === 401) {
    return {
      success: false,
      isUnauthorized: true,
      errorMessage: 'Sesi autentikasi telah berakhir. Silakan masuk kembali.',
    };
  }

  // 3. Penanganan HTTP error response (status non-2xx selain 401)
  if (!response.ok) {
    let serverMessage: string | null = null;
    try {
      const errorData = await response.json();
      if (errorData && typeof errorData.message === 'string' && errorData.message.trim()) {
        serverMessage = errorData.message.trim();
      }
    } catch {
      // Abaikan jika respons error server bukan format JSON valid
    }

    if (response.status === 404) {
      // Penanganan HTTP 404 Not Found
      return {
        success: false,
        errorMessage: serverMessage || 'Endpoint atau data produk tidak ditemukan (Error 404).',
      };
    }

    if (response.status >= 500) {
      // Penanganan HTTP 500 dan Server Error lainnya
      return {
        success: false,
        errorMessage:
          serverMessage || `Server sedang bermasalah (Error ${response.status}). Silakan coba beberapa saat lagi.`,
      };
    }

    // Penanganan HTTP error lainnya (misal 400, 403)
    return {
      success: false,
      errorMessage: serverMessage || `Gagal memuat produk dari server (status ${response.status}).`,
    };
  }

  // 4. Parse JSON response menjadi RawProductPayload[]
  let rawData: RawProductPayload[];
  try {
    rawData = await response.json();
  } catch {
    return {
      success: false,
      errorMessage: 'Format data produk dari server tidak valid.',
    };
  }

  // 5. Mapping data mentah ke Data Model Product (Task 1 & Task 2)
  try {
    const mappedProducts: Product[] = Array.isArray(rawData)
      ? rawData.map((item: RawProductPayload) => ({
          id: Number(item.id),
          name: String(item.name),
          price: Number(item.price),
          location: String(item.location),
          condition: String(item.condition),
          category: String(item.category),
          image: String(item.image),
          tag: item.tag ?? null,
        }))
      : [];

    return {
      success: true,
      data: mappedProducts,
    };
  } catch (error) {
    console.error('Terjadi kesalahan tak terduga saat memproses produk:', error);
    return {
      success: false,
      errorMessage: 'Terjadi kesalahan saat memproses data produk.',
    };
  }
}
