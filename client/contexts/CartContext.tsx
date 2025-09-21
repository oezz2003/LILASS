import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartItem, Product, ProductVariant } from '../../shared/types';

// Cart state type
interface CartState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}

// Cart actions
type CartAction = 
  | { type: 'ADD_ITEM'; payload: { product: Product; variant: ProductVariant; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; variantId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; variantId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

// Context type
interface CartContextType {
  cart: CartState;
  addItem: (product: Product, variant: ProductVariant, quantity: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string, variantId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Calculate cart totals
function calculateTotals(items: CartItem[]): Pick<CartState, 'subtotal' | 'tax' | 'shipping' | 'total' | 'itemCount'> {
  const subtotal = items.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Simple tax calculation (8.5%)
  const tax = subtotal * 0.085;
  
  // Free shipping over $50, otherwise $5.99
  const shipping = subtotal >= 50 ? 0 : 5.99;
  
  const total = subtotal + tax + shipping;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    total: Math.round(total * 100) / 100,
    itemCount
  };
}

// Initial cart state
const initialCartState: CartState = {
  items: [],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  total: 0,
  itemCount: 0
};

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, variant, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.productId === product._id && item.variantId === variant._id
      );

      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          productId: product._id,
          variantId: variant._id,
          quantity,
          product,
          variant
        };
        newItems = [...state.items, newItem];
      }

      const totals = calculateTotals(newItems);
      return { ...state, items: newItems, ...totals };
    }

    case 'REMOVE_ITEM': {
      const { productId, variantId } = action.payload;
      const newItems = state.items.filter(
        item => !(item.productId === productId && item.variantId === variantId)
      );
      
      const totals = calculateTotals(newItems);
      return { ...state, items: newItems, ...totals };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, variantId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { productId, variantId } });
      }

      const newItems = state.items.map(item =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity }
          : item
      );

      const totals = calculateTotals(newItems);
      return { ...state, items: newItems, ...totals };
    }

    case 'CLEAR_CART': {
      return initialCartState;
    }

    case 'LOAD_CART': {
      return action.payload;
    }

    default:
      return state;
  }
}

// Cart provider component
interface CartProviderProps {
  children: React.ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart: CartState = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addItem = (product: Product, variant: ProductVariant, quantity: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, variant, quantity } });
  };

  const removeItem = (productId: string, variantId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, variantId } });
  };

  const updateQuantity = (productId: string, variantId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, variantId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemQuantity = (productId: string, variantId: string): number => {
    const item = cart.items.find(
      item => item.productId === productId && item.variantId === variantId
    );
    return item?.quantity || 0;
  };

  const contextValue: CartContextType = {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;