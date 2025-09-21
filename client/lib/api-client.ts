import { Product, ProductFilters, ProductListResponse, User, AuthResponse, Order, Cart, Address } from '../../shared/types';
import { getMockProducts, getMockProduct, getMockRelatedProducts } from './mock-data';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3000/api';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  // Product endpoints
  async getProducts(filters: ProductFilters & { page?: number; pageSize?: number } = {}): Promise<ProductListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('min', filters.minPrice.toString());
      if (filters.maxPrice) params.append('max', filters.maxPrice.toString());
      if (filters.featured) params.append('featured', 'true');
      if (filters.tags?.length) params.append('tags', filters.tags.join(','));
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

      const queryString = params.toString();
      const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
      
      return await this.request<ProductListResponse>(endpoint);
    } catch (error) {
      // Fallback to mock data if API is not available
      console.warn('API not available, using mock data:', error);
      return getMockProducts(filters);
    }
  }

  async getProduct(slug: string): Promise<{ product: Product }> {
    try {
      return await this.request<{ product: Product }>(`/products/${slug}`);
    } catch (error) {
      console.warn('API not available, using mock data:', error);
      const product = getMockProduct(slug);
      if (!product) throw new Error('Product not found');
      return { product };
    }
  }

  async getRelatedProducts(productId: string): Promise<{ products: Product[] }> {
    try {
      return await this.request<{ products: Product[] }>(`/products/related?productId=${productId}`);
    } catch (error) {
      console.warn('API not available, using mock data:', error);
      return { products: getMockRelatedProducts(productId) };
    }
  }

  // Cart endpoints (future implementation)
  async getCart(): Promise<Cart> {
    return this.request<Cart>('/cart');
  }

  async addToCart(productId: string, variantId: string, quantity: number): Promise<Cart> {
    return this.request<Cart>('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, variantId, quantity }),
    });
  }

  async updateCartItem(lineId: string, quantity: number): Promise<Cart> {
    return this.request<Cart>(`/cart/${lineId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeCartItem(lineId: string): Promise<Cart> {
    return this.request<Cart>(`/cart/${lineId}`, {
      method: 'DELETE',
    });
  }

  // Order endpoints
  async createOrder(orderData: {
    items: Array<{ productId: string; variantId: string; quantity: number }>;
    customerEmail: string;
    shippingAddress: Address;
    billingAddress: Address;
  }): Promise<{ order: Order }> {
    return this.request<{ order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrder(orderId: string): Promise<{ order: Order }> {
    return this.request<{ order: Order }>(`/orders/${orderId}`);
  }

  async getMyOrders(): Promise<{ orders: Order[] }> {
    return this.request<{ orders: Order[] }>('/orders?mine=true');
  }

  // Payment endpoints
  async createPaymentIntent(orderId: string, amount: number): Promise<{ clientSecret: string }> {
    return this.request<{ clientSecret: string }>('/payments', {
      method: 'POST',
      body: JSON.stringify({ 
        provider: 'stripe',
        amount,
        orderId 
      }),
    });
  }

  // Content endpoints (future)
  async getHomeContent(): Promise<any> {
    try {
      return await this.request<any>('/content/home');
    } catch {
      // Return default content if endpoint doesn't exist
      return {
        hero: {
          title: "Premium Coffee Experience",
          subtitle: "Discover our carefully curated selection of the world's finest coffee beans",
          image: "/api/placeholder/1200/400",
          cta: "Shop Now"
        },
        categories: [
          { name: "Single Origin", slug: "single-origin", image: "/api/placeholder/300/200" },
          { name: "Blends", slug: "blends", image: "/api/placeholder/300/200" },
          { name: "Espresso", slug: "espresso", image: "/api/placeholder/300/200" },
          { name: "Accessories", slug: "accessories", image: "/api/placeholder/300/200" }
        ],
        highlights: [
          { icon: 'Truck', title: "Free Shipping", description: "On orders over $50" },
          { icon: 'Shield', title: "Secure Checkout", description: "256-bit SSL encryption" },
          { icon: 'Award', title: "Premium Quality", description: "Ethically sourced beans" },
          { icon: 'Coffee', title: "Expert Roasting", description: "Small batch perfection" }
        ]
      };
    }
  }

  async getPageContent(slug: string): Promise<any> {
    try {
      return await this.request<any>(`/content/pages/${slug}`);
    } catch {
      return null;
    }
  }

  // Customer service
  async submitFeedback(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/cs/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;