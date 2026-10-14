'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const { data: topDishes } = useQuery({
    queryKey: ['top-dishes-analytics'],
    queryFn: async () => {
      const res = await api.getTopDishes();
      return res.data.data as Array<{ itemName: string; _count: { itemId: number } }>;
    },
  });

  const { data: peakHours } = useQuery({
    queryKey: ['peak-hours'],
    queryFn: async () => {
      const res = await api.getPeakHours();
      return res.data.data as Array<{ hour: number; count: number }>;
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics & Reports</h1>
        <p className="text-muted-foreground text-sm">Performance metrics for your restaurant</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Top Selling Items</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topDishes?.map((d) => ({ name: d.itemName, count: d._count.itemId })) ?? []}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--color-primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Peak Order Hours</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={peakHours?.map((p) => ({ hour: `${p.hour}:00`, orders: p.count })) ?? []}>
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="hsl(var(--color-secondary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
