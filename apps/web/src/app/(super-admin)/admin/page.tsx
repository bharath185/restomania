'use client';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Building2, ShoppingBag, TrendingUp, Plus, ExternalLink,
  Store, ShieldCheck, CheckCircle2, XCircle, Search, LayoutDashboard
} from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { multiTenantEngine, TenantRestaurant } from '@/lib/multi-tenant-engine';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      try {
        const res = await api.getPlatformStats();
        return (res.data?.data ?? res.data) as {
          totalRestaurants: number;
          activeRestaurants: number;
          totalOrders: number;
          totalRevenue: number;
        };
      } catch {
        return multiTenantEngine.getRestaurants().reduce(
          (acc, r) => ({
            totalRestaurants: acc.totalRestaurants + 1,
            activeRestaurants: acc.activeRestaurants + (r.isActive ? 1 : 0),
            totalOrders: acc.totalOrders + r.orders.length,
            totalRevenue: acc.totalRevenue + r.orders.reduce((s, o) => s + o.totalAmount, 0),
          }),
          { totalRestaurants: 0, activeRestaurants: 0, totalOrders: 0, totalRevenue: 0 }
        );
      }
    },
    refetchInterval: 15000,
  });

  const { data: restaurantsData, refetch } = useQuery({
    queryKey: ['admin-restaurants'],
    queryFn: async () => {
      try {
        const res = await api.getRestaurants({ limit: 50 });
        const raw = res.data?.data ?? res.data;
        if (raw && typeof raw === 'object' && 'restaurants' in raw) {
          return (raw as any).restaurants as TenantRestaurant[];
        }
        return Array.isArray(raw) ? (raw as TenantRestaurant[]) : [];
      } catch {
        return multiTenantEngine.getRestaurants();
      }
    },
  });

  const toggleStatus = useMutation({
    mutationFn: (r: TenantRestaurant) => {
      multiTenantEngine.updateRestaurant(r.slug, { isActive: !r.isActive });
      return Promise.resolve();
    },
    onSuccess: () => void refetch(),
  });

  const openRestaurantDashboard = (slug: string) => {
    multiTenantEngine.setActiveSlug(slug);
    void router.push('/dashboard');
  };

  const restaurants = (restaurantsData && restaurantsData.length > 0)
    ? restaurantsData
    : multiTenantEngine.getRestaurants();

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.slug.toLowerCase().includes(search.toLowerCase()) ||
    (r.cuisine && r.cuisine.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-muted/20 text-foreground py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-amber-500/10 text-amber-600 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Super Admin Tower
              </span>
              <span className="text-xs text-muted-foreground">Platform Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
              Multi-Tenant Operations Fleet
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
              Monitor, configure, and provision all restaurant tenants across your platform
            </p>
          </div>

          <Link href="/admin/restaurants/new">
            <Button className="rounded-xl font-bold h-11 px-5 shadow-md gap-2">
              <Plus size={16} />
              <span>Onboard New Restaurant</span>
            </Button>
          </Link>
        </div>

        {/* Global Platform KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Restaurants', value: stats?.totalRestaurants ?? restaurants.length, icon: Building2, color: 'text-primary' },
            { label: 'Active Brands', value: stats?.activeRestaurants ?? restaurants.filter((r) => r.isActive).length, icon: Store, color: 'text-emerald-500' },
            { label: 'Platform Orders', value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: 'text-blue-500' },
            { label: 'Gross Volume', value: `₹${(stats?.totalRevenue ?? 0).toFixed(0)}`, icon: TrendingUp, color: 'text-amber-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-border/80 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</CardTitle>
                <Icon size={17} className={color} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Restaurants Fleet Directory */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <span>Onboarded Restaurants ({filtered.length})</span>
                <span className="text-xs font-semibold text-muted-foreground">Each runs isolated operations</span>
              </CardTitle>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input
                placeholder="Search by name, slug, cuisine..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs h-9 rounded-xl bg-background"
              />
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-primary/40 transition gap-4"
                >
                  <div>
                    {/* Header with Logo and Status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-muted border border-border">
                          {r.branding?.logoUrl ? (
                            <Image src={r.branding.logoUrl} alt={r.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-sm text-primary">
                              {r.name.slice(0, 1)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-foreground truncate">{r.name}</h4>
                          <span className="text-[11px] text-muted-foreground font-mono block truncate">
                            {r.slug}.platform.com
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleStatus.mutate(r)}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition ${
                          r.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-600 border-red-500/20'
                        }`}
                      >
                        {r.isActive ? 'Active' : 'Suspended'}
                      </button>
                    </div>

                    {/* Metadata & Palette */}
                    <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t border-border/50">
                      <div className="flex justify-between">
                        <span>Cuisine:</span>
                        <span className="font-medium text-foreground truncate max-w-[150px]">{r.cuisine || 'General'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Owner:</span>
                        <span className="font-medium text-foreground">{r.ownerName || r.ownerEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dining Tables:</span>
                        <span className="font-bold text-foreground">{r.tableCount || 8} Tables</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Brand Accent:</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block"
                            style={{ backgroundColor: r.branding?.primaryColor || '#FF6B35' }}
                          />
                          <span className="font-mono text-[10px]">{r.branding?.primaryColor || '#FF6B35'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/60">
                    <Button
                      size="sm"
                      onClick={() => openRestaurantDashboard(r.slug)}
                      className="rounded-xl font-bold text-xs h-8 gap-1.5 shadow-2xs"
                    >
                      <LayoutDashboard size={13} />
                      <span>Manage Ops</span>
                    </Button>

                    <Link
                      href={`/menu?restaurant=${r.slug}`}
                      target="_blank"
                      className="inline-flex items-center justify-center gap-1 rounded-xl text-xs font-bold border border-border bg-muted/40 hover:bg-muted text-foreground transition h-8"
                    >
                      <span>Live Menu</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="py-16 text-center text-muted-foreground space-y-2">
                <Store size={36} className="mx-auto opacity-30" />
                <p className="text-sm font-bold">No restaurants found</p>
                <p className="text-xs">Try adjusting your search query or onboard a new restaurant above.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
