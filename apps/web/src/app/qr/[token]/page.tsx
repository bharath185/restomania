import { redirect } from 'next/navigation';

async function verifyQrToken(token: string): Promise<{ restaurantSlug: string; tableId: string | null }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
  const res = await fetch(`${apiUrl}/qr/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Invalid QR token');
  }

  const data = await res.json() as { data: { restaurantSlug: string; tableId: string | null } };
  return data.data;
}

export default async function QrRedirectPage({ params }: { params: { token: string } }) {
  try {
    const { restaurantSlug, tableId } = await verifyQrToken(params.token);
    const destination = `/menu?restaurant=${restaurantSlug}${tableId ? `&table=${tableId}` : ''}`;
    redirect(destination);
  } catch {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold mb-2">Invalid QR Code</h1>
        <p className="text-muted-foreground">This QR code is invalid or has expired. Please ask for a new one.</p>
      </div>
    );
  }
}
