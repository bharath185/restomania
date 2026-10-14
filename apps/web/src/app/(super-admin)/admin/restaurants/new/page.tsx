'use client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface OnboardForm {
  name: string; slug: string; ownerName: string; ownerEmail: string;
  tableCount: number; taxRate: number;
}

export default function OnboardRestaurantPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<OnboardForm>({
    defaultValues: { tableCount: 5, taxRate: 5 }
  });

  const onboard = useMutation({
    mutationFn: (data: OnboardForm) => api.onboardRestaurant(data),
    onSuccess: () => void router.push('/admin'),
  });

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Onboard New Restaurant</h1>
      <form onSubmit={handleSubmit((d) => onboard.mutate(d))} className="space-y-4">
        <Input placeholder="Restaurant Name" {...register('name', { required: true })} />
        <Input placeholder="Slug (e.g. mypizza)" {...register('slug', { required: true })} />
        <Input placeholder="Owner Name" {...register('ownerName', { required: true })} />
        <Input type="email" placeholder="Owner Email" {...register('ownerEmail', { required: true })} />
        <Input type="number" placeholder="Number of Tables" {...register('tableCount', { valueAsNumber: true })} />
        <Input type="number" placeholder="Tax Rate (%)" {...register('taxRate', { valueAsNumber: true })} />
        {onboard.isError && (
          <p className="text-red-500 text-sm">
            {(onboard.error as any)?.response?.data?.error?.message || (onboard.error as any)?.message || 'Failed to onboard. Check details and retry.'}
          </p>
        )}
        <Button type="submit" className="w-full" loading={onboard.isPending}>
          Create Restaurant
        </Button>
      </form>
    </div>
  );
}
