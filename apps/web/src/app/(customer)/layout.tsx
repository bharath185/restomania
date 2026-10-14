import React, { Suspense } from 'react';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </div>
  );
}
