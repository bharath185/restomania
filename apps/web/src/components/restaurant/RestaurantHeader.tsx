'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, Clock, MapPin, CheckCircle2, ShieldCheck, Utensils } from 'lucide-react';
import type { RestaurantBranding } from '@repo/shared';
import { RESTAURANT_COVERS } from '@/lib/food-images';

interface Props {
  name: string;
  branding: RestaurantBranding | null;
  tableNumber?: string | null;
}

const DEMO_RESTAURANTS = [
  { slug: 'spicegarden', name: 'Spice Garden', icon: '🌶️', desc: 'Indian Royal Heritage' },
  { slug: 'burgerlab', name: 'The Burger Lab', icon: '🍔', desc: 'Artisanal Smash Burgers' },
  { slug: 'zensushi', name: 'Zen Sushi', icon: '🍣', desc: 'Tokyo Omakase & Rolls' },
];

export function RestaurantHeader({ name, branding, tableNumber }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLocal(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    }
  }, []);

  const switchTenant = (slug: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tenant_slug', slug);
      const params = new URLSearchParams(window.location.search);
      params.set('restaurant', slug);
      router.push(`?${params.toString()}`);
      window.location.reload();
    }
  };

  const currentSlug = searchParams.get('restaurant') || searchParams.get('tenant') || 'spicegarden';
  const coverPreset = RESTAURANT_COVERS[currentSlug] ?? RESTAURANT_COVERS['spicegarden'];

  const coverUrl: string = branding?.coverImageUrl || coverPreset?.cover || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80';
  const logoUrl = branding?.logoUrl || coverPreset?.logo;
  const tagline = branding?.tagline || coverPreset?.tagline;

  return (
    <div className="w-full">
      {/* Localhost Multi-Tenant Switcher Toolbar */}
      {isLocal && (
        <div className="bg-zinc-950 text-zinc-200 border-b border-zinc-800 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-zinc-400 font-medium">🏢 SaaS Multi-Tenant Live Switcher:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {DEMO_RESTAURANTS.map((t) => {
              const isSelected = currentSlug === t.slug;
              return (
                <button
                  key={t.slug}
                  onClick={() => switchTenant(t.slug)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/40'
                      : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
            <div className="flex-1 text-foreground">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-sm">
                  {name}
                </h1>
                <span title="Verified Restaurant" className="text-primary">
                  <CheckCircle2 size={22} className="fill-primary text-background" />
                </span>
                <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full text-xs font-bold">
                  <Star size={12} className="fill-current" /> {coverPreset?.rating ?? '4.9'}
                  <span className="opacity-75 font-normal">({coverPreset?.reviews ?? '1,200+'})</span>
                </span>
              </div>

              {tagline && (
                <p className="text-sm sm:text-base text-muted-foreground mt-1 max-w-2xl font-medium">
                  {tagline}
                </p>
              )}

              {/* Status and features bar */}
              <div className="flex items-center gap-3 sm:gap-6 mt-3 text-xs text-muted-foreground font-medium flex-wrap">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
                  Open Now • Dine-in & Takeaway
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={13} /> {coverPreset?.prepTime ?? '20-30 min'}
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-primary" /> FSSAI / GST Registered
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      {branding?.welcomeText && (
        <div className="bg-primary/10 border-y border-primary/20 py-2.5 px-4 text-center">
          <p className="text-xs sm:text-sm font-semibold text-primary">
            ✨ {branding.welcomeText}
          </p>
        </div>
      )}
    </div>
  );
}
