'use client';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ShoppingBag, Clock, CheckCircle2, AlertCircle, Utensils,
  Plus, Check, X, ArrowRight, ShieldCheck, Banknote, CreditCard
} from 'lucide-react';
import { multiTenantEngine } from '@/lib/multi-tenant-engine';

const STATUS_COLUMNS = [
  { id: 'placed', label: 'New Placed', badge: 'default', next: 'accepted', actionLabel: 'Accept Order' },
  { id: 'accepted', label: 'Accepted', badge: 'warning', next: 'preparing', actionLabel: 'Start Cooking' },
  { id: 'preparing', label: 'In Kitchen', badge: 'secondary', next: 'ready', actionLabel: 'Mark Ready' },
  { id: 'ready', label: 'Ready to Serve', badge: 'success', next: 'served', actionLabel: 'Mark Served' },
];

export default function OrdersPage() {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const activeRestaurant = multiTenantEngine.getActiveRestaurant();

  const { data, refetch } = useQuery({
    queryKey: ['orders', 'live', activeRestaurant.id],
    queryFn: async () => {
      try {
        const res = await api.getOrders({ limit: 50 });
        const raw = res.data?.data ?? res.data;
        if (raw && typeof raw === 'object' && 'orders' in raw) {
          return raw as { orders: any[] };
        }
        return { orders: Array.isArray(raw) ? raw : [] };
      } catch {
        return { orders: multiTenantEngine.getOrders() };
      }
    },
    refetchInterval: 5000,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateOrderStatus(id, { status }),
    onSuccess: () => void refetch(),
  });

  const cancelOrder = useMutation({
    mutationFn: (id: string) => api.cancelOrder(id),
    onSuccess: () => void refetch(),
  });

  const createQuickOrder = useMutation({
    mutationFn: () => {
      const dishes = activeRestaurant.dishes;
      const d1 = dishes[0] || { id: 'd-1', name: 'Chef Special' };
      const d2 = dishes[1] || dishes[0] || { id: 'd-2', name: 'Artisan Side' };
      return api.placeOrder({
        orderType: 'dine_in',
        tableNumber: `Table ${Math.floor(Math.random() * activeRestaurant.tableCount) + 1}`,
        paymentMethod: 'counter',
        specialNotes: 'Table dining walk-in order',
        items: [
          { itemId: d1.id, quantity: 1 },
          { itemId: d2.id, quantity: 2 },
        ],
      });
    },
    onSuccess: () => void refetch(),
  });

  const rawOrders = (data?.orders ?? []) as Array<{
    id: string;
    orderNumber: string;
    status: string;
    orderType?: string;
    tableNumber?: string;
    totalAmount: number;
    paymentMethod?: string;
    paymentStatus?: string;
    specialNotes?: string;
    items: Array<{ itemName: string; quantity: number; price?: number }>;
    createdAt: string;
  }>;

  const orders = selectedStatusFilter === 'all'
    ? rawOrders
    : rawOrders.filter((o) => o.status === selectedStatusFilter);

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Live Orders Board</h1>
            <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full border border-primary/20">
              {activeRestaurant.name}
            </span>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Real-time multi-tenant order pipeline. Zero external payment gateway dependency.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => createQuickOrder.mutate()}
            loading={createQuickOrder.isPending}
            variant="outline"
            className="rounded-xl font-bold text-xs h-10 gap-1.5"
          >
            <Plus size={15} />
            <span>+ Simulate Table Order</span>
          </Button>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-2 rounded-xl border border-border">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-foreground">Auto-refresh Active</span>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedStatusFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
            selectedStatusFilter === 'all'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <span>All Orders</span>
          <span className="text-[10px] opacity-75">({rawOrders.length})</span>
        </button>
        {STATUS_COLUMNS.map((col) => {
          const count = rawOrders.filter((o) => o.status === col.id).length;
          return (
            <button
              key={col.id}
              onClick={() => setSelectedStatusFilter(col.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                selectedStatusFilter === col.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <span>{col.label}</span>
              <span className="text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
        <button
          onClick={() => setSelectedStatusFilter('served')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
            selectedStatusFilter === 'served'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <span>Completed / Served</span>
          <span className="text-[10px] opacity-75">
            ({rawOrders.filter((o) => o.status === 'served').length})
          </span>
        </button>
      </div>

      {/* 4-Column Live Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {STATUS_COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.id);

          return (
            <div key={col.id} className="bg-muted/40 rounded-2xl p-4 border border-border/80 min-h-[420px] flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm">{col.label}</h3>
                  <span className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <span className="text-xs font-bold bg-background text-foreground px-2 py-0.5 rounded-md border border-border">
                  {colOrders.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {colOrders.map((order) => {
                  const minutesAgo = Math.max(1, Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000));

                  return (
                    <div
                      key={order.id}
                      className="bg-card rounded-2xl p-4 border border-border hover:border-primary/40 shadow-xs transition space-y-3"
                    >
                      {/* Order Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-foreground">{order.orderNumber}</span>
                          <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded-md text-foreground">
                            {order.tableNumber || (order.orderType === 'takeaway' ? '🥡 Takeaway' : 'Table 1')}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock size={11} /> {minutesAgo}m ago
                        </span>
                      </div>

                      {/* Items List */}
                      <div className="space-y-1 py-1 border-y border-border/50 text-xs">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {item.quantity}× {item.itemName}
                            </span>
                            {item.price && (
                              <span className="text-[11px]">₹{(item.price * item.quantity).toFixed(0)}</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Special Notes */}
                      {order.specialNotes && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg font-medium leading-tight">
                          Note: {order.specialNotes}
                        </p>
                      )}

                      {/* Payment info & Settlement */}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1 font-semibold text-emerald-600">
                          <Banknote size={12} />
                          <span>Direct: {order.paymentMethod === 'upi_direct' ? 'Table UPI' : 'Pay at Counter'}</span>
                        </div>
                        <span className="font-black text-sm text-foreground">₹{Number(order.totalAmount).toFixed(0)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => updateStatus.mutate({ id: order.id, status: col.next })}
                          loading={updateStatus.isPending}
                          className="flex-1 text-xs font-bold h-8 rounded-xl shadow-xs"
                        >
                          <span>{col.actionLabel}</span>
                          <ArrowRight size={13} className="ml-1" />
                        </Button>

                        <button
                          type="button"
                          onClick={() => cancelOrder.mutate(order.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-muted"
                          title="Cancel order"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {colOrders.length === 0 && (
                  <div className="h-44 flex flex-col items-center justify-center text-center text-muted-foreground/60 text-xs">
                    <ShoppingBag size={28} className="mb-2 opacity-30" />
                    <span>No orders {col.label.toLowerCase()}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
