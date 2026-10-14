'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { QrCode, Plus, ExternalLink, Printer, CheckCircle2 } from 'lucide-react';

interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  qrTokens?: Array<{ token: string }>;
}

export default function TablesPage() {
  const queryClient = useQueryClient();
  const [tableNumber, setTableNumber] = useState('');
  const [activeQr, setActiveQr] = useState<{ tableNumber: string; dataUrl: string; token: string } | null>(null);

  const { data: tenantData } = useQuery({
    queryKey: ['tenant-tables'],
    queryFn: async () => {
      try {
        const res = await api.resolveTenant();
        return (res.data?.data ?? res.data) as { slug: string; name: string };
      } catch {
        return null;
      }
    },
  });

  const { data: tables } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      try {
        const res = await api.getTables();
        const raw = res.data?.data ?? res.data;
        return (Array.isArray(raw) ? raw : []) as Table[];
      } catch {
        return [];
      }
    },
  });

  const createTable = useMutation({
    mutationFn: (num: string) => api.createTable({ tableNumber: num, capacity: 4 }),
    onSuccess: () => {
      setTableNumber('');
      void queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  const generateQr = useMutation({
    mutationFn: (tableId: string) => api.generateQr(tableId),
    onSuccess: (res) => {
      const data = (res.data?.data ?? res.data) as { qrCodeDataUrl: string; tableNumber: string; token: string };
      setActiveQr({ tableNumber: data.tableNumber, dataUrl: data.qrCodeDataUrl, token: data.token });
    },
  });

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Tables & Smart QR Flow</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
          Generate HMAC-signed cryptographic QR codes for instant contactless ordering
        </p>
      </div>

      {/* Add New Table */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Add Dining Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 max-w-sm">
            <Input
              placeholder="Table # (e.g. 9, VIP-1, Patio-2)..."
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="rounded-xl h-10 text-xs"
            />
            <Button
              onClick={() => createTable.mutate(tableNumber)}
              loading={createTable.isPending}
              disabled={!tableNumber.trim()}
              className="rounded-xl h-10 px-4 text-xs font-bold"
            >
              <Plus size={15} className="mr-1" /> Add Table
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables?.map((t) => (
          <Card key={t.id} className="border-border/80 hover:border-primary/40 transition shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-extrabold">Table {t.tableNumber}</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <QrCode size={18} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Capacity: {t.capacity} guests</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Ready
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full rounded-xl text-xs font-bold h-9 gap-1.5"
                onClick={() => generateQr.mutate(t.id)}
                loading={generateQr.isPending}
              >
                <QrCode size={14} /> Generate / View QR
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* QR Code Modal / Showcase Card */}
      {activeQr && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border-2 border-primary rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-3">
              <span>{tenantData?.name ?? 'Restaurant'}</span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight mb-1">
              Table {activeQr.tableNumber}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Scan with smartphone camera to open the menu
            </p>

            <div className="relative w-52 h-52 mx-auto mb-5 p-3 bg-white rounded-2xl border-2 border-border shadow-inner">
              <Image src={activeQr.dataUrl} alt="Table QR Code" fill className="object-contain p-2" />
            </div>

            <div className="space-y-2">
              <a
                href={`/qr/${activeQr.token}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full bg-primary text-primary-foreground font-bold text-xs h-10 rounded-xl shadow-sm hover:opacity-95 transition"
              >
                <span>Test Live QR Flow (New Tab)</span>
                <ExternalLink size={14} />
              </a>

              <Button
                variant="outline"
                className="w-full rounded-xl text-xs font-bold h-10"
                onClick={() => window.print()}
              >
                <Printer size={14} className="mr-1.5" /> Print Table Standee
              </Button>

              <button
                onClick={() => setActiveQr(null)}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold pt-2"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
