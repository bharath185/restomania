import { ORDER_STATUS_TRANSITIONS } from '../constants/index';
import { OrderStatus } from '../types/index';

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number, currency: string = 'INR', locale: string = 'en-IN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export function isValidStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
  const allowed = ORDER_STATUS_TRANSITIONS[from];
  return allowed.includes(to);
}

export function generateOrderNumber(sequence: number): string {
  return `ORD-${String(sequence).padStart(4, '0')}`;
}

// ─── Slug ─────────────────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

// ─── Date/Time ────────────────────────────────────────────────────────────────

export function formatDate(date: Date | string, locale: string = 'en-IN'): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string, timezone: string = 'Asia/Kolkata'): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  }).format(new Date(date));
}

export function isRestaurantOpen(
  hours: Array<{ dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }>,
  timezone: string = 'Asia/Kolkata',
): boolean {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
  const dayOfWeek = now.getDay();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentMins = currentHour * 60 + currentMin;

  const todayHours = hours.find((h) => h.dayOfWeek === dayOfWeek);
  if (!todayHours || todayHours.isClosed) return false;

  const [openH, openM] = todayHours.openTime.split(':').map(Number);
  const [closeH, closeM] = todayHours.closeTime.split(':').map(Number);

  if (openH === undefined || openM === undefined || closeH === undefined || closeM === undefined) return true;

  const openMins = openH * 60 + openM;
  const closeMins = closeH * 60 + closeM;

  return currentMins >= openMins && currentMins < closeMins;
}

// ─── Price Calculation ────────────────────────────────────────────────────────

export interface PriceCalculation {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  serviceCharge: number;
  total: number;
}

export function calculateOrderTotals(
  itemsTotal: number,
  taxRate: number,
  serviceChargeRate: number,
  discountAmount: number = 0,
): PriceCalculation {
  const subtotal = roundCurrency(itemsTotal);
  const afterDiscount = roundCurrency(Math.max(0, subtotal - discountAmount));
  const taxAmount = roundCurrency((afterDiscount * taxRate) / 100);
  const serviceCharge = roundCurrency((afterDiscount * serviceChargeRate) / 100);
  const total = roundCurrency(afterDiscount + taxAmount + serviceCharge);

  return {
    subtotal,
    discountAmount: roundCurrency(discountAmount),
    taxAmount,
    serviceCharge,
    total,
  };
}

// ─── String Helpers ───────────────────────────────────────────────────────────

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length - 3) + '...';
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function generatePassword(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  return password;
}

// ─── Color Helpers ────────────────────────────────────────────────────────────

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1] ?? '0', 16),
        g: parseInt(result[2] ?? '0', 16),
        b: parseInt(result[3] ?? '0', 16),
      }
    : null;
}

export function getContrastColor(hexColor: string): 'black' | 'white' {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return 'black';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? 'black' : 'white';
}
