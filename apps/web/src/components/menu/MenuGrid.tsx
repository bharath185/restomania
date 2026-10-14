'use client';
import Image from 'next/image';
import { ShoppingCart, Star, Flame, Plus, Minus, Clock } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getDishImage } from '@/lib/food-images';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  discountedPrice?: number;
  dishType: string;
  isInStock: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  spiceLevel?: number;
  prepTimeMins?: number;
  images?: Array<{ url: string; isPrimary?: boolean }>;
  category?: { name: string };
}

export function MenuGrid({ items }: { items: unknown[] }) {
  const { items: cartItems, addItem, updateQuantity } = useCartStore();
  const typedItems = items as MenuItem[];

  if (typedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed border-border rounded-2xl bg-card/40">
        <ShoppingCart size={48} className="mb-3 opacity-25" />
        <h3 className="font-semibold text-lg text-foreground">No dishes found</h3>
        <p className="text-xs text-muted-foreground mt-1">Try selecting a different category or clearing search filters</p>
      </div>
    );
  }

  const handleAdd = (item: MenuItem) => {
    const price = Number(item.discountedPrice ?? item.basePrice);
    const dishImg = item.images?.find((i) => i.isPrimary)?.url ?? item.images?.[0]?.url ?? getDishImage(item.name, item.category?.name);

    addItem({
      itemId: item.id,
      name: item.name,
      price,
      quantity: 1,
      selectedVariant: null,
      selectedAddons: [],
      specialNotes: '',
      totalPrice: price,
      imageUrl: dishImg,
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
      {typedItems.map((item) => {
        const cartItem = cartItems.find((ci) => ci.itemId === item.id);
        const imageUrl = item.images?.find((i) => i.isPrimary)?.url ?? item.images?.[0]?.url ?? getDishImage(item.name, item.category?.name);
        const isVeg = item.dishType === 'veg' || item.dishType === 'vegan';

        return (
          <div
            key={item.id}
            className="group rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col"
          >
            {/* Dish Image */}
            <div className="relative h-48 w-full overflow-hidden bg-muted">
              <Image
                src={imageUrl}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

              {/* Badges on image */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                {/* Veg / Non-Veg Indicator */}
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center bg-white shadow-sm ${
                    isVeg ? 'border-green-600' : 'border-red-600'
                  }`}
                  title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                </div>

                {item.isBestseller && (
                  <Badge variant="warning" className="text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider shadow-sm bg-amber-400 text-amber-950">
                    <Star size={10} className="mr-1 fill-amber-950" /> Bestseller
                  </Badge>
                )}

                {(item.spiceLevel ?? 0) >= 2 && (
                  <Badge variant="destructive" className="text-[10px] px-2 py-0.5 font-bold shadow-sm">
                    <Flame size={10} className="mr-0.5 fill-white" /> Spicy
                  </Badge>
                )}
              </div>

              {item.prepTimeMins && (
                <div className="absolute bottom-2 left-3 flex items-center gap-1 text-[11px] text-white/90 font-medium drop-shadow">
                  <Clock size={12} /> {item.prepTimeMins} mins
                </div>
              )}

              {!item.isInStock && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="text-white font-bold text-xs uppercase tracking-wider px-3 py-1 bg-red-600/80 rounded-full">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Dish Content */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60">
                <div>
                  {item.discountedPrice ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-extrabold text-lg text-primary">₹{Number(item.discountedPrice).toFixed(0)}</span>
                      <span className="text-xs text-muted-foreground line-through">₹{Number(item.basePrice).toFixed(0)}</span>
                    </div>
                  ) : (
                    <span className="font-extrabold text-lg text-foreground">₹{Number(item.basePrice).toFixed(0)}</span>
                  )}
                </div>

                {cartItem ? (
                  <div className="flex items-center gap-1 bg-primary text-primary-foreground rounded-xl p-1 shadow-md">
                    <button
                      onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/20 transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-xs font-bold w-6 text-center">{cartItem.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/20 transition"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleAdd(item)}
                    disabled={!item.isInStock}
                    className="rounded-xl px-4 font-bold text-xs shadow-sm hover:shadow-md transition flex items-center gap-1"
                  >
                    <Plus size={14} /> Add
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
