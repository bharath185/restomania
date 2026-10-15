'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Star, Clock, MapPin, CheckCircle2, ShieldCheck, Utensils, Sparkles, Building2, Lock } from 'lucide-react';
import type { RestaurantBranding } from '@repo/shared';
import { RESTAURANT_COVERS } from '@/lib/food-images';
import { multiTenantEngine, TenantRestaurant } from '@/lib/multi-tenant-engine';

interface Props {
  name: string;
  branding: RestaurantBranding | null;
  tableNumber?: string | null;
}

export function RestaurantHeader({ name, branding, tableNumber }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [restaurants, setRestaurants] = useState<TenantRestaurant[]>([]);

  useEffect(() => {
    const list = multiTenantEngine.getRestaurants();
    setRestaurants(list);
    const handleUpdate = () => setRestaurants(multiTenantEngine.getRestaurants());
    window.addEventListener('tenant_state_updated', handleUpdate);
    return () => window.removeEventListener('tenant_state_updated', handleUpdate);
  }, []);

  const switchTenant = (slug: string) => {
    if (typeof window !== 'undefined') {
      multiTenantEngine.setActiveSlug(slug);
      localStorage.setItem('tenant_slug', slug);
      const params = new URLSearchParams(window.location.search);
      params.set('restaurant', slug);
      router.push(`?${params.toString()}`);
      window.location.reload();
    }
  };

  const currentSlug = searchParams.get('restaurant') || searchParams.get('tenant') || multiTenantEngine.getActiveSlug();
  const coverPreset = RESTAURANT_COVERS[currentSlug] ?? RESTAURANT_COVERS['spice-garden'] ?? RESTAURANT_COVERS['spicegarden'];

  const coverUrl: string = branding?.coverImageUrl || coverPreset?.cover || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80';
  const logoUrl = branding?.logoUrl || coverPreset?.logo;
  const tagline = branding?.tagline || coverPreset?.tagline;

  return (
    <div className="w-full">
      {/* Universal Multi-Tenant Brand Switcher Toolbar */}
      <div className="bg-slate-950 text-slate-200 border-b border-slate-800 px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-white flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-400" /> Multi-Tenant Active:
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {restaurants.map((t) => {
            const isSelected = currentSlug === t.slug || currentSlug === t.id;
            return (
              <button
                key={t.id}
                onClick={() => switchTenant(t.slug)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/40'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{t.name}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 px-3 py-1 rounded-xl transition"
          >
            <Lock size={11} />
            <span>Staff / Owner Portal</span>
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl transition"
          >
            <Building2 size={11} />
            <span>Super Admin</span>
          </Link>
        </div>
      </div>

      {/* Cinematic Full-Screen Hero Banner */}
      <div className="relative w-full h-72 sm:h-80 md:h-96 overflow-hidden bg-zinc-900">
        <Image
          src={coverUrl}
          alt={name}
          fill
          priority
          className="object-cover object-center filter brightness-[0.78]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30" />

        {/* Floating Dine-in Table Indicator */}
        {tableNumber && (
          <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md text-white border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-lg">
            <Utensils size={13} className="text-primary" />
            <span>Table {tableNumber}</span>
          </div>
        )}

        {/* Hero Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
            {/* Logo Avatar */}
            {logoUrl && (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-background shadow-2xl bg-card flex-shrink-0">
                <Image src={logoUrl} alt={name} fill className="object-cover" />
              </div>
            )}

            {/* Title & Stats */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                  Open For Orders
                </span>
                <span className="text-xs font-medium text-white/90 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                  <Star size={12} className="text-amber-400 fill-amber-400" /> 4.9 (450+ reviews)
                </span>
                <span className="text-xs font-medium text-white/90 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                  <Clock size={12} /> 20-30 mins
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
                {name}
              </h1>

              {tagline && (
                <p className="text-sm sm:text-base text-white/85 font-medium mt-1 drop-shadow-xs line-clamp-1">
                  {tagline}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
