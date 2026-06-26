import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectCart,
  selectItemCount,
  selectCartTotal,
  selectCartLoading,
  updateCartItem,
  removeCartItem,
} from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Minus, Trash2, X, Maximize2 } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCart);
  const itemCount = useAppSelector(selectItemCount);
  const total = useAppSelector(selectCartTotal);
  const loading = useAppSelector(selectCartLoading);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Scrim */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md border-l-2 border-ink flex flex-col animate-in slide-in-from-right duration-200" style={{ backgroundColor: '#ffffff', opacity: 1 }}>
        {/* Header */}
        <div className="border-b-2 border-ink px-4 py-3 flex items-center justify-between">
          <span className="font-heading font-bold uppercase text-sm">
            Shopping Cart{itemCount > 0 && ` (${itemCount})`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onClose(); navigate('/cart'); }}
              className="border-2 border-ink p-1.5 hover:bg-ink hover:text-canvas transition-colors"
              title="Expand to full page"
            >
              <Maximize2 className="h-3 w-3" />
            </button>
            <button
              onClick={onClose}
              className="border-2 border-ink p-1.5 hover:bg-ink hover:text-canvas transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Items */}
        {!cart || cart.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <p className="text-muted-foreground mb-4">Your cart is empty.</p>
            <Button
              onClick={() => { onClose(); navigate('/products'); }}
              className="rounded-none border-2 border-ink bg-ink text-canvas font-bold uppercase"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <>
            {/* Line items */}
            <div className="flex-1 overflow-y-auto divide-y-2 divide-ink">
              {cart.items.map((item) => {
                const price = parseFloat(item.product.price);
                const img = item.product.images[0]?.url;

                return (
                  <div key={item.id} className="flex gap-3 p-4">
                    {/* Thumb */}
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden border-2 border-ink bg-muted">
                      {img ? (
                        <img src={`${API_BASE}${img}`} alt={item.product.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-[10px]">N/A</div>
                      )}
                    </div>

                    {/* Name / variant / qty + price */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-heading font-bold text-xs uppercase truncate">{item.product.title}</h3>
                          <p className="text-[10px] text-muted-foreground">{item.product.type}</p>
                        </div>
                        <p className="font-heading font-bold text-sm whitespace-nowrap">${(price * item.quantity).toFixed(2)}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Qty controls */}
                        <div className="flex items-center gap-1">
                          <button
                            className="border border-ink w-5 h-5 flex items-center justify-center hover:bg-muted text-xs"
                            disabled={loading}
                            onClick={() => dispatch(updateCartItem({ itemId: item.id, quantity: item.quantity - 1 }))}
                          >
                            <Minus className="h-2.5 w-2.5" />
                          </button>
                          <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                          <button
                            className="border border-ink w-5 h-5 flex items-center justify-center hover:bg-muted text-xs"
                            disabled={loading || item.quantity >= item.product.stock}
                            onClick={() => dispatch(updateCartItem({ itemId: item.id, quantity: item.quantity + 1 }))}
                          >
                            <Plus className="h-2.5 w-2.5" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          className="text-xs text-link hover:underline"
                          disabled={loading}
                          onClick={() => dispatch(removeCartItem(item.id))}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer — subtotal + checkout + continue */}
            <div className="border-t-2 border-ink p-4 space-y-3">
              {/* Subtotal */}
              <div className="flex justify-between">
                <span className="font-bold uppercase text-sm">Subtotal</span>
                <span className="font-heading text-lg font-bold">${total.toFixed(2)}</span>
              </div>

              {/* Checkout */}
              <Button
                className="w-full rounded-none border-2 border-ink bg-ink text-canvas font-bold uppercase"
                size="lg"
                disabled={loading}
                onClick={() => { onClose(); navigate('/cart'); }}
              >
                Checkout
              </Button>

              {/* Continue shopping */}
              <button
                className="w-full text-center text-sm text-link hover:underline"
                onClick={() => { onClose(); navigate('/products'); }}
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
