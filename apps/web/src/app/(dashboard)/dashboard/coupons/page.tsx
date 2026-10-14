'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tag, Plus } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  isActive: boolean;
  usedCount: number;
}

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderValue, setMinOrderValue] = useState(100);

  const { data: coupons } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const res = await api.getCoupons();
      return res.data.data as Coupon[];
    },
  });

  const createCoupon = useMutation({
    mutationFn: () =>
      api.createCoupon({
        code,
        discountType,
        discountValue,
        minOrderValue,
      }),
    onSuccess: () => {
      setCode('');
      void queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Coupons & Offers</h1>
        <p className="text-muted-foreground text-sm">Create promo codes for your restaurant</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Create Coupon</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <Input placeholder="Code (e.g. SAVE20)" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
            <select
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
            <Input
              type="number"
              placeholder="Discount Value"
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
            />
            <Input
              type="number"
              placeholder="Min Order (₹)"
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(Number(e.target.value))}
            />
          </div>
          <Button
            onClick={() => createCoupon.mutate()}
            loading={createCoupon.isPending}
            disabled={!code.trim()}
          >
            <Plus size={16} className="mr-1" /> Create Coupon
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons?.map((c) => (
          <Card key={c.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold">{c.code}</CardTitle>
              <Tag className="text-primary" size={18} />
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-sm font-semibold text-primary">
                {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
              </p>
              <p className="text-xs text-muted-foreground">Min order: ₹{c.minOrderValue}</p>
              <Badge variant="secondary" className="mt-2 text-xs">Used {c.usedCount} times</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
