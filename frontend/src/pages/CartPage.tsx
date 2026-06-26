import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectCart,
  selectItemCount,
  selectCartTotal,
  selectCartLoading,
  updateCartItem,
  removeCartItem,
  clearCartItems,
  clearCartLocally,
} from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Coins } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';

const API_BASE = 'http://localhost:5000';

export default function CartPage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCart);
  const itemCount = useAppSelector(selectItemCount);
  const total = useAppSelector(selectCartTotal);
  const loading = useAppSelector(selectCartLoading);
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await api.post('/orders/checkout');
      dispatch(clearCartLocally());
      navigate(`/orders/${res.data.order.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1800px]">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/products" className="inline-flex items-center gap-1 text-sm text-link hover:underline">
              <ArrowLeft className="h-4 w-4" /> Continue shopping
            </Link>
          </div>
        </div>

        {/* Title bar */}
        <div className="bg-canvas border-2 border-ink border-b-0 px-4 py-2 flex items-center justify-between">
          <span className="font-bold uppercase text-sm flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" /> Shopping Cart{itemCount > 0 && ` (${itemCount})`}
          </span>
        </div>

        {!cart || cart.items.length === 0 ? (
          <div className="bg-canvas border-2 border-ink px-4 py-20 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4" />
            <p className="mb-4">Your cart is empty.</p>
            <Button onClick={() => navigate('/products')} className="rounded-none border-2 border-ink bg-ink text-canvas font-bold uppercase">
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-0">
            {/* Cart Items */}
            <div className="border-2 border-ink bg-canvas divide-y-2 divide-ink">
              {cart.items.map((item) => {
                const price = parseFloat(item.product.price);
                const img = item.product.images[0]?.url;

                return (
                  <div key={item.id} className="flex gap-4 p-4">
                    {/* Thumbnail */}
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden border-2 border-ink bg-muted">
                      {img ? (
                        <img src={`${API_BASE}${img}`} alt={item.product.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">N/A</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-heading font-bold text-sm uppercase truncate">{item.product.title}</h3>
                          <p className="text-xs text-muted-foreground">by {item.product.seller.displayName}</p>
                          <span className="inline-block mt-1 text-[10px] font-bold uppercase border border-ink px-1.5 py-0.5">{item.product.type}</span>
                        </div>
                        <p className="font-heading font-bold whitespace-nowrap">${(price * item.quantity).toFixed(2)}</p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-none border-2 border-ink"
                            disabled={loading}
                            onClick={() => dispatch(updateCartItem({ itemId: item.id, quantity: item.quantity - 1 }))}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-bold w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-none border-2 border-ink"
                            disabled={loading || item.quantity >= item.product.stock}
                            onClick={() => dispatch(updateCartItem({ itemId: item.id, quantity: item.quantity + 1 }))}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          disabled={loading}
                          onClick={() => dispatch(removeCartItem(item.id))}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Clear cart */}
              <div className="p-4">
                <Button
                  variant="outline"
                  onClick={() => dispatch(clearCartItems())}
                  disabled={loading}
                  className="rounded-none border-2 border-ink bg-canvas text-ink font-bold uppercase text-xs"
                >
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary — sticky sidebar */}
            <div className="border-2 border-l-0 border-ink bg-canvas lg:sticky lg:top-0 lg:self-start">
              <div className="bg-tint-lime border-b-2 border-ink px-4 py-2">
                <span className="font-bold uppercase text-sm">Order Summary</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-bold uppercase">Items</span>
                  <span>{itemCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold uppercase">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t-2 border-ink pt-3 flex justify-between">
                  <span className="font-bold uppercase">Total</span>
                  <span className="font-heading text-xl font-bold">${total.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full rounded-none border-2 border-ink bg-ink text-canvas font-bold uppercase"
                  size="lg"
                  disabled={loading || checkingOut}
                  onClick={handleCheckout}
                >
                  <Coins className="mr-2 h-4 w-4" />
                  {checkingOut ? 'Processing...' : 'Insert Coin'}
                </Button>
                <p className="text-[11px] text-muted-foreground text-center">
                  No payment gateway connected yet. This will create the order directly.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
