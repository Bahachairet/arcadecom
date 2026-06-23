import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface CartProduct {
  id: string;
  title: string;
  price: string;
  type: string;
  stock: number;
  images: { url: string }[];
  seller: { id: string; displayName: string };
}

interface CartItem {
  id: string;
  quantity: number;
  product: CartProduct;
}

interface Cart {
  id: string;
  items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  total: number;
  loading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  clearLocalCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const visibleCart = user ? cart : null;

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadCart = async () => {
      setLoading(true);
      try {
        const res = await api.get('/cart');
        if (!cancelled) setCart(res.data.cart);
      } catch {
        if (!cancelled) setCart(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadCart();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const refreshCart = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/cart');
      setCart(res.data.cart);
    } catch {
      setCart(null);
    }
  }, [user]);

  const addItem = async (productId: string, quantity = 1) => {
    setLoading(true);
    try {
      const res = await api.post('/cart/items', { productId, quantity });
      setCart(res.data.cart);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    setLoading(true);
    try {
      const res = await api.patch(`/cart/items/${itemId}`, { quantity });
      setCart(res.data.cart);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    setLoading(true);
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      setCart(res.data.cart);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      const res = await api.delete('/cart');
      setCart(res.data.cart);
    } finally {
      setLoading(false);
    }
  };

  const clearLocalCart = () => setCart(null);

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const total =
    cart?.items.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart: visibleCart, itemCount, total, loading, addItem, updateQuantity, removeItem, clearCart, clearLocalCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
