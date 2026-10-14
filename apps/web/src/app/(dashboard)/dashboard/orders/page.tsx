'use client';
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { WS_EVENTS, OrderStatus } from '@repo/shared';
import { useAuthStore } from '@/store/auth.store';

const STATUS_COLUMNS: OrderStatus[] = [
  OrderStatus.PLACED,
  OrderStatus.ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
];

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'success' | 'secondary' | 'destructive'> = {
  placed: 'default',
  accepted: 'warning',
  preparing: 'secondary',
  ready: 'success',
  served: 'success',
  cancelled: 'destructive',
};

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['orders', 'live', user?.restaurantId],
    queryFn: async () => {
      const res = await api.getOrders({ limit: 50 });
      const raw = res.data?.data ?? res.data;
      if (raw && typeof raw === 'object' && 'orders' in raw) {
        return raw as { orders: unknown[] };
      }
      return { orders: Array.isArray(raw) ? raw : [] };
    },
    refetchInterval: 15000,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateOrderStatus(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3001';
    const socket: Socket = io(wsUrl + '/kitchen');
    socket.on('connect', () => {
      if (user?.restaurantId) {
        socket.emit(WS_EVENTS.SUBSCRIBE_ROOM, { restaurantId: user.restaurantId });
      }
    });
    socket.on(WS_EVENTS.ORDER_NEW, () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    });
    socket.on(WS_EVENTS.ORDER_STATUS, () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    });
    return () => { socket.disconnect(); };
  }, [queryClient, user?.restaurantId]);

  const orders = (data?.orders ?? []) as Array<{
    id: string; orderNumber: string; status: string;
    totalAmount: number; table?: { tableNumber: string };
    items: Array<{ itemName: string; quantity: number }>;
    createdAt: string;
  }>;

  const NEXT_STATUS: Record<string, string> = {
    placed: 'accepted',
    accepted: 'preparing',
    preparing: 'ready',
    ready: 'served',
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Live Orders</h1>
          <p className="text-muted-foreground text-sm">Real-time order board</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-muted-foreground">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
        {STATUS_COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col);
          return (
            <div key={col} className="bg-muted/50 rounded-xl p-3 min-h-[200px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm capitalize">{col.replace('_', ' ')}</h3>
                <Badge variant={STATUS_COLORS[col] ?? 'default'}>{colOrders.length}</Badge>
              </div>
              <div className="space-y-2">
                {colOrders.map((order) => (
                  <div key={order.id} className="bg-card rounded-lg p-3 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm">{order.orderNumber}</span>
                      {order.table && <span className="text-xs text-muted-foreground">T{order.table.tableNumber}</span>}
                    </div>
                    <div className="space-y-0.5 mb-3">
                      {order.items.slice(0, 3).map((item, i) => (
                        <p key={i} className="text-xs text-muted-foreground">{item.quantity}× {item.itemName}</p>
                      ))}
                      {order.items.length > 3 && <p className="text-xs text-muted-foreground">+{order.items.length - 3} more</p>}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">₹{Number(order.totalAmount).toFixed(0)}</span>
                      {NEXT_STATUS[order.status] && (
                        <Button
                          size="sm"
                          onClick={() => updateStatus.mutate({ id: order.id, status: NEXT_STATUS[order.status] ?? '' })}
                          loading={updateStatus.isPending}
                          className="text-xs h-7 px-2"
                        >
                          → {NEXT_STATUS[order.status]}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {colOrders.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-8">No orders</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
