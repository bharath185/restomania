'use client';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeProvider } from '@/providers/ThemeProvider';
import type { RestaurantBranding } from '@repo/shared';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
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
        return null;
      }
    },
  });

  const login = useMutation({
    mutationFn: (data: LoginForm) => api.login(data),
    onSuccess: (res) => {
      const { accessToken, user } = res.data.data as { accessToken: string; user: { id: string; name: string; email: string; role: string; restaurantId: string | null } };
      setAuth(user, accessToken);
      if (['owner', 'manager', 'kitchen', 'waiter'].includes(user.role)) {
        void router.push('/dashboard');
      } else if (user.role === 'super_admin') {
        void router.push('/admin');
      } else {
        void router.push('/menu');
      }
    },
  });

  const fillDemo = (email: string, pass = 'password123') => {
    setValue('email', email);
    setValue('password', pass);
  };

  return (
    <ThemeProvider branding={tenantData?.branding ?? null}>
      <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-8 border border-border">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-3 font-bold text-xl">
              🍳
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {tenantData?.name ? `Sign in to ${tenantData.name}` : 'Sign In'}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Enter your credentials to access your restaurant management portal
            </p>
          </div>

          <form onSubmit={handleSubmit((d) => login.mutate(d))} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Email</label>
              <Input type="email" placeholder="owner@restaurant.com" {...register('email', { required: true })} />
              {errors.email && <p className="text-red-500 text-xs mt-1">Email is required</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Password</label>
              <Input type="password" placeholder="••••••••" {...register('password', { required: true })} />
            </div>
            {login.isError && (
              <p className="text-destructive text-sm text-center">Invalid credentials</p>
            )}
            <Button type="submit" className="w-full h-11 text-base font-semibold" loading={login.isPending}>
              Sign In
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground text-center mb-3">
              ⚡ Quick Demo Logins (1-Click Fill)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemo('owner@spicegarden.com')}
                className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-left transition"
              >
                <div className="font-semibold text-primary">Spice Garden</div>
                <div className="text-[10px] text-muted-foreground">owner@spicegarden.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('owner@burgerlab.com')}
                className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-left transition"
              >
                <div className="font-semibold text-primary">The Burger Lab</div>
                <div className="text-[10px] text-muted-foreground">owner@burgerlab.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('owner@zensushi.com')}
                className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-left transition"
              >
                <div className="font-semibold text-primary">Zen Sushi</div>
                <div className="text-[10px] text-muted-foreground">owner@zensushi.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin@platform.com', 'superadmin123')}
                className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-left transition"
              >
                <div className="font-semibold text-primary">Super Admin</div>
                <div className="text-[10px] text-muted-foreground">admin@platform.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
