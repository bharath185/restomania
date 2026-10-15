'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp, ShoppingBag, Clock, DollarSign, ChefHat,
  UtensilsCrossed, QrCode, ArrowUpRight, Store, Sparkles,
  CheckCircle2, ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { multiTenantEngine } from '@/lib/multi-tenant-engine';

interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  avgOrderValue: number;
  topDishes: Array<{ name: string; orderCount: number; revenue: number }>;
}

const statsCards = [
  { key: 'todayRevenue', label: "Today's Revenue", icon: DollarSign, prefix: '₹', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { key: 'todayOrders', label: "Today's Orders", icon: ShoppingBag, prefix: '', color: 'text-primary', bg: 'bg-primary/10' },
  { key: 'pendingOrders', label: 'Active in Kitchen', icon: Clock, prefix: '', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { key: 'avgOrderValue', label: 'Avg Ticket Size', icon: TrendingUp, prefix: '₹', color: 'text-blue-500', bg: 'bg-blue-500/10' },
] as const;

export default function DashboardPage() {
  const [activeRestaurant, setActiveRestaurant] = useState(multiTenantEngine.getActiveRestaurant());

  useEffect(() => {
    const handleSwitch = () => {
      setActiveRestaurant(multiTenantEngine.getActiveRestaurant());
    };
    window.addEventListener('tenant_switched', handleSwitch);
    window.addEventListener('tenant_state_updated', handleSwitch);
    return () => {
      window.removeEventListener('tenant_switched', handleSwitch);
      window.removeEventListener('tenant_state_updated', handleSwitch);
    };
  }, []);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['dashboard', activeRestaurant.id],
    queryFn: async () => {
      try {
        const res = await api.getDashboard();
        return (res.data?.data ?? res.data) as DashboardStats;
      } catch {
        return multiTenantEngine.getDashboardStats();
      }
    },
    refetchInterval: 10000,
  });

  const orders = activeRestaurant.orders.slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header & Quick Action Shortcuts */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Executive Operations</h1>
            <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full border border-primary/20">
              {activeRestaurant.name}
            </span>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Real-time multi-tenant dashboard • Zero payment gateway direct settlement
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/dashboard/orders">
            <Button size="sm" className="rounded-xl font-bold gap-1.5 shadow-sm text-xs h-9">
              <ShoppingBag size={15} /> Live Orders Kanban
            </Button>
          </Link>
          <Link href="/dashboard/kitchen">
            <Button size="sm" variant="outline" className="rounded-xl font-bold gap-1.5 text-xs h-9">
              <ChefHat size={15} /> KDS Screen
            </Button>
          </Link>
          <Link href="/dashboard/menu">
            <Button size="sm" variant="outline" className="rounded-xl font-bold gap-1.5 text-xs h-9">
              <UtensilsCrossed size={15} /> Dish Inventory
            </Button>
          </Link>
          <Link href="/dashboard/tables">
            <Button size="sm" variant="outline" className="rounded-xl font-bold gap-1.5 text-xs h-9">
              <QrCode size={15} /> Tables & QRs
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map(({ key, label, icon: Icon, prefix, color, bg }) => (
          <Card key={key} className="border-border/80 shadow-xs hover:border-primary/40 transition">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</CardTitle>
              <div className={`w-8 h-8 rounded-xl ${bg} ${color} flex items-center justify-center`}>
                <Icon size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-foreground tracking-tight">
                {prefix}{typeof stats?.[key] === 'number' ? Number(stats[key]).toFixed(prefix === '₹' ? 0 : 0) : '0'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid: Top Dishes & Live Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Top Performing Dishes */}
        <div className="lg:col-span-7">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div>
                <CardTitle className="text-base font-bold">Top Performing Dishes</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Ranked by customer orders today</p>
              </div>
              <Link href="/dashboard/menu" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                <span>Manage Dishes</span>
                <ArrowUpRight size={14} />
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              {stats?.topDishes && stats.topDishes.length > 0 ? (
                <div className="divide-y divide-border/60">
                  {stats.topDishes.map((dish, idx) => (
                    <div key={dish.name} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-sm text-foreground">{dish.name}</p>
                          <p className="text-xs text-muted-foreground">{dish.orderCount} orders placed today</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-sm text-foreground">₹{dish.revenue.toFixed(0)}</p>
                        <p className="text-[11px] text-emerald-600 font-semibold">High Turnaround</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <p className="text-sm font-semibold">No orders recorded yet today</p>
                  <p className="text-xs mt-1">Customer orders placed on the digital menu will rank here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Live Kitchen Stream */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <span>Active Order Queue</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Live table & takeaway orders</p>
              </div>
              <Link href="/dashboard/orders" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                <span>View All</span>
                <ArrowRight size={13} />
              </Link>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="p-3 rounded-xl border border-border bg-card flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-foreground">{o.orderNumber}</span>
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-foreground font-semibold">
                        {o.tableNumber || 'Table 1'}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {o.items.length} items • ₹{o.totalAmount}
                    </p>
                  </div>
                  <span className="capitalize text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {o.status}
                  </span>
                </div>
              ))}

              {orders.length === 0 && (
                <p className="text-xs text-center text-muted-foreground py-6">No pending orders</p>
              )}

              <Link href="/dashboard/orders" className="block pt-2">
                <Button className="w-full rounded-xl text-xs font-bold h-10 shadow-xs">
                  Open Kanban Order Station →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
