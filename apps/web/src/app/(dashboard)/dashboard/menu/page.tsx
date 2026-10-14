'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Plus, Trash2, Search, UtensilsCrossed, CheckCircle2, XCircle } from 'lucide-react';
import { getDishImage } from '@/lib/food-images';

export default function MenuManagerPage() {
  const queryClient = useQueryClient();
  const [newCatName, setNewCatName] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res = await api.getCategories();
        const raw = res.data?.data ?? res.data;
        return (Array.isArray(raw) ? raw : []) as Array<{ id: string; name: string; isActive: boolean }>;
      } catch {
        return [];
      }
    },
  });

  const { data: itemsData, isLoading } = useQuery({
    queryKey: ['admin-items'],
    queryFn: async () => {
      try {
        const res = await api.getItems({ limit: 100 });
        const raw = res.data?.data ?? res.data;
        if (Array.isArray(raw)) return { items: raw };
        if (raw && typeof raw === 'object' && 'items' in raw) return raw as { items: Array<{ id: string; name: string; basePrice: number; isInStock: boolean; dishType: string; categoryId?: string }> };
        return { items: [] };
      } catch {
        return { items: [] };
      }
    },
  });

  const createCategory = useMutation({
    mutationFn: (name: string) => api.createCategory({ name }),
    onSuccess: () => {
      setNewCatName('');
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const toggleStock = useMutation({
    mutationFn: ({ id, isInStock }: { id: string; isInStock: boolean }) =>
      api.toggleStock(id, isInStock),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin-items'] }),
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => api.deleteItem(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin-items'] }),
  });

  const allItems = itemsData?.items ?? [];
  const filteredItems = allItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat = !selectedCatId || item.categoryId === selectedCatId;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Dish & Category Inventory</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
          Real-time stock toggling and menu management for your restaurant
        </p>
      </div>

      {/* Add Category Section */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Add New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 max-w-md">
            <Input
              placeholder="e.g. Starters, Tandoor Specials, Desserts..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="rounded-xl h-10 text-xs"
            />
            <Button
              onClick={() => createCategory.mutate(newCatName)}
              loading={createCategory.isPending}
              disabled={!newCatName.trim()}
              className="rounded-xl h-10 px-4 text-xs font-bold"
            >
              <Plus size={15} className="mr-1" /> Add
            </Button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 flex-wrap mt-4 pt-3 border-t border-border/60">
            <button
              onClick={() => setSelectedCatId(null)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                !selectedCatId ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All Categories ({allItems.length})
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  selectedCatId === cat.id ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dishes List with Search */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <CardTitle className="text-base font-bold">Dish Inventory ({filteredItems.length})</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Click &apos;In Stock&apos; to toggle availability on the customer menu</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <Input
              placeholder="Search dishes..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 text-xs h-9 rounded-xl bg-background"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredItems.map((item) => {
              const imgUrl = getDishImage(item.name);
              const isVeg = item.dishType === 'veg' || item.dishType === 'vegan';

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-border/80 bg-card hover:border-primary/40 transition gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-muted border border-border/60">
                      <Image src={imgUrl} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                        <h4 className="font-bold text-sm text-foreground truncate">{item.name}</h4>
                      </div>
                      <span className="text-xs text-primary font-bold">₹{Number(item.basePrice).toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleStock.mutate({ id: item.id, isInStock: !item.isInStock })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                        item.isInStock
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-red-500/10 text-red-600 border border-red-500/30 hover:bg-red-500/20'
                      }`}
                    >
                      {item.isInStock ? (
                        <>
                          <CheckCircle2 size={13} /> In Stock
                        </>
                      ) : (
                        <>
                          <XCircle size={13} /> Out of Stock
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => deleteItem.mutate(item.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-muted transition"
                      title="Delete dish"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <UtensilsCrossed size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">No dishes match your filter</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
