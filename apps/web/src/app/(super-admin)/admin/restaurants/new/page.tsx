'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, Building2, Sparkles, Check, Store, Palette,
  Globe, Shield, ChefHat, Eye, Upload, Utensils
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

const PRESET_LOGOS = [
  { name: 'Royal Dining Crest', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop&q=80' },
  { name: 'Artisan Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&q=80' },
  { name: 'Sushi Lounge', url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&h=200&fit=crop&q=80' },
  { name: 'Trattoria & Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop&q=80' },
  { name: 'Gourmet Bistro', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&h=200&fit=crop&q=80' },
];

const PRESET_COVERS = [
  { name: 'Luxury Dining Hall', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop&q=80' },
  { name: 'Rustic Wooden Kitchen', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&auto=format&fit=crop&q=80' },
  { name: 'Minimalist Asian Lounge', url: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=1600&auto=format&fit=crop&q=80' },
  { name: 'Italian Outdoor Patio', url: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=1600&auto=format&fit=crop&q=80' },
];

const COLOR_SWATCHES = [
  { name: 'Amber Gold', hex: '#D97706' },
  { name: 'Crimson Velvet', hex: '#E11D48' },
  { name: 'Royal Indigo', hex: '#6366F1' },
  { name: 'Emerald Olive', hex: '#059669' },
  { name: 'Tuscan Terracotta', hex: '#EA580C' },
  { name: 'Slate Midnight', hex: '#0F172A' },
];

export default function OnboardRestaurantPage() {
  const router = useRouter();

  // State
  const [name, setName] = useState('Royal Biryani Palace');
  const [slug, setSlug] = useState('royal-biryani');
  const [cuisine, setCuisine] = useState('Awadhi Dum Biryani, Kebabs & Curries');
  const [ownerName, setOwnerName] = useState('Nawab Farooq');
  const [ownerEmail, setOwnerEmail] = useState('owner@royalbiryani.com');
  const [phone, setPhone] = useState('+91 98450 12345');
  const [address, setAddress] = useState('14 Royal Heritage Lane');
  const [city, setCity] = useState('Hyderabad');

  // Branding Customizations
  const [logoUrl, setLogoUrl] = useState(PRESET_LOGOS[0]?.url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop&q=80');
  const [coverImageUrl, setCoverImageUrl] = useState(PRESET_COVERS[0]?.url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop&q=80');
  const [primaryColor, setPrimaryColor] = useState('#D97706');
  const [tagline, setTagline] = useState('Slow-cooked royal heritage delicacies');
  const [welcomeText, setWelcomeText] = useState('Welcome to the Royal Dum Biryani Experience');

  // Operations
  const [tableCount, setTableCount] = useState(12);
  const [taxRate, setTaxRate] = useState(5);
  const [serviceCharge, setServiceCharge] = useState(2);
  const [currency, setCurrency] = useState('INR');

  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    setSlug(generatedSlug);
  };

  const onboard = useMutation({
    mutationFn: () =>
      api.onboardRestaurant({
        name,
        slug,
        cuisine,
        ownerName,
        ownerEmail,
        phone,
        address,
        city,
        tableCount: Number(tableCount),
        taxRate: Number(taxRate),
        serviceCharge: Number(serviceCharge),
        currency,
        logoUrl,
        coverImageUrl,
        primaryColor,
        tagline,
        welcomeText,
      }),
    onSuccess: () => {
      void router.push('/admin');
    },
  });

  return (
    <div className="min-h-screen bg-muted/20 text-foreground py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-amber-500/10 text-amber-600 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  Super Admin Studio
                </span>
                <span className="text-xs text-muted-foreground">Platform Provisioning</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
                Onboard New Restaurant Tenant
              </h1>
            </div>
          </div>

          <Button
            onClick={() => onboard.mutate()}
            loading={onboard.isPending}
            className="rounded-xl font-bold h-11 px-6 shadow-md gap-2"
          >
            <Sparkles size={16} />
            <span>Provision & Launch Restaurant</span>
          </Button>
        </div>

        {/* 2-Column Split: Controls on Left, Real-Time Storefront Live Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: 7 Columns */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Identity */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Building2 size={18} className="text-primary" />
                <h3 className="font-extrabold text-base">1. Restaurant Identity & Subdomain</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-muted-foreground uppercase block mb-1">Restaurant Name *</label>
                  <Input
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Royal Biryani Palace"
                    className="rounded-xl h-10 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-muted-foreground uppercase block mb-1">Subdomain Slug *</label>
                  <div className="relative">
                    <Input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. royal-biryani"
                      className="rounded-xl h-10 pr-20 text-xs font-mono font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-semibold">
                      .platform.com
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-muted-foreground uppercase block mb-1">Cuisine / Speciality</label>
                  <Input
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    placeholder="e.g. Italian Trattoria, Handcrafted Ramen"
                    className="rounded-xl h-10"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground uppercase block mb-1">City Location</label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai, Bengaluru"
                    className="rounded-xl h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-muted-foreground uppercase block mb-1">Phone Number</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="rounded-xl h-10"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground uppercase block mb-1">Street Address</label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 18 Grand Boulevard"
                    className="rounded-xl h-10"
                  />
                </div>
              </div>
            </div>

            {/* 2. Visual Branding & Logo Customizations */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Palette size={18} className="text-primary" />
                <h3 className="font-extrabold text-base">2. Visual Branding & Logo Customization</h3>
              </div>

              {/* Logo Picker */}
              <div className="space-y-2 text-xs">
                <label className="font-bold text-muted-foreground uppercase block">
                  Select Restaurant Brand Logo or Paste Custom URL
                </label>
                <div className="grid grid-cols-5 gap-2.5">
                  {PRESET_LOGOS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLogoUrl(item.url)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition ${
                        logoUrl === item.url ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-border/80 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={item.url} alt={item.name} fill className="object-cover" />
                      {logoUrl === item.url && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check size={18} className="text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <Input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="Custom Logo URL (https://...)"
                  className="rounded-xl h-9 text-xs mt-2"
                />
              </div>

              {/* Cover Banner Picker */}
              <div className="space-y-2 text-xs">
                <label className="font-bold text-muted-foreground uppercase block">
                  Storefront Hero Cover Banner
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_COVERS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCoverImageUrl(item.url)}
                      className={`relative h-16 rounded-xl overflow-hidden border-2 transition ${
                        coverImageUrl === item.url ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-border/80 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={item.url} alt={item.name} fill className="object-cover" />
                      {coverImageUrl === item.url && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check size={16} className="text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <Input
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="Custom Banner URL (https://...)"
                  className="rounded-xl h-9 text-xs mt-2"
                />
              </div>

              {/* Primary Color Palette Customization */}
              <div className="space-y-2 text-xs">
                <label className="font-bold text-muted-foreground uppercase block">
                  Primary Brand Color Accent
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  {COLOR_SWATCHES.map((swatch) => (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => setPrimaryColor(swatch.hex)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                        primaryColor === swatch.hex
                          ? 'border-foreground shadow-xs ring-1 ring-foreground'
                          : 'border-border/80 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: swatch.hex }} />
                      <span>{swatch.name}</span>
                    </button>
                  ))}
                  <div className="flex items-center gap-1.5 pl-2 border-l border-border">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-border"
                    />
                    <span className="text-[11px] font-mono text-muted-foreground font-semibold">{primaryColor}</span>
                  </div>
                </div>
              </div>

              {/* Tagline & Welcome */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-muted-foreground uppercase block mb-1">Brand Tagline</label>
                  <Input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Slow-cooked royal heritage fare"
                    className="rounded-xl h-10"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground uppercase block mb-1">Welcome Text</label>
                  <Input
                    value={welcomeText}
                    onChange={(e) => setWelcomeText(e.target.value)}
                    placeholder="e.g. Welcome to Royal Biryani Palace"
                    className="rounded-xl h-10"
                  />
                </div>
              </div>
            </div>

            {/* 3. Operations & Tables */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <ChefHat size={18} className="text-primary" />
                <h3 className="font-extrabold text-base">3. Operations & Dining Tables</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="font-bold text-muted-foreground uppercase block mb-1">Total Tables</label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={tableCount}
                    onChange={(e) => setTableCount(Number(e.target.value))}
                    className="rounded-xl h-10 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground uppercase block mb-1">Tax Rate (GST %)</label>
                  <Input
                    type="number"
                    min={0}
                    max={28}
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="rounded-xl h-10 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground uppercase block mb-1">Service Chg %</label>
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    value={serviceCharge}
                    onChange={(e) => setServiceCharge(Number(e.target.value))}
                    className="rounded-xl h-10 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground uppercase block mb-1">Currency</label>
                  <select
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="INR">₹ INR (India)</option>
                    <option value="USD">$ USD (US)</option>
                    <option value="EUR">€ EUR (Europe)</option>
                    <option value="AED">AED (UAE)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Owner Credentials */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Shield size={18} className="text-primary" />
                <h3 className="font-extrabold text-base">4. Restaurant Owner Account</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-muted-foreground uppercase block mb-1">Owner Full Name *</label>
                  <Input
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Chef / Manager Name"
                    className="rounded-xl h-10 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground uppercase block mb-1">Owner Email *</label>
                  <Input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="owner@restaurant.com"
                    className="rounded-xl h-10 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 5 Columns Live Storefront Card Preview */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Eye size={14} className="text-primary" />
                <span>Live Digital Storefront Preview</span>
              </span>
              <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                Real-Time
              </span>
            </div>

            {/* Preview Card Mockup */}
            <div className="rounded-3xl border border-border overflow-hidden bg-card shadow-xl transition-all">
              {/* Cover Banner */}
              <div className="relative h-44 w-full bg-slate-900">
                <Image src={coverImageUrl} alt="Cover Preview" fill className="object-cover brightness-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Subdomain Pill */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-white font-bold border border-white/20">
                  {slug}.platform.com
                </div>

                {/* Logo floating */}
                <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-2xl overflow-hidden border-2 border-card bg-card shadow-lg">
                  <Image src={logoUrl} alt="Logo Preview" fill className="object-cover" />
                </div>
              </div>

              {/* Card Body */}
              <div className="pt-8 p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-xl text-foreground tracking-tight">{name || 'Your Restaurant'}</h3>
                    <span
                      className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Open
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                    {cuisine || 'Culinary Specialities'} • {city}
                  </p>
                  <p className="text-xs text-muted-foreground/90 mt-2 italic">
                    &quot;{tagline}&quot;
                  </p>
                </div>

                {/* Mock Feature Pills */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-center text-xs">
                  <div className="p-2 rounded-xl bg-muted/60 border border-border/50">
                    <span className="block font-black text-sm text-foreground">{tableCount}</span>
                    <span className="text-[10px] text-muted-foreground">Active Tables</span>
                  </div>
                  <div className="p-2 rounded-xl bg-muted/60 border border-border/50">
                    <span className="block font-black text-sm text-foreground">{taxRate}%</span>
                    <span className="text-[10px] text-muted-foreground">GST Rate</span>
                  </div>
                  <div className="p-2 rounded-xl bg-muted/60 border border-border/50">
                    <span className="block font-black text-sm text-foreground">{currency}</span>
                    <span className="text-[10px] text-muted-foreground">Currency</span>
                  </div>
                </div>

                {/* Mock Menu Action Button */}
                <button
                  type="button"
                  className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 transition hover:opacity-95"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Utensils size={14} />
                  <span>Explore Menu & Order From Table</span>
                </button>

                <p className="text-[10px] text-muted-foreground text-center">
                  Direct table QR codes & operations portal generated upon launch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
