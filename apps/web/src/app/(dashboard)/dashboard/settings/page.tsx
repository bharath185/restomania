'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { RestaurantBranding } from '@repo/shared';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [primaryColor, setPrimaryColor] = useState('#FF6B35');
  const [secondaryColor, setSecondaryColor] = useState('#2C3E50');
  const [welcomeText, setWelcomeText] = useState('');

  const { data: branding } = useQuery({
    queryKey: ['branding-settings'],
    queryFn: async () => {
      const res = await api.getBranding();
      return (res.data?.data ?? res.data) as unknown as RestaurantBranding;
    },
  });

  useEffect(() => {
    if (branding) {
      if (branding.primaryColor) setPrimaryColor(branding.primaryColor);
      if (branding.secondaryColor) setSecondaryColor(branding.secondaryColor);
      if (branding.welcomeText) setWelcomeText(branding.welcomeText);
    }
  }, [branding]);

  const updateBranding = useMutation({
    mutationFn: () =>
      api.updateBranding({
        primaryColor,
        secondaryColor,
        welcomeText,
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['branding-settings'] }),
  });

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">White-Label Branding Settings</h1>
        <p className="text-muted-foreground text-sm">Customize colors and text displayed to your customers</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Brand Colors</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium w-32">Primary Color</label>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-10 w-16 rounded border border-border cursor-pointer"
            />
            <span className="text-sm font-mono">{primaryColor}</span>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium w-32">Secondary Color</label>
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="h-10 w-16 rounded border border-border cursor-pointer"
            />
            <span className="text-sm font-mono">{secondaryColor}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Customer Welcome Message</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Welcome message..."
            value={welcomeText}
            onChange={(e) => setWelcomeText(e.target.value)}
          />
          <Button
            onClick={() => updateBranding.mutate()}
            loading={updateBranding.isPending}
          >
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
