'use client';
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
import { api } from '@/lib/api';
import { WS_EVENTS } from '@repo/shared';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth.store';

interface KitchenOrder {
  id: string;
  orderNumber: string;
  status: string;
  table?: { tableNumber: string };
  items: Array<{ itemName: string; quantity: number; specialNotes?: string }>;
  createdAt: string;
  isNew?: boolean;
}

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();

  const { data: initialOrders } = useQuery({
    queryKey: ['kitchen-orders', user?.restaurantId],
    queryFn: async () => {
      try {
        const res = await api.getOrders();
        const raw = res.data?.data ?? res.data;
        const list = raw?.orders ?? (Array.isArray(raw) ? raw : []);
        return (list as KitchenOrder[]).filter((o) =>
          ['placed', 'accepted', 'preparing', 'ready'].includes(o.status),
        );
      } catch {
        return [];
      }
    },
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (initialOrders && initialOrders.length > 0) {
      setOrders(initialOrders);
    }
  }, [initialOrders]);

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateOrderStatus(id, { status }),
    onSuccess: (_, { id, status }) => {
      setOrders((prev) =>
        status === 'served' || status === 'cancelled'
          ? prev.filter((o) => o.id !== id)
          : prev.map((o) => (o.id === id ? { ...o, status } : o)),
      );
    },
  });

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3001';
    const socket = io(wsUrl + '/kitchen');
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (user?.restaurantId) {
        socket.emit(WS_EVENTS.SUBSCRIBE_ROOM, { restaurantId: user.restaurantId });
      }
    });
    socket.on('disconnect', () => setIsConnected(false));

    socket.on(WS_EVENTS.ORDER_NEW, ({ order }: { order: KitchenOrder }) => {
      setOrders((prev) => [{ ...order, isNew: true }, ...prev]);
      if (soundEnabled) playAlert();
      setTimeout(() => {
        setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, isNew: false } : o)));
      }, 3000);
    });

    socket.on(WS_EVENTS.ORDER_STATUS, ({ orderId, status }: { orderId: string; status: string }) => {
      setOrders((prev) =>
        status === 'served' || status === 'cancelled'
          ? prev.filter((o) => o.id !== orderId)
          : prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
      );
    });

    return () => { socket.disconnect(); };
  }, [soundEnabled, user?.restaurantId]);

  const playAlert = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA');
      void audio.play();
    } catch { /* Ignore */ }
  };

  const NEXT: Record<string, string> = {
    placed: 'accepted',
    accepted: 'preparing',
    preparing: 'ready',
    ready: 'served',
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kitchen Display</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-gray-400 hover:text-white">
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <div className="flex items-center gap-2">
            {isConnected ? <Wifi size={16} className="text-green-400" /> : <WifiOff size={16} className="text-red-400" />}
            <span className={`text-sm ${ isConnected ? 'text-green-400' : 'text-red-400' }`}>
              {isConnected ? 'Live' : 'Reconnecting...'}
            </span>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <div className="text-6xl mb-4">🍳</div>
          <p>No active orders. Waiting...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`bg-gray-800 rounded-xl p-4 border-2 transition-all ${
                order.isNew ? 'border-yellow-400 pulse-new' :
                order.status === 'placed' ? 'border-blue-500' :
                order.status === 'accepted' ? 'border-orange-500' :
                order.status === 'preparing' ? 'border-yellow-500' :
                'border-green-500'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">{order.orderNumber}</h3>
                {order.table && (
                  <Badge variant="secondary">Table {order.table.tableNumber}</Badge>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item, i) => (
                  <div key={i}>
                    <p className="font-medium">{item.quantity}× {item.itemName}</p>
                    {item.specialNotes && (
                      <p className="text-xs text-yellow-300 mt-0.5">⚠ {item.specialNotes}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                {NEXT[order.status] && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white border-none"
                    onClick={() => updateStatus.mutate({ id: order.id, status: NEXT[order.status] ?? '' })}
                    loading={updateStatus.isPending}
                  >
                    ✓ {NEXT[order.status]?.charAt(0).toUpperCase()}{NEXT[order.status]?.slice(1)}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
