// Shared types for the storefront application

export interface Product {
  _id: string;
  title: string;
  description?: string;
  slug: string;
  images: string[];
  categories: string[];
  featured: boolean;
  tags: string[];
  variants: ProductVariant[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  _id: string;
  sku: string;
  title: string;
  price: number;
  cost: number;
  stock: number;
  attributes?: Record<string, string>;
  images: string[];
  active: boolean;
  recipe: RecipeItem[];
}

export interface RecipeItem {
  ingredientId: string;
  amount: number;
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  product: Product;
  variant: ProductVariant;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  _id: string;
  userId?: string;
  customerEmail: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  billingAddress: Address;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  featured?: boolean;
  inStock?: boolean;
}

export interface ProductListResponse {
  products: Product[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}