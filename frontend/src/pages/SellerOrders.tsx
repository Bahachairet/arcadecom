import { useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchSellerOrders,
  acceptOrder,
  rejectOrder,
  selectSellerOrders,
  selectSellerLoading,
  selectSellerPagination,
  selectOrderActionLoading,
} from '@/store/slices/ordersSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: React.ReactNode }> = {
  PENDING: { label: 'Pending', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  COMPLETED: { label: 'Confirmed', variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
  CANCELLED: { label: 'Rejected', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
};

export default function SellerOrders() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectSellerOrders);
  const loading = useAppSelector(selectSellerLoading);
  const pagination = useAppSelector(selectSellerPagination);
  const actionLoading = useAppSelector(selectOrderActionLoading);

  const fetchOrders = useCallback(
    (page: number) => {
      if (!user || user.role === 'buyer') return;
      dispatch(fetchSellerOrders({ page, limit: 10 }));
    },
    [user, dispatch]
  );

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const handleAccept = (orderId: string) => {
    dispatch(acceptOrder(orderId));
  };

  const handleReject = (orderId: string) => {
    if (!confirm('Reject this order? Stock will be restored.')) return;
    dispatch(rejectOrder(orderId));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  const totalRevenue = orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce(
      (sum, order) =>
        sum + order.items.reduce((s, item) => s + parseFloat(item.unitPrice) * item.quantity, 0),
      0
    );

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="font-display text-2xl font-bold">{pagination.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Revenue (Confirmed)</p>
            <p className="font-display text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Items Sold</p>
            <p className="font-display text-2xl font-bold">
              {orders
                .filter((o) => o.status === 'COMPLETED')
                .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">No orders yet.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium">
                        {order.user?.displayName} &middot;{' '}
                        <span className="text-muted-foreground">{order.user?.email}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Order #{order.id.slice(0, 8)} &middot;{' '}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusConfig[order.status]?.variant || 'secondary'} className="gap-1">
                        {statusConfig[order.status]?.icon}
                        {statusConfig[order.status]?.label || order.status}
                      </Badge>
                      {order.status === 'PENDING' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                            disabled={actionLoading === order.id}
                            onClick={() => handleAccept(order.id)}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={actionLoading === order.id}
                            onClick={() => handleReject(order.id)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item) => {
                      const img = item.product?.images[0]?.url;
                      return (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
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
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity} &middot; ${parseFloat(item.unitPrice).toFixed(2)}{' '}
                              each
                            </p>
                          </div>
                          <p className="font-display font-bold text-sm">
                            ${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-border mt-3 pt-3 flex justify-between">
                    <span className="text-sm text-muted-foreground">Order total</span>
                    <span className="font-display font-bold">${parseFloat(order.total).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} &middot; {pagination.total} orders
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchOrders(pagination.page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchOrders(pagination.page + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
