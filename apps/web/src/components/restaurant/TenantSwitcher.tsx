'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown, Check, Plus, Store, Sparkles } from 'lucide-react';
import { multiTenantEngine, TenantRestaurant } from '@/lib/multi-tenant-engine';
import Link from 'next/link';

export function TenantSwitcher() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [restaurants, setRestaurants] = useState<TenantRestaurant[]>([]);
  const [activeRestaurant, setActiveRestaurant] = useState<TenantRestaurant | null>(null);

  const loadData = () => {
    const list = multiTenantEngine.getRestaurants();
    const current = multiTenantEngine.getActiveRestaurant();
    setRestaurants(list);
    setActiveRestaurant(current);
  };

  useEffect(() => {
    loadData();
    const handleSwitch = () => loadData();
    window.addEventListener('tenant_switched', handleSwitch);
    window.addEventListener('tenant_state_updated', handleSwitch);
    return () => {
      window.removeEventListener('tenant_switched', handleSwitch);
      window.removeEventListener('tenant_state_updated', handleSwitch);
    };
  }, []);

  const selectRestaurant = (slug: string) => {
    multiTenantEngine.setActiveSlug(slug);
    setIsOpen(false);
    loadData();
    router.refresh();
  };

  if (!activeRestaurant) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-2 rounded-xl bg-card border border-border/80 hover:border-primary/50 text-left transition shadow-xs w-full max-w-[240px]"
      >
        <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-muted border border-border">
          {activeRestaurant.branding.logoUrl ? (
            <Image
              src={activeRestaurant.branding.logoUrl}
              alt={activeRestaurant.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-xs text-primary">
              <Store size={14} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-extrabold text-foreground truncate">{activeRestaurant.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{activeRestaurant.cuisine || 'Restaurant Operations'}</p>
        </div>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-card border border-border shadow-xl z-50 p-2 space-y-1 backdrop-blur-md">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between border-b border-border/60 mb-1">
              <span>Switch Restaurant Tenant</span>
              <span className="text-primary flex items-center gap-1 font-semibold">
                <Sparkles size={11} /> Multi-Tenant
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {restaurants.map((r) => {
                const isSelected = r.slug === activeRestaurant.slug;
                return (
                  <button
                    key={r.id}
                    onClick={() => selectRestaurant(r.slug)}
                    className={`flex items-center justify-between w-full p-2.5 rounded-xl text-left transition ${
                      isSelected
                        ? 'bg-primary/10 border border-primary/20 text-primary font-bold'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 bg-muted border border-border/60">
                        {r.branding.logoUrl ? (
                          <Image src={r.branding.logoUrl} alt={r.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-[10px]">
                            {r.name.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{r.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{r.cuisine || r.city}</p>
                      </div>
                    </div>
                    {isSelected && <Check size={14} className="text-primary flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-border/60">
              <Link
                href="/admin/restaurants/new"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 w-full p-2 rounded-xl text-xs font-bold text-primary hover:bg-primary/10 transition"
              >
                <Plus size={14} />
                <span>Onboard New Restaurant</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
