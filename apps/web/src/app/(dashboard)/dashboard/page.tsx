'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { TrendingUp, ShoppingBag, Clock, DollarSign, ChefHat, UtensilsCrossed, QrCode, ArrowUpRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

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
  { key: 'pendingOrders', label: 'Pending in Kitchen', icon: Clock, prefix: '', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { key: 'avgOrderValue', label: 'Avg. Order Ticket', icon: TrendingUp, prefix: '₹', color: 'text-blue-500', bg: 'bg-blue-500/10' },
] as const;

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      try {
        const res = await api.getDashboard();
        return (res.data?.data ?? res.data) as DashboardStats;
      } catch {
        return null;
      }
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return <div className="flex h-full items-center justify-center py-20"><LoadingSpinner size={40} /></div>;
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header & Quick Action Shortcuts */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Restaurant Overview</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">Live operational performance and daily order metrics</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/dashboard/kitchen">
            <Button size="sm" className="rounded-xl font-bold gap-1.5 shadow-sm">
              <ChefHat size={16} /> Open KDS Screen
            </Button>
          </Link>
          <Link href="/dashboard/menu">
            <Button size="sm" variant="outline" className="rounded-xl font-bold gap-1.5">
              <UtensilsCrossed size={15} /> Dish Inventory
            </Button>
          </Link>
          <Link href="/dashboard/tables">
            <Button size="sm" variant="outline" className="rounded-xl font-bold gap-1.5">
              <QrCode size={15} /> Table QRs
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statsCards.map(({ key, label, icon: Icon, prefix, color, bg }) => (
          <Card key={key} className="border-border/80 shadow-xs hover:shadow-md transition">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</CardTitle>
              <div className={`w-8 h-8 rounded-xl ${bg} ${color} flex items-center justify-center`}>
                <Icon size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-foreground tracking-tight">
                {prefix}{typeof stats?.[key] === 'number' ? Number(stats[key]).toFixed(prefix === '₹' ? 2 : 0) : '0'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Dishes Table & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Top Performing Dishes</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Ranked by order volume today</p>
              </div>
              <Link href="/dashboard/menu" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                <span>View Full Menu</span>
                <ArrowUpRight size={14} />
              </Link>
            </CardHeader>
            <CardContent>
              {stats?.topDishes && stats.topDishes.length > 0 ? (
                <div className="divide-y divide-border/60">
                  {stats.topDishes.map((dish, idx) => (
                    <div key={dish.name} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-sm text-foreground">{dish.name}</p>
                          <p className="text-xs text-muted-foreground">{dish.orderCount} orders placed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-sm text-foreground">₹{dish.revenue.toFixed(2)}</p>
                        <p className="text-[11px] text-emerald-600 font-semibold">In Demand</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <p className="text-sm">No dishes ordered yet today</p>
                  <p className="text-xs mt-1">Orders placed by customers will rank here automatically</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Operational Status */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold">Kitchen Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                <span className="font-medium text-muted-foreground">Kitchen Display Status</span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Online
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                <span className="font-medium text-muted-foreground">Active Pending Orders</span>
                <span className="font-extrabold text-sm text-primary">{stats?.pendingOrders ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                <span className="font-medium text-muted-foreground">Avg Ticket Size</span>
                <span className="font-bold text-foreground">₹{stats?.avgOrderValue ? Number(stats.avgOrderValue).toFixed(0) : '0'}</span>
              </div>
              <Link href="/dashboard/orders" className="block pt-2">
                <Button variant="outline" className="w-full rounded-xl text-xs font-bold h-10">
                  Go to Orders Kanban →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
