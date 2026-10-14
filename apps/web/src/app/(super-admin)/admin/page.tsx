'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { Building2, ShoppingBag, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PlatformStats {
  totalRestaurants: number;
  activeRestaurants: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const res = await api.getPlatformStats();
      return res.data.data as PlatformStats;
    },
  });

  const { data: restaurants } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const res = await api.getRestaurants({ limit: 10 });
      return res.data.data as { restaurants: Array<{ id: string; name: string; slug: string; isActive: boolean }> };
    },
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Platform Dashboard</h1>
          <p className="text-muted-foreground">Super Admin Panel</p>
        </div>
        <Link href="/admin/restaurants/new">
          <Button><Plus size={16} className="mr-2" /> Onboard Restaurant</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Restaurants', value: stats?.totalRestaurants ?? 0, icon: Building2 },
          { label: 'Active Restaurants', value: stats?.activeRestaurants ?? 0, icon: Building2 },
          { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: ShoppingBag },
          { label: 'Total Revenue', value: `₹${(stats?.totalRevenue ?? 0).toFixed(0)}`, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
              <Icon size={16} className="text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Restaurants</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {restaurants?.restaurants.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors border border-border">
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-sm text-muted-foreground">{r.slug}.platform.com</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    r.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>{r.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
