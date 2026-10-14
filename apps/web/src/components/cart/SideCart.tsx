'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, Utensils, Check } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';

export function SideCart() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [specialNotes, setSpecialNotes] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);

  const subtotal = totalPrice();
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const serviceCharge = Math.round(subtotal * 0.02 * 100) / 100;
  const grandTotal = Math.max(0, subtotal + tax + serviceCharge - couponDiscount);

  const validateCoupon = useMutation({
    mutationFn: () => api.validateCoupon(couponCode, subtotal),
    onSuccess: (res) => {
      const data = (res.data?.data ?? res.data) as { discountAmount?: number };
      const discount = data?.discountAmount ?? 0;
      setCouponDiscount(discount);
      setCouponSuccess(true);
    },
  });

  const placeOrder = useMutation({
    mutationFn: () =>
      api.placeOrder({
        orderType,
        paymentMethod: 'cash',
        specialNotes,
        couponCode: couponCode || undefined,
        items: items.map((i) => ({
          itemId: i.itemId,
          quantity: i.quantity,
          variantId: i.selectedVariant?.id,
          addonIds: i.selectedAddons.map((a) => a.id),
          specialNotes: i.specialNotes,
        })),
      }),
    onSuccess: (res) => {
      const raw = res.data?.data ?? res.data;
      const order = raw as { id: string; orderNumber: string };
      clearCart();
      if (order?.id) {
        void router.push(`/order/${order.id}`);
      }
    },
  });

  if (items.length === 0) {
    return (
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center min-h-[360px]">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
          <ShoppingBag size={28} className="opacity-40" />
        </div>
        <h3 className="font-semibold text-foreground text-base">Your Cart is Empty</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
          Add signature dishes and drinks from the menu to start your order.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} className="text-primary" />
          <h3 className="font-bold text-foreground text-base">Your Order</h3>
          <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
            {items.reduce((s, i) => s + i.quantity, 0)} items
          </span>
        </div>
        <button
          onClick={clearCart}
          className="text-[11px] text-muted-foreground hover:text-destructive transition flex items-center gap-1"
        >
          <Trash2 size={12} /> Clear
        </button>
      </div>

      {/* Dine-in / Takeaway Toggle */}
      <div className="p-3 border-b border-border bg-muted/10">
        <div className="grid grid-cols-2 gap-1 p-1 bg-muted/60 rounded-xl text-xs font-medium">
          <button
            onClick={() => setOrderType('dine_in')}
            className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
              orderType === 'dine_in'
                ? 'bg-background text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Utensils size={13} /> Dine-in
          </button>
          <button
            onClick={() => setOrderType('takeaway')}
            className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
              orderType === 'takeaway'
                ? 'bg-background text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🥡 Takeaway
          </button>
        </div>
      </div>

      {/* Items list */}
      <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto divide-y divide-border/60">
        {items.map((item) => (
          <div key={item.itemId} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
            {item.imageUrl && (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-border/50">
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
              <p className="text-xs text-primary font-medium mt-0.5">
                ₹{Number(item.price).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-muted rounded-lg p-1 border border-border/50">
              <button
                onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-background transition text-muted-foreground hover:text-foreground"
              >
                <Minus size={12} />
              </button>
              <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-background transition text-muted-foreground hover:text-foreground"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Special instructions */}
      <div className="p-3 border-t border-border bg-muted/10">
        <Input
          placeholder="Cooking instructions (e.g. less spicy)..."
          value={specialNotes}
          onChange={(e) => setSpecialNotes(e.target.value)}
          className="text-xs h-8 bg-background"
        />
      </div>

      {/* Coupon code */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Promo coupon code"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                setCouponSuccess(false);
              }}
              className="text-xs pl-8 h-8 uppercase bg-background"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => validateCoupon.mutate()}
            loading={validateCoupon.isPending}
            disabled={!couponCode.trim()}
            className="h-8 text-xs font-semibold px-3"
          >
            {couponSuccess ? <Check size={14} className="text-green-600" /> : 'Apply'}
          </Button>
        </div>
        {couponSuccess && couponDiscount > 0 && (
          <p className="text-[11px] text-green-600 font-medium mt-1 flex items-center gap-1">
            🎉 Coupon applied! Saved ₹{couponDiscount.toFixed(2)}
          </p>
        )}
      </div>

      {/* Price breakdown */}
      <div className="p-4 border-t border-border bg-muted/20 space-y-1.5 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>GST (5%)</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Service Charge (2%)</span>
          <span>₹{serviceCharge.toFixed(2)}</span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Discount</span>
            <span>-₹{couponDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-foreground font-bold text-sm pt-2 border-t border-border mt-1">
          <span>Total Payable</span>
          <span className="text-primary font-extrabold text-base">₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout button */}
      <div className="p-4 border-t border-border">
        <Button
          onClick={() => placeOrder.mutate()}
          loading={placeOrder.isPending}
          className="w-full h-11 text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition"
        >
          <span>Confirm & Place Order</span>
          <ArrowRight size={16} />
        </Button>
        <p className="text-[10px] text-center text-muted-foreground mt-2">
          Pay at Counter or Cash on Delivery supported
        </p>
      </div>
    </div>
  );
}
