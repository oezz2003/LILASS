import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import { ProductFilters } from '../../shared/types';

// Query keys
export const queryKeys = {
  products: (filters?: ProductFilters & { page?: number; pageSize?: number }) => ['products', filters],
  product: (slug: string) => ['product', slug],
  relatedProducts: (productId: string) => ['products', 'related', productId],
  cart: ['cart'],
  orders: (mine?: boolean) => ['orders', { mine }],
  order: (id: string) => ['order', id],
  auth: ['auth', 'me'],
  homeContent: ['content', 'home'],
  pageContent: (slug: string) => ['content', 'page', slug],
} as const;

// Product hooks
export function useProducts(filters: ProductFilters & { page?: number; pageSize?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.products(filters),
    queryFn: () => apiClient.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: queryKeys.product(slug),
    queryFn: () => apiClient.getProduct(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useRelatedProducts(productId: string) {
  return useQuery({
    queryKey: queryKeys.relatedProducts(productId),
    queryFn: () => apiClient.getRelatedProducts(productId),
    enabled: !!productId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Auth hooks
export function useAuth() {
  return useQuery({
    queryKey: queryKeys.auth,
    queryFn: () => apiClient.getMe(),
    retry: false,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiClient.login(email, password),
    onSuccess: (data) => {
      apiClient.setToken(data.token);
      queryClient.setQueryData(queryKeys.auth, { user: data.user });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      apiClient.register(name, email, password),
    onSuccess: (data) => {
      apiClient.setToken(data.token);
      queryClient.setQueryData(queryKeys.auth, { user: data.user });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => Promise.resolve(),
    onSuccess: () => {
      apiClient.setToken(null);
      queryClient.clear();
    },
  });
}

// Cart hooks (for future server-side cart)
export function useCart() {
  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: () => apiClient.getCart(),
    enabled: false, // Will enable when user is authenticated
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, variantId, quantity }: { 
      productId: string; 
      variantId: string; 
      quantity: number; 
    }) => apiClient.addToCart(productId, variantId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

// Order hooks
export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData: {
      items: Array<{ productId: string; variantId: string; quantity: number }>;
      customerEmail: string;
      shippingAddress: any;
      billingAddress: any;
    }) => apiClient.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: queryKeys.order(orderId),
    queryFn: () => apiClient.getOrder(orderId),
    enabled: !!orderId,
  });
}

export function useMyOrders() {
  return useQuery({
    queryKey: queryKeys.orders(true),
    queryFn: () => apiClient.getMyOrders(),
  });
}

// Payment hooks
export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: ({ orderId, amount }: { orderId: string; amount: number }) =>
      apiClient.createPaymentIntent(orderId, amount),
  });
}

// Content hooks
export function useHomeContent() {
  return useQuery({
    queryKey: queryKeys.homeContent,
    queryFn: () => apiClient.getHomeContent(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function usePageContent(slug: string) {
  return useQuery({
    queryKey: queryKeys.pageContent(slug),
    queryFn: () => apiClient.getPageContent(slug),
    enabled: !!slug,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

// Feedback
export function useSubmitFeedback() {
  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      subject: string;
      message: string;
    }) => apiClient.submitFeedback(data),
  });
}