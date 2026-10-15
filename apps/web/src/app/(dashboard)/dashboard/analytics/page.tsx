'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { multiTenantEngine } from '@/lib/multi-tenant-engine';

export default function AnalyticsPage() {
  const activeRestaurant = multiTenantEngine.getActiveRestaurant();

  const { data: topDishes } = useQuery({
    queryKey: ['top-dishes-analytics', activeRestaurant.id],
    queryFn: async () => {
      const res = await api.getTopDishes();
      return (res.data.data ?? res.data) as unknown as Array<{ name?: string; itemName?: string; orderCount?: number; _count?: { itemId: number } }>;
    },
  });

  const { data: peakHours } = useQuery({
    queryKey: ['peak-hours', activeRestaurant.id],
    queryFn: async () => {
      const res = await api.getPeakHours();
      return (res.data.data ?? res.data) as unknown as Array<{ hour: string | number; orders?: number; count?: number }>;
    },
  });

  const topDishesChartData = (topDishes ?? []).map((d) => ({
    name: d.name || d.itemName || 'Dish',
    count: d.orderCount ?? d._count?.itemId ?? 1,
  }));

  const peakHoursChartData = (peakHours ?? []).map((p) => ({
    hour: String(p.hour),
    orders: p.orders ?? p.count ?? 0,
  }));

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Analytics & Operational Reports</h1>
          <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full border border-primary/20">
            {activeRestaurant.name}
          </span>
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
          Performance, demand distribution, and peak hours across your dining tables
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/80 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold">Top Selling Dishes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDishesChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--color-primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold">Peak Dining Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHoursChartData}>
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="hsl(var(--color-primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
