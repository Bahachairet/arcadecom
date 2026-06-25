import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Clock, XCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

interface OrderItem {
  id: string;
  title: string;
  unitPrice: string;
  quantity: number;
  product: {
    id: string;
    images: { url: string }[];
  };
}

interface Order {
  id: string;
  status: string;
  total: string;
  createdAt: string;
  items: OrderItem[];
}

const statusUI: Record<string, { icon: React.ReactNode; title: string; color: string; description: string }> = {
  PENDING: {
    icon: <Clock className="h-8 w-8 text-amber-500" />,
    title: 'Order Placed',
    color: 'text-amber-500',
    description: 'Waiting for the seller to confirm your order.',
  },
  COMPLETED: {
    icon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
    title: 'Order Confirmed',
    color: 'text-green-500',
    description: 'Your order has been confirmed by the seller.',
  },
  CANCELLED: {
    icon: <XCircle className="h-8 w-8 text-destructive" />,
    title: 'Order Rejected',
    color: 'text-destructive',
    description: 'This order was rejected by the seller.',
  },
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data.order))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1800px] px-6 py-10">
        <p className="text-muted-foreground">Loading order...</p>
      </div>
    );
  }

  if (!order) return null;

  const ui = statusUI[order.status] || statusUI.COMPLETED;

  return (
    <div className="mx-auto max-w-[1800px] px-6 py-10">
      <Link
        to="/orders"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <div className="flex items-center gap-3 mb-8">
        {ui.icon}
        <div>
          <h1 className="font-display text-3xl font-bold">{ui.title}</h1>
          <p className="text-muted-foreground text-sm">
            Order #{order.id.slice(0, 8)} &middot;{' '}
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
          <p className="text-muted-foreground text-sm mt-1">{ui.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {order.items.map((item) => {
            const price = parseFloat(item.unitPrice);
            const img = item.product?.images[0]?.url;

            return (
              <Card key={item.id}>
                <CardContent className="flex gap-4 p-4">
                  <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    {img ? (
                      <img
                        src={`${API_BASE}${img}`}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                        N/A
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} &middot; ${price.toFixed(2)} each
                    </p>
                    <p className="font-display font-bold mt-1">
                      ${(price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="font-display text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={order.status === 'COMPLETED' ? 'default' : order.status === 'CANCELLED' ? 'destructive' : 'secondary'}>
                  {order.status}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span>{order.items.length}</span>
              </div>
              <div className="border-t border-border pt-4 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-display text-xl font-bold">
                  ${parseFloat(order.total).toFixed(2)}
                </span>
              </div>
              <Button className="w-full" variant="outline" onClick={() => navigate('/products')}>
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
