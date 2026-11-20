import * as Location from "expo-location";
import { ProductLocation } from "../types/location";

export type CurrentLocationResult =
  | { success: true; data: ProductLocation }
  | { success: false; message: string };

/** Requests foreground permission, reads one GPS fix, then resolves its address. */
export async function getCurrentProductLocation(): Promise<CurrentLocationResult> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (!permission.granted) {
      return {
        success: false,
        message: permission.canAskAgain
          ? "Izin lokasi belum diberikan. Kamu tetap bisa mengisi lokasi secara manual."
          : "Izin lokasi diblokir. Aktifkan izin lokasi Preloved melalui Pengaturan perangkat.",
      };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    let address = "";
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      const place = results[0];
      if (place) {
        address = [place.district, place.city, place.region]
          .filter((part): part is string => Boolean(part?.trim()))
          .filter((part, index, all) => all.indexOf(part) === index)
          .join(", ");
      }
    } catch (error) {
      // GPS coordinates remain useful even when the geocoding provider is unavailable.
      console.warn("[Location] Reverse geocoding gagal:", error);
    }

    return {
      success: true,
      data: {
        address,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      },
    };
  } catch (error) {
    console.error("[Location] Gagal mengambil lokasi:", error);
    return {
      success: false,
      message:
        "Lokasi tidak dapat diperoleh. Pastikan GPS aktif lalu coba lagi.",
    };
  }
}
