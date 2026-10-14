import { OrderStatus, UserRole } from '../types/index';

// ─── Order Status Flow ────────────────────────────────────────────────────────

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PLACED, OrderStatus.CANCELLED],
  [OrderStatus.PLACED]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
  [OrderStatus.ACCEPTED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY],
  [OrderStatus.READY]: [OrderStatus.SERVED],
  [OrderStatus.SERVED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pending',
  [OrderStatus.PLACED]: 'Order Placed',
  [OrderStatus.ACCEPTED]: 'Accepted',
  [OrderStatus.PREPARING]: 'Preparing',
  [OrderStatus.READY]: 'Ready for Pickup',
  [OrderStatus.SERVED]: 'Served',
  [OrderStatus.CANCELLED]: 'Cancelled',
  [OrderStatus.REFUNDED]: 'Refunded',
};

// ─── Role Hierarchy ───────────────────────────────────────────────────────────

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.OWNER]: 80,
  [UserRole.MANAGER]: 60,
  [UserRole.KITCHEN]: 40,
  [UserRole.WAITER]: 20,
  [UserRole.CUSTOMER]: 0,
};

// ─── Default Branding ─────────────────────────────────────────────────────────

export const DEFAULT_BRANDING = {
  primaryColor: '#FF6B35',
  secondaryColor: '#2C3E50',
  accentColor: '#F7C59F',
  fontFamily: 'Inter',
  theme: 'light' as const,
  language: 'en',
};

// ─── Default Menu Categories ──────────────────────────────────────────────────

export const DEFAULT_MENU_CATEGORIES = [
  { name: 'Starters', sortOrder: 0 },
  { name: 'Main Course', sortOrder: 1 },
  { name: 'Beverages', sortOrder: 2 },
  { name: 'Desserts', sortOrder: 3 },
];

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

// ─── Token Expiry ─────────────────────────────────────────────────────────────

export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY_DAYS = 30;
export const QR_SESSION_EXPIRY_HOURS = 1;

// ─── File Limits ─────────────────────────────────────────────────────────────

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ─── Image Sizes ─────────────────────────────────────────────────────────────

export const IMAGE_SIZES = {
  THUMB: 80,
  CARD: 400,
  DETAIL: 800,
} as const;

// ─── Rate Limiting ────────────────────────────────────────────────────────────

export const RATE_LIMIT_DEFAULT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
};

export const RATE_LIMIT_AUTH = {
  windowMs: 15 * 60 * 1000,
  max: 10,
};

// ─── Cache TTLs (seconds) ─────────────────────────────────────────────────────

export const CACHE_TTL = {
  MENU: 60 * 5,        // 5 minutes
  BRANDING: 60 * 10,   // 10 minutes
  DASHBOARD: 60,       // 1 minute
} as const;

// ─── Currency ─────────────────────────────────────────────────────────────────

export const DEFAULT_CURRENCY = 'INR';
export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

// ─── WebSocket Rooms ──────────────────────────────────────────────────────────

export const WS_ROOM = {
  kitchen: (restaurantId: string) => `kitchen:${restaurantId}`,
  order: (orderId: string) => `order:${orderId}`,
  restaurant: (restaurantId: string) => `restaurant:${restaurantId}`,
};

// ─── WebSocket Events ─────────────────────────────────────────────────────────

export const WS_EVENTS = {
  ORDER_NEW: 'order:new',
  ORDER_STATUS: 'order:status',
  ITEM_STOCK_UPDATE: 'item:stock_update',
  ORDER_ACCEPT: 'order:accept',
  ORDER_UPDATE: 'order:update',
  SUBSCRIBE_ROOM: 'subscribe:room',
} as const;

// ─── Error Codes ──────────────────────────────────────────────────────────────

export const ERROR_CODES = {
  TENANT_NOT_FOUND: 'TENANT_NOT_FOUND',
  TENANT_INACTIVE: 'TENANT_INACTIVE',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  QR_TOKEN_INVALID: 'QR_TOKEN_INVALID',
  QR_TOKEN_EXPIRED: 'QR_TOKEN_EXPIRED',
  ITEM_OUT_OF_STOCK: 'ITEM_OUT_OF_STOCK',
  COUPON_INVALID: 'COUPON_INVALID',
  COUPON_EXPIRED: 'COUPON_EXPIRED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
