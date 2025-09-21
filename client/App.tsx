import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
// Admin pages
import Overview from "./pages/Overview";
import Stock from "./pages/Stock";
import Finance from "./pages/Finance";
import CustomerService from "./pages/CustomerService";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Store from "./pages/Store";
// Storefront pages
import Home from "./pages/storefront/Home";
import Products from "./pages/storefront/Products";
import ProductDetail from "./pages/storefront/ProductDetail";
import Cart from "./pages/storefront/Cart";
import Checkout from "./pages/storefront/Checkout";
import OrderConfirmation from "./pages/storefront/OrderConfirmation";
import Account from "./pages/storefront/Account";
import Auth from "./pages/storefront/Auth";
import About from "./pages/storefront/About";
import Contact from "./pages/storefront/Contact";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Storefront routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders/:id" element={<OrderConfirmation />} />
          <Route path="/account" element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          } />
          <Route path="/auth" element={
            <ProtectedRoute requireAuth={false} fallbackPath="/account">
              <Auth />
            </ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin" element={<Login />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/customer-service" element={<CustomerService />} />
          <Route path="/store" element={<Store />} />
          
          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

createRoot(document.getElementById("root")!).render(<App />);
