'use client';
import { useEffect } from 'react';
import type { RestaurantBranding } from '@repo/shared';

interface ThemeProviderProps {
  branding: RestaurantBranding | null;
  children: React.ReactNode;
}

function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0 0% 50%';

  let r = parseInt(result[1] ?? '0', 16) / 255;
  let g = parseInt(result[2] ?? '0', 16) / 255;
  let b = parseInt(result[3] ?? '0', 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function ThemeProvider({ branding, children }: ThemeProviderProps) {
  useEffect(() => {
    if (!branding) return;

    const root = document.documentElement;
    if (branding.primaryColor) root.style.setProperty('--color-primary', hexToHsl(branding.primaryColor));
    if (branding.secondaryColor) root.style.setProperty('--color-secondary', hexToHsl(branding.secondaryColor));
    if (branding.accentColor) root.style.setProperty('--color-accent', hexToHsl(branding.accentColor));
    if (branding.fontFamily) root.style.setProperty('--font-family', `'${branding.fontFamily}', system-ui, sans-serif`);
    if (branding.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [branding]);

  return <>{children}</>;
}
