'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import Link from 'next/link';
import { CheckCircle, Clock, ChefHat, Bell, Utensils, ArrowLeft, Receipt, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import type { Order, OrderStatus, RestaurantBranding } from '@repo/shared';
import { WS_EVENTS } from '@repo/shared';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Button } from '@/components/ui/Button';

const STATUS_STEPS = [
  { status: 'placed', label: 'Order Received', desc: 'Sent to restaurant kitchen', icon: CheckCircle },
  { status: 'accepted', label: 'Accepted by Kitchen', desc: 'Chef confirmed your order', icon: Bell },
  { status: 'preparing', label: 'Cooking & Preparing', desc: 'Fresh ingredients on the fire', icon: ChefHat },
  { status: 'ready', label: 'Order Ready', desc: 'Plated and ready to be served', icon: Clock },
  { status: 'served', label: 'Served / Completed', desc: 'Enjoy your meal!', icon: Utensils },
] as const;

export default function OrderTrackingPage() {
  const { id } = useParams() as { id: string };
  const [liveStatus, setLiveStatus] = useState<OrderStatus | null>(null);

  const { data: tenantData } = useQuery({
    queryKey: ['tenant-order'],
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

  const { data: order } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await api.getOrder(id);
      return (res.data?.data ?? res.data) as Order;
    },
    refetchInterval: 6000,
  });

  const currentStatus = (liveStatus ?? order?.status ?? 'placed') as string;
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.status === currentStatus);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3001';
    const socket: Socket = io(wsUrl + '/kitchen');

    if (order?.restaurantId) {
      socket.emit(WS_EVENTS.SUBSCRIBE_ROOM, { restaurantId: order.restaurantId });
    }
    socket.on(WS_EVENTS.ORDER_STATUS, (data: { orderId: string; status: OrderStatus }) => {
      if (data.orderId === id) setLiveStatus(data.status);
    });

    return () => { socket.disconnect(); };
  }, [id, order?.restaurantId]);

  if (!order) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full border-3 border-primary border-t-transparent h-12 w-12" />
      </div>
    );
  }

  const isCancelled = currentStatus === 'cancelled';

  return (
    <ThemeProvider branding={tenantData?.branding ?? null}>
      <div className="min-h-screen bg-muted/20 text-foreground py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition bg-card border border-border px-3.5 py-2 rounded-xl shadow-xs"
            >
              <ArrowLeft size={15} />
              <span>Order More Items</span>
            </Link>
            <div className="text-right">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                Live Status Tracker
              </span>
            </div>
          </div>

          {/* Hero Order Status Banner */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm mb-8 text-center relative overflow-hidden">
            <div className="text-5xl mb-3">
              {isCancelled ? '❌' : currentStatus === 'served' ? '🎉' : '👨‍🍳'}
            </div>
            <div className="inline-flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-xs font-mono font-bold text-muted-foreground mb-2">
              <span>{order.orderNumber}</span>
              <span>•</span>
              <span className="capitalize">{order.orderType.replace('_', ' ')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isCancelled
                ? 'Order Cancelled'
                : currentStatus === 'served'
                ? 'Order Served! Enjoy your food'
                : currentStatus === 'ready'
                ? 'Your Food is Ready!'
                : currentStatus === 'preparing'
                ? 'The Kitchen is Cooking your order'
                : 'Order Accepted & Queued'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              {currentStatus === 'served'
                ? 'Thank you for dining with us! We hope you loved your meal.'
                : 'Status updates live in real-time as the chefs progress.'}
            </p>

            {order.estimatedTime && currentStatus !== 'served' && !isCancelled && (
              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary font-bold text-sm px-4 py-1.5 rounded-full mt-4">
                <Clock size={16} /> Est. {order.estimatedTime} minutes remaining
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Cols: Progress Tracker */}
            <div className="lg:col-span-7 bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="font-bold text-base mb-6 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-primary" />
                <span>Live Kitchen Progression</span>
              </h2>

              {!isCancelled ? (
                <div className="relative pl-2 space-y-6">
                  {STATUS_STEPS.map((step, i) => {
                    const isCompleted = i <= currentStepIndex;
                    const isActive = i === currentStepIndex;
                    const Icon = step.icon;
                    return (
                      <div key={step.status} className="flex items-start gap-4 relative">
                        {/* Connecting Line */}
                        {i < STATUS_STEPS.length - 1 && (
                          <div
                            className={`absolute left-[19px] top-10 w-0.5 h-10 transition-colors ${
                              i < currentStepIndex ? 'bg-primary' : 'bg-border'
                            }`}
                          />
                        )}

                        {/* Step Icon */}
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                            isCompleted
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'bg-muted text-muted-foreground'
                          } ${isActive ? 'ring-4 ring-primary/20 scale-110' : ''}`}
                        >
                          <Icon size={18} />
                        </div>

                        {/* Step Content */}
                        <div className="pt-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-bold text-sm ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {step.label}
                            </p>
                            {isActive && (
                              <span className="text-[10px] bg-primary/15 text-primary font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                Live
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm">
                  This order has been cancelled. Please speak to our staff if you have questions.
                </div>
              )}
            </div>

            {/* Right 5 Cols: Receipt Card */}
            <div className="lg:col-span-5 bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Receipt size={16} className="text-primary" />
                  <span>Order Receipt</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{order.orderNumber}</span>
              </div>

              {/* Items */}
              <div className="divide-y divide-border/60 text-xs">
                {order.items.map((item) => (
                  <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">{item.itemName}</p>
                      <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-foreground">₹{Number(item.totalPrice).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="pt-3 border-t border-border space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{Number(order.taxAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Charge (2%)</span>
                  <span>₹{Number(order.serviceCharge).toFixed(2)}</span>
                </div>
                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Discount</span>
                    <span>-₹{Number(order.discountAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-base text-foreground pt-2 border-t border-border">
                  <span>Total Amount</span>
                  <span className="text-primary text-lg">₹{Number(order.totalAmount).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Link href="/menu">
                  <Button variant="outline" className="w-full rounded-xl font-bold text-xs h-10">
                    <Utensils size={14} className="mr-1.5" /> Order More Dishes
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground text-center">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>GST Verified Order Receipt</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
