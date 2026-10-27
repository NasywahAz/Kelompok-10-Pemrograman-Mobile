// Data Model Product (Task 1)
export interface Product {
  id: number;
  name: string;
  price: number;
  location: string;
  condition: string;
  category: string;
  image: string;
  tag?: string | null;
}

// Interface Payload Data Produk Mentah dari REST API
export interface RawProductPayload {
  id: number;
  name: string;
  price: number;
  location: string;
  condition: string;
  category: string;
  image: string;
  tag?: string | null;
}
