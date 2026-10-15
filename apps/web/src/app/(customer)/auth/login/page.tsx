'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck, Lock, Mail, Eye, EyeOff,
  ChefHat, Sparkles, Building2, Store, ArrowRight,
  CheckCircle2, Compass
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { multiTenantEngine } from '@/lib/multi-tenant-engine';
import type { RestaurantBranding } from '@repo/shared';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'restaurant' | 'admin'>('restaurant');
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>();

  const { data: tenantData } = useQuery({
    queryKey: ['tenant-login'],
    queryFn: async () => {
      try {
        const res = await api.resolveTenant();
        return (res.data?.data ?? res.data) as {
          name: string;
          branding: RestaurantBranding | null;
        };
      } catch {
        const r = multiTenantEngine.getActiveRestaurant();
        return {
          name: r.name,
          branding: r.branding,
        };
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => api.login(data),
    onSuccess: (res) => {
      const payload = res.data?.data ?? res.data;
      const { accessToken, user } = payload as {
        accessToken: string;
        user: { id: string; name: string; email: string; role: string; restaurantId: string | null };
      };
      setAuth(user, accessToken);
      if (user.role === 'super_admin') {
        void router.push('/admin');
      } else {
        void router.push('/dashboard');
      }
    },
  });

  const fillQuickDemo = (email: string, pass = 'password123', tab: 'restaurant' | 'admin' = 'restaurant') => {
    setActiveTab(tab);
    setValue('email', email);
    setValue('password', pass);
  };

  const restaurants = multiTenantEngine.getRestaurants();

  return (
    <ThemeProvider branding={tenantData?.branding ?? null}>
      <div className="min-h-screen flex text-foreground bg-background">
        {/* Left Side: Cinematic Editorial Luxury Brand Showcase (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 flex-col justify-between p-12 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1600&auto=format&fit=crop&q=85"
              alt="Culinary Ambiance"
              fill
              className="object-cover opacity-35 filter brightness-75 contrast-125"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />
          </div>

          {/* Top Brand Identity */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-bold tracking-wide mb-6">
              <Sparkles size={13} className="text-amber-400" />
              <span>Restomania Enterprise OS</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-tight">
              Unified Multi-Tenant <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-rose-400">
                Hospitality Platform
              </span>
            </h1>
            <p className="mt-4 text-sm text-slate-300 max-w-md leading-relaxed font-medium">
              Empower independent restaurant brands to control dish inventory, live kitchen orders, and table operations under a single high-performance architecture.
            </p>
          </div>

          {/* Highlight Cards */}
          <div className="relative z-10 space-y-4 max-w-md">
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 font-bold">
                <Store size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold">Complete Tenant Isolation</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Every restaurant runs autonomous dishes, custom branding palettes, tables, and live order queues.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold">Zero-Gateway Direct Settlement</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Direct cash, counter billing, and instant table UPI QR without third-party payment gateway failures or commissions.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Security Assurance */}
          <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>End-to-End Multi-Tenant Security & Role-Based Access Control</span>
          </div>
        </div>

        {/* Right Side: Sleek Professional Authentication Portal */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-card">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-2 text-primary font-black text-xl">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <ChefHat size={22} />
                  </div>
                  <span>Restomania</span>
                </div>
                <Link
                  href="/menu"
                  className="text-xs text-muted-foreground hover:text-primary font-bold flex items-center gap-1 transition"
                >
                  <span>Customer Menu</span>
                  <Compass size={13} />
                </Link>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {activeTab === 'restaurant' ? 'Restaurant Portal Sign In' : 'Platform Super Admin'}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Enter your executive credentials to manage restaurant operations
              </p>
            </div>

            {/* Role Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-2xl border border-border/60">
              <button
                type="button"
                onClick={() => setActiveTab('restaurant')}
                className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'restaurant'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Store size={14} />
                <span>Restaurant Manager</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building2 size={14} />
                <span>Super Admin</span>
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit((d) => loginMutation.mutate(d))} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder={activeTab === 'restaurant' ? 'owner@spicegarden.com' : 'admin@platform.com'}
                    className="pl-10 h-11 rounded-xl text-xs sm:text-sm"
                    {...register('email', { required: true })}
                  />
                </div>
                {errors.email && <p className="text-destructive text-xs mt-1">Email is required</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Password
                  </label>
                  <span className="text-[11px] text-primary hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    className="pl-10 pr-10 h-11 rounded-xl text-xs sm:text-sm"
                    {...register('password', { required: true })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary" />
                  <span>Remember this workstation</span>
                </label>
              </div>

              {loginMutation.isError && (
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20 text-center">
                  Authentication failed. Please verify credentials.
                </div>
              )}

              <Button
                type="submit"
                loading={loginMutation.isPending}
                className="w-full h-11 text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition gap-2"
              >
                <span>Sign In to Dashboard</span>
                <ArrowRight size={15} />
              </Button>
            </form>

            {/* 1-Click Fast Demo Credentials Switcher */}
            <div className="pt-6 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  ⚡ 1-Click Fast Evaluator Logins
                </span>
                <span className="text-[10px] text-primary font-semibold">Auto-Fill</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {restaurants.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => fillQuickDemo(r.ownerEmail, 'password123', 'restaurant')}
                    className="p-2.5 rounded-xl border border-border/80 bg-background hover:bg-muted/80 text-left transition group shadow-2xs"
                  >
                    <div className="font-bold text-foreground group-hover:text-primary transition truncate">
                      {r.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">{r.ownerEmail}</div>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => fillQuickDemo('admin@platform.com', 'superadmin123', 'admin')}
                  className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-left transition group shadow-2xs col-span-2"
                >
                  <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center justify-between">
                    <span>👑 Super Administrator</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500/20 px-1.5 py-0.5 rounded">Platform</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">admin@platform.com (Onboard restaurants, branding)</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
