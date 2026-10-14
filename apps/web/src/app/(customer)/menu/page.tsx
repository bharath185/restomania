'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { MenuGrid } from '@/components/menu/MenuGrid';
import { CategoryTabs } from '@/components/menu/CategoryTabs';
import { RestaurantHeader } from '@/components/restaurant/RestaurantHeader';
import { CartButton } from '@/components/cart/CartButton';
import { SideCart } from '@/components/cart/SideCart';
import { SearchBar } from '@/components/menu/SearchBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { RestaurantBranding } from '@repo/shared';
import { Utensils, Info, Sparkles, MapPin, Phone } from 'lucide-react';

export default function MenuPage() {
  const searchParams = useSearchParams();
  const currentRestaurant = searchParams.get('restaurant') || searchParams.get('tenant') || '';
  const tableParam = searchParams.get('table');

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [dishTypeFilter, setDishTypeFilter] = useState<string>('');

  const { data: tenantData } = useQuery({
    queryKey: ['tenant', currentRestaurant],
    queryFn: async () => {
      try {
        const res = await api.resolveTenant();
        return (res.data?.data ?? res.data) as {
          name: string;
          branding: RestaurantBranding | null;
          phone?: string;
          address?: string;
          city?: string;
        };
      } catch {
        return null;
      }
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: menuData, isLoading } = useQuery({
    queryKey: ['menu', currentRestaurant],
    queryFn: async () => {
      const res = await api.getMenu();
      return (res.data?.data ?? res.data) as Array<{ id: string; name: string; items: unknown[] }>;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['menu-items', currentRestaurant, selectedCategory, search, dishTypeFilter],
    queryFn: async () => {
      const params: Record<string, unknown> = {};
      if (selectedCategory) params.categoryId = selectedCategory;
      if (search) params.search = search;
      if (dishTypeFilter) params.dishType = dishTypeFilter;
      const res = await api.getItems(params);
      const raw = res.data?.data ?? res.data;
      if (Array.isArray(raw)) return { items: raw };
      if (raw && typeof raw === 'object' && 'items' in raw) return raw as { items: unknown[] };
      return { items: [] };
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  const activeCategoryObj = menuData?.find((c) => c.id === selectedCategory);
  const totalItemCount = itemsData?.items?.length ?? 0;

  return (
    <ThemeProvider branding={tenantData?.branding ?? null}>
      <div className="min-h-screen bg-muted/20 text-foreground flex flex-col">
        {/* Full-Width Restaurant Showcase Header */}
        <RestaurantHeader
          name={tenantData?.name ?? 'Restaurant'}
          branding={tenantData?.branding ?? null}
          tableNumber={tableParam}
        />

        {/* Sticky Sub-Header: Search & Quick Filters */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
            <SearchBar
              value={search}
              onChange={setSearch}
              dishType={dishTypeFilter}
              onDishTypeChange={setDishTypeFilter}
            />

            {/* Horizontal pills for Mobile & Tablet */}
            <div className="lg:hidden">
              <CategoryTabs
                categories={menuData ?? []}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
                orientation="horizontal"
              />
            </div>
          </div>
        </div>

        {/* Expansive Full-Screen Main Content Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
          <div className="flex items-start gap-8">
            {/* Left Column: Sticky Desktop Category Navigator */}
            <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-28 space-y-6">
              <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-border text-foreground font-bold text-sm">
                  <Utensils size={16} className="text-primary" />
                  <span>Menu Directory</span>
                </div>
                <CategoryTabs
                  categories={menuData ?? []}
                  selected={selectedCategory}
                  onSelect={setSelectedCategory}
                  orientation="vertical"
                />
              </div>

              {/* Restaurant Info Card */}
              <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm text-xs space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <Info size={14} className="text-primary" />
                  <span>About {tenantData?.name}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Prepared fresh to order using premium quality ingredients and authentic recipes.
                </p>
                <div className="pt-2 border-t border-border/60 space-y-1.5 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span>Kitchen: Accepting Orders</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-foreground">GST Included in Prices</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Center Column: Dynamic Dish Grid */}
            <main className="flex-1 min-w-0">
              {/* Category Title & Dish Count */}
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-border/80">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                    <span>{activeCategoryObj?.name ?? 'All Special Dishes'}</span>
                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                      {totalItemCount} {totalItemCount === 1 ? 'dish' : 'dishes'}
                    </span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {search ? `Matching search "${search}"` : 'Handcrafted by our master chefs'}
                  </p>
                </div>
              </div>

              {itemsLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <LoadingSpinner size={44} />
                  <p className="text-xs text-muted-foreground font-medium">Loading delicious items...</p>
                </div>
              ) : (
                <div className="pb-24 lg:pb-8">
                  <MenuGrid items={(itemsData?.items ?? []) as unknown[]} />
                </div>
              )}
            </main>

            {/* Right Column: Live Sticky Desktop Cart */}
            <aside className="hidden xl:block w-84 2xl:w-96 flex-shrink-0 sticky top-28 self-start">
              <SideCart />
            </aside>
          </div>
        </div>

        {/* Mobile View Cart Floating Pill */}
        <div className="xl:hidden">
          <CartButton />
        </div>
      </div>
    </ThemeProvider>
  );
}
