export interface ProductLocation {
  address: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export interface LocationCoordinate {
  latitude: number;
  longitude: number;
}
