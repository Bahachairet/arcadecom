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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    <div className="mx-auto max-w-[1800px] px-6 py-10">
      <Link
        to="/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Continue shopping
      </Link>

      <h1 className="font-display text-3xl font-bold mb-8">Your Cart</h1>

      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg mb-4">Your cart is empty.</p>
          <Button onClick={() => navigate('/products')}>Browse Products</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => {
              const price = parseFloat(item.product.price);
              const img = item.product.images[0]?.url;

              return (
                <Card key={item.id}>
                  <CardContent className="flex gap-4 p-4">
                    <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      {img ? (
                        <img
                          src={`${API_BASE}${img}`}
                          alt={item.product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                          N/A
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-sm truncate">{item.product.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            by {item.product.seller.displayName}
                          </p>
                          <Badge variant="outline" className="mt-1 text-[10px]">
                            {item.product.type}
                          </Badge>
                        </div>
                        <p className="font-display font-bold whitespace-nowrap">
                          ${(price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            disabled={loading}
                            onClick={() => dispatch(updateCartItem({ itemId: item.id, quantity: item.quantity - 1 }))}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
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
                  </CardContent>
                </Card>
              );
            })}

            <Button variant="outline" onClick={() => dispatch(clearCartItems())} disabled={loading}>
              Clear Cart
            </Button>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="font-display text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items ({itemCount})</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-display text-xl font-bold">${total.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full"
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
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
