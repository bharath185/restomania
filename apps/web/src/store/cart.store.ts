import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@repo/shared';

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  tableId: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setRestaurantContext: (restaurantId: string, tableId: string | null) => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      tableId: null,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.findIndex((i) => i.itemId === item.itemId);
          if (existing >= 0) {
            const updated = [...state.items];
            const existingItem = updated[existing];
            if (existingItem) {
              updated[existing] = {
                ...existingItem,
                quantity: existingItem.quantity + item.quantity,
                totalPrice: existingItem.totalPrice + item.totalPrice,
              };
            }
            return { items: updated };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (itemId) =>
        set((state) => ({ items: state.items.filter((i) => i.itemId !== itemId) })),
      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          items: quantity === 0
            ? state.items.filter((i) => i.itemId !== itemId)
            : state.items.map((i) =>
                i.itemId === itemId
                  ? { ...i, quantity, totalPrice: (i.totalPrice / i.quantity) * quantity }
                  : i,
              ),
        })),
      clearCart: () => set({ items: [] }),
      setRestaurantContext: (restaurantId, tableId) => set({ restaurantId, tableId }),
      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
      totalPrice: () => get().items.reduce((s, i) => s + i.totalPrice, 0),
    }),
    { name: 'cart-storage' },
  ),
);
