'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag,
  BarChart3, Users, Settings, QrCode,
  ChefHat, LogOut, Tag, ExternalLink, ShieldCheck,
  Building2, Sparkles, Menu, X
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { TenantSwitcher } from '@/components/restaurant/TenantSwitcher';
import { multiTenantEngine } from '@/lib/multi-tenant-engine';
import type { RestaurantBranding } from '@repo/shared';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Executive Overview' },
  { href: '/dashboard/orders', icon: ShoppingBag, label: 'Live Orders Kanban' },
  { href: '/dashboard/kitchen', icon: ChefHat, label: 'Kitchen Screen (KDS)' },
  { href: '/dashboard/menu', icon: UtensilsCrossed, label: 'Dishes & Inventory' },
  { href: '/dashboard/tables', icon: QrCode, label: 'Tables & QR Codes' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Revenue Analytics' },
  { href: '/dashboard/staff', icon: Users, label: 'Staff & Team Roles' },
  { href: '/dashboard/coupons', icon: Tag, label: 'Discounts & Promos' },
  { href: '/dashboard/settings', icon: Settings, label: 'Branding & Store' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: tenantData, refetch } = useQuery({
    queryKey: ['tenant-dashboard'],
    queryFn: async () => {
      try {
        const res = await api.resolveTenant();
        return (res.data?.data ?? res.data) as {
          id: string;
          name: string;
          slug: string;
          branding: RestaurantBranding | null;
        };
      } catch {
        const r = multiTenantEngine.getActiveRestaurant();
        return {
          id: r.id,
          name: r.name,
          slug: r.slug,
          branding: r.branding,
        };
      }
    },
  });

  useEffect(() => {
    const handleSwitch = () => {
      void refetch();
    };
    window.addEventListener('tenant_switched', handleSwitch);
    return () => window.removeEventListener('tenant_switched', handleSwitch);
  }, [refetch]);

  const handleLogout = async () => {
    await api.logout();
    clearAuth();
    void router.push('/auth/login');
  };

  const customerMenuUrl = tenantData?.slug ? `/menu?restaurant=${tenantData.slug}` : '/menu';

  return (
    <ThemeProvider branding={tenantData?.branding ?? null}>
      <div className="flex h-screen bg-muted/20 text-foreground overflow-hidden">
        {/* Full-Height Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col shadow-sm flex-shrink-0">
          <div className="p-4 border-b border-border bg-muted/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary flex items-center gap-1">
                <Sparkles size={11} /> Restomania OS
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                Multi-Tenant
              </span>
            </div>
            {/* Restaurant Tenant Switcher */}
            <TenantSwitcher />
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </Link>
              );
            })}

            {user?.role === 'super_admin' && (
              <div className="pt-3 mt-3 border-t border-border">
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition"
                >
                  <Building2 size={17} />
                  <span>Super Admin Portal</span>
                </Link>
              </div>
            )}
          </nav>

          <div className="p-3 border-t border-border space-y-1 bg-muted/10">
            <Link
              href={customerMenuUrl}
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-primary hover:bg-primary/10 transition"
            >
              <span>View Customer Menu</span>
              <ExternalLink size={13} />
            </Link>

            <button
              onClick={() => void handleLogout()}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full transition"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header */}
          <header className="h-16 border-b border-border bg-card/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-extrabold text-foreground">
                  {tenantData?.name ?? 'Restaurant'} Operations
                </span>
                <span className="hidden sm:inline-block text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border/60">
                  Zero-Gateway Direct Settlement
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <TenantSwitcher />
              </div>
              <Link
                href={customerMenuUrl}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-primary text-primary-foreground px-3.5 py-1.5 rounded-xl shadow-xs hover:opacity-90 transition"
              >
                <span>Live Menu</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-muted/20">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
