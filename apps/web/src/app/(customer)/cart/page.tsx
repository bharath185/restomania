'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ArrowLeft, Plus, Minus, Tag, Utensils, Check, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { ThemeProvider } from '@/providers/ThemeProvider';
import type { RestaurantBranding } from '@repo/shared';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'razorpay'>('cash');
  const [specialNotes, setSpecialNotes] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);

  const { data: tenantData } = useQuery({
    queryKey: ['tenant-cart'],
    queryFn: async () => {
      try {
        const res = await api.resolveTenant();
        return (res.data?.data ?? res.data) as {
          name: string;
          branding: RestaurantBranding | null;
        };
      } catch {
        return null;
      }
    },
  });

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
        paymentMethod,
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
      <ThemeProvider branding={tenantData?.branding ?? null}>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-muted/20 text-center">
          <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center text-4xl mb-4 shadow-sm">
            🛒
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Your Cart is Empty</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm">
            Explore {tenantData?.name ?? 'our'} fresh menu and add your favorite dishes.
          </p>
          <Link href="/menu">
            <Button className="h-11 px-8 rounded-xl font-bold shadow-md">
              <ArrowLeft size={16} className="mr-2" /> Browse Full Menu
            </Button>
          </Link>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider branding={tenantData?.branding ?? null}>
      <div className="min-h-screen bg-muted/20 text-foreground py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition bg-card border border-border px-4 py-2 rounded-xl shadow-xs"
            >
              <ArrowLeft size={16} />
              <span>Back to Menu</span>
            </Link>
            <div className="text-right">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Checkout & Order</h1>
              <p className="text-xs text-muted-foreground">{tenantData?.name ?? 'Restaurant'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Cols: Items List */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                  <h2 className="text-base font-bold flex items-center gap-2">
                    <Utensils size={18} className="text-primary" />
                    <span>Order Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-xs text-destructive hover:underline flex items-center gap-1 font-medium"
                  >
                    <Trash2 size={13} /> Clear all
                  </button>
                </div>

                <div className="divide-y divide-border/60">
                  {items.map((item) => (
                    <div key={item.itemId} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                      {item.imageUrl && (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-border/60 bg-muted">
                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-foreground text-sm truncate">{item.name}</h4>
                        <div className="text-xs text-primary font-bold mt-0.5">
                          ₹{Number(item.price).toFixed(2)}
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2 bg-muted rounded-xl p-1 border border-border/50">
                        <button
                          onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition text-muted-foreground hover:text-foreground"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition text-muted-foreground hover:text-foreground"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <span className="font-extrabold text-sm text-foreground">
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cooking Instructions */}
              <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold mb-2">Special Instructions for Chef</h3>
                <Input
                  placeholder="e.g. less oil, extra spicy, no onions, pack sauces separately..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
            </div>

            {/* Right 5 Cols: Order Options & Summary */}
            <div className="lg:col-span-5 space-y-6">
              {/* Dining Mode & Payment Card */}
              <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                    Dining Option
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType('dine_in')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        orderType === 'dine_in'
                          ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Utensils size={15} /> Dine-In Table
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('takeaway')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        orderType === 'takeaway'
                          ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      🥡 Takeaway / Parcel
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        paymentMethod === 'cash'
                          ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Banknote size={15} /> Cash at Counter
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('razorpay')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        paymentMethod === 'razorpay'
                          ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <CreditCard size={15} /> UPI / Online
                    </button>
                  </div>
                </div>

                {/* Coupon Code */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                    Promo Coupon
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponSuccess(false);
                        }}
                        className="pl-9 uppercase text-xs rounded-xl h-10"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => validateCoupon.mutate()}
                      loading={validateCoupon.isPending}
                      disabled={!couponCode.trim()}
                      className="rounded-xl h-10 text-xs font-bold px-4"
                    >
                      {couponSuccess ? <Check size={14} className="text-green-600" /> : 'Apply'}
                    </Button>
                  </div>
                  {couponSuccess && couponDiscount > 0 && (
                    <p className="text-xs text-green-600 font-semibold mt-1.5 flex items-center gap-1">
                      🎉 Coupon verified! You saved ₹{couponDiscount.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 border-t border-border space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Items Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST (5%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Restaurant Service Charge (2%)</span>
                    <span>₹{serviceCharge.toFixed(2)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-bold">
                      <span>Discount</span>
                      <span>-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-base text-foreground pt-3 border-t border-border">
                    <span>Grand Total</span>
                    <span className="text-primary text-xl">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={() => placeOrder.mutate()}
                  loading={placeOrder.isPending}
                  className="w-full h-12 text-sm font-extrabold rounded-xl shadow-lg hover:shadow-xl transition"
                >
                  Place Order (₹{grandTotal.toFixed(0)})
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground text-center">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>Direct order sent to restaurant kitchen</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
