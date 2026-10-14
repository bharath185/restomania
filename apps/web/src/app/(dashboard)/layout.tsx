'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag,
  BarChart3, Users, Settings, QrCode,
  ChefHat, LogOut, Tag, ExternalLink, ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import { ThemeProvider } from '@/providers/ThemeProvider';
import type { RestaurantBranding } from '@repo/shared';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/orders', icon: ShoppingBag, label: 'Live Orders' },
  { href: '/dashboard/kitchen', icon: ChefHat, label: 'Kitchen Screen' },
  { href: '/dashboard/menu', icon: UtensilsCrossed, label: 'Menu & Dishes' },
  { href: '/dashboard/tables', icon: QrCode, label: 'Tables & QR' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Sales Reports' },
  { href: '/dashboard/staff', icon: Users, label: 'Staff Roles' },
  { href: '/dashboard/coupons', icon: Tag, label: 'Coupons' },
  { href: '/dashboard/settings', icon: Settings, label: 'Branding & Hours' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const { data: tenantData } = useQuery({
    queryKey: ['tenant-dashboard'],
    queryFn: async () => {
      try {
        const res = await api.resolveTenant();
        return (res.data?.data ?? res.data) as {
          name: string;
          slug: string;
          branding: RestaurantBranding | null;
        };
      } catch {
        return null;
      }
    },
  });

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
        <aside className="w-64 bg-card border-r border-border flex flex-col shadow-sm flex-shrink-0">
          <div className="p-5 border-b border-border bg-muted/10">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <h2 className="font-extrabold text-base text-foreground truncate">
                {tenantData?.name ?? 'Restaurant Hub'}
              </h2>
            </div>
            <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>{user?.name ?? 'Manager'} ({user?.role ?? 'Owner'})</span>
            </p>
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
          </nav>

          <div className="p-3 border-t border-border space-y-1 bg-muted/10">
            <Link
              href={customerMenuUrl}
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-primary hover:bg-primary/10 transition"
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

        {/* Main Content View with Top Action Header */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between flex-shrink-0 z-10">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-foreground">
                {tenantData?.name ?? 'Restaurant'} Operations Portal
              </span>
            </div>
            <div className="flex items-center gap-3">
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
