import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchBuyerOrders,
  selectBuyerOrders,
  selectBuyerLoading,
} from '@/store/slices/ordersSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Clock, CheckCircle2, XCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: React.ReactNode }> = {
  PENDING: { label: 'Awaiting Confirmation', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  COMPLETED: { label: 'Confirmed', variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
  CANCELLED: { label: 'Rejected', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
};

export default function BuyerOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectBuyerOrders);
  const loading = useAppSelector(selectBuyerLoading);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(fetchBuyerOrders());
  }, [user, navigate, dispatch]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1800px] px-6 py-10">
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1800px] px-6 py-10">
      <Link
        to="/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Continue shopping
      </Link>

      <h1 className="font-display text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg mb-4">No orders yet.</p>
          <button className="text-sm underline" onClick={() => navigate('/products')}>
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item) => {
                      const img = item.product?.images[0]?.url;
                      return (
                        <div
                          key={item.id}
                          className="h-12 w-12 rounded-lg overflow-hidden bg-muted border-2 border-background"
                        >
                          {img ? (
                            <img
                              src={`${API_BASE}${img}`}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-[10px]">
                              N/A
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {order.items.map((i) => i.title).join(', ')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''} &middot;{' '}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold">${parseFloat(order.total).toFixed(2)}</p>
                    <Badge variant={statusConfig[order.status]?.variant || 'secondary'} className="text-[10px] mt-1 gap-1">
                      {statusConfig[order.status]?.icon}
                      {statusConfig[order.status]?.label || order.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
