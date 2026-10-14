'use client';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart.store';

export function CartButton() {
  const totalItems = useCartStore((s) => s.totalItems());
  const totalPrice = useCartStore((s) => s.totalPrice());

  if (totalItems === 0) return null;

  return (
    <Link href="/cart">
      <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-50">
        <div className="flex items-center justify-between gap-6 bg-primary text-primary-foreground rounded-2xl px-6 py-3.5 shadow-2xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all ring-4 ring-primary/20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center font-bold text-xs">
              <ShoppingBag size={16} />
            </div>
            <div>
              <div className="text-xs font-medium opacity-90">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} in cart
              </div>
              <div className="text-sm font-extrabold">₹{totalPrice.toFixed(2)}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider bg-black/15 px-3 py-1.5 rounded-xl">
            <span>View Cart</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
}
