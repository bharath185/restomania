'use client';
import { Toaster } from '@/components/ui/Toaster';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
