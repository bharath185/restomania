'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Plus, Trash2, Search, UtensilsCrossed, CheckCircle2,
  XCircle, Flame, X, Sparkles, Filter
} from 'lucide-react';
import { getDishImage } from '@/lib/food-images';
import { multiTenantEngine } from '@/lib/multi-tenant-engine';

interface NewDishForm {
  name: string;
  categoryId: string;
  basePrice: number;
  discountedPrice?: number;
  dishType: 'veg' | 'non_veg' | 'vegan' | 'egg';
  description: string;
  spiceLevel: number;
  imageUrl?: string;
  isInStock: boolean;
}

export default function MenuManagerPage() {
  const queryClient = useQueryClient();
  const [newCatName, setNewCatName] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [dishTypeFilter, setDishTypeFilter] = useState<string>('all');
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);

  // New Dish Modal Form State
  const [dishForm, setDishForm] = useState<NewDishForm>({
    name: '',
    categoryId: '',
    basePrice: 250,
    dishType: 'veg',
    description: '',
    spiceLevel: 1,
    isInStock: true,
  });

  const { data: categories, refetch: refetchCats } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res = await api.getCategories();
        const raw = res.data?.data ?? res.data;
        return (Array.isArray(raw) ? raw : []) as Array<{ id: string; name: string; isActive: boolean }>;
      } catch {
        return multiTenantEngine.getCategories();
      }
    },
  });

  const { data: itemsData, isLoading, refetch: refetchDishes } = useQuery({
    queryKey: ['admin-items'],
    queryFn: async () => {
      try {
        const res = await api.getItems({ limit: 100 });
        const raw = res.data?.data ?? res.data;
        if (Array.isArray(raw)) return { items: raw };
        if (raw && typeof raw === 'object' && 'items' in raw) {
          return raw as { items: Array<{ id: string; name: string; basePrice: number; isInStock: boolean; dishType: string; categoryId?: string; description?: string; spiceLevel?: number; imageUrl?: string }> };
        }
        return { items: [] };
      } catch {
        return { items: multiTenantEngine.getDishes() };
      }
    },
  });

  const createCategory = useMutation({
    mutationFn: (name: string) => api.createCategory({ name }),
    onSuccess: () => {
      setNewCatName('');
      void refetchCats();
    },
  });

  const createDish = useMutation({
    mutationFn: (data: NewDishForm) => api.createItem(data),
    onSuccess: () => {
      setIsAddDishOpen(false);
      setDishForm({
        name: '',
        categoryId: categories?.[0]?.id || '',
        basePrice: 250,
        dishType: 'veg',
        description: '',
        spiceLevel: 1,
        isInStock: true,
      });
      void refetchDishes();
    },
  });

  const toggleStock = useMutation({
    mutationFn: ({ id, isInStock }: { id: string; isInStock: boolean }) =>
      api.toggleStock(id, isInStock),
    onSuccess: () => void refetchDishes(),
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => api.deleteItem(id),
    onSuccess: () => void refetchDishes(),
  });

  const allItems = itemsData?.items ?? [];
  const filteredItems = allItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat = !selectedCatId || item.categoryId === selectedCatId;
    const matchesType = dishTypeFilter === 'all' || item.dishType === dishTypeFilter;
    return matchesSearch && matchesCat && matchesType;
  });

  const activeRestaurant = multiTenantEngine.getActiveRestaurant();

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Dishes & Menu Management</h1>
            <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full border border-primary/20">
              {activeRestaurant.name}
            </span>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Manage your restaurant&apos;s culinary offerings, live stock availability, and prices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              if (categories && categories.length > 0 && !dishForm.categoryId && categories[0]) {
                setDishForm((prev) => ({ ...prev, categoryId: categories[0]?.id || '' }));
              }
              setIsAddDishOpen(true);
            }}
            className="rounded-xl font-bold gap-1.5 shadow-sm h-10 px-4 text-xs"
          >
            <Plus size={16} />
            <span>Add New Dish</span>
          </Button>
        </div>
      </div>

      {/* Category Creation & Filter Bar */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Menu Categories ({categories?.length ?? 0})
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">Type category name and press Add</span>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 max-w-md">
            <Input
              placeholder="e.g. Starters, Tandoor Specials, Desserts, Mocktails..."
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                !selectedCatId ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All Categories ({allItems.length})
            </button>
            {categories?.map((cat) => {
              const count = allItems.filter((i) => i.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedCatId === cat.id ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dishes Grid with Search & Filters */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <span>Dish Inventory</span>
              <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                {filteredItems.length} items
              </span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Toggle stock in real-time. Changes instantly reflect on the customer digital menu.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Dish Type Filter */}
            <div className="flex items-center bg-muted rounded-xl p-0.5 border border-border text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDishTypeFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition ${dishTypeFilter === 'all' ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground'}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDishTypeFilter('veg')}
                className={`px-2.5 py-1 rounded-lg transition ${dishTypeFilter === 'veg' ? 'bg-card text-green-600 shadow-2xs font-bold' : 'text-muted-foreground'}`}
              >
                Veg
              </button>
              <button
                type="button"
                onClick={() => setDishTypeFilter('non_veg')}
                className={`px-2.5 py-1 rounded-lg transition ${dishTypeFilter === 'non_veg' ? 'bg-card text-red-600 shadow-2xs font-bold' : 'text-muted-foreground'}`}
              >
                Non-Veg
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input
                placeholder="Search dishes..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 text-xs h-9 rounded-xl bg-background"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredItems.map((item) => {
              const imgUrl = item.imageUrl || getDishImage(item.name);
              const isVeg = item.dishType === 'veg' || item.dishType === 'vegan';
              const catObj = categories?.find((c) => c.id === item.categoryId);

              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/40 transition gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted border border-border/60">
                      <Image src={imgUrl} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                        <h4 className="font-extrabold text-sm text-foreground truncate">{item.name}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
                        <span>{catObj?.name || 'Special'}</span>
                        {item.spiceLevel !== undefined && item.spiceLevel > 0 && (
                          <span className="flex items-center text-amber-500 font-bold">
                            <Flame size={11} /> {item.spiceLevel}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <div>
                      <span className="text-sm font-black text-primary">₹{Number(item.basePrice).toFixed(0)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStock.mutate({ id: item.id, isInStock: !item.isInStock })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          item.isInStock
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-600 border border-red-500/30 hover:bg-red-500/20'
                        }`}
                      >
                        {item.isInStock ? (
                          <>
                            <CheckCircle2 size={13} />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={13} />
                            <span>Out of Stock</span>
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
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="py-20 text-center text-muted-foreground space-y-3">
              <UtensilsCrossed size={40} className="mx-auto opacity-30" />
              <p className="text-sm font-bold">No dishes found</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No items match your active filters. Click &quot;Add New Dish&quot; above to create new menu items.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Dish Modal */}
      {isAddDishOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Add New Dish</h3>
                  <p className="text-[11px] text-muted-foreground">Add to {activeRestaurant.name}&apos;s menu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDishOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createDish.mutate(dishForm);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="font-bold text-muted-foreground uppercase block mb-1">Dish Name *</label>
                <Input
                  required
                  placeholder="e.g. Truffle Butter Naan, Smoked BBQ Wings..."
                  value={dishForm.name}
                  onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground uppercase block mb-1">Category *</label>
                  <select
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold focus:ring-1 focus:ring-primary"
                    value={dishForm.categoryId}
                    onChange={(e) => setDishForm({ ...dishForm, categoryId: e.target.value })}
                    required
                  >
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-muted-foreground uppercase block mb-1">Base Price (₹) *</label>
                  <Input
                    type="number"
                    required
                    min={0}
                    value={dishForm.basePrice}
                    onChange={(e) => setDishForm({ ...dishForm, basePrice: Number(e.target.value) })}
                    className="rounded-xl h-10 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground uppercase block mb-1">Dietary Type</label>
                  <select
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold"
                    value={dishForm.dishType}
                    onChange={(e) => setDishForm({ ...dishForm, dishType: e.target.value as any })}
                  >
                    <option value="veg">🟢 Vegetarian (Veg)</option>
                    <option value="non_veg">🔴 Non-Vegetarian</option>
                    <option value="vegan">🌱 Vegan</option>
                    <option value="egg">🟡 Egg</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-muted-foreground uppercase block mb-1">Spice Level</label>
                  <select
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold"
                    value={dishForm.spiceLevel}
                    onChange={(e) => setDishForm({ ...dishForm, spiceLevel: Number(e.target.value) })}
                  >
                    <option value={0}>0 - Mild / None</option>
                    <option value={1}>1 - Light Heat 🌶️</option>
                    <option value={2}>2 - Medium Spicy 🌶️🌶️</option>
                    <option value={3}>3 - Extra Spicy 🌶️🌶️🌶️</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground uppercase block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, preparation style, allergen notes..."
                  value={dishForm.description}
                  onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={dishForm.isInStock}
                  onChange={(e) => setDishForm({ ...dishForm, isInStock: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="inStockCheck" className="text-xs font-bold cursor-pointer">
                  Available in stock immediately on live menu
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDishOpen(false)}
                  className="rounded-xl h-10 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={createDish.isPending}
                  disabled={!dishForm.name.trim()}
                  className="rounded-xl h-10 px-5 text-xs font-bold"
                >
                  Save & Publish Dish
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
