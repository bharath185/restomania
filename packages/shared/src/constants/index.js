"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CODES = exports.WS_EVENTS = exports.WS_ROOM = exports.DEFAULT_TIMEZONE = exports.DEFAULT_CURRENCY = exports.CACHE_TTL = exports.RATE_LIMIT_AUTH = exports.RATE_LIMIT_DEFAULT = exports.IMAGE_SIZES = exports.ALLOWED_IMAGE_MIME_TYPES = exports.MAX_IMAGE_SIZE_BYTES = exports.QR_SESSION_EXPIRY_HOURS = exports.REFRESH_TOKEN_EXPIRY_DAYS = exports.ACCESS_TOKEN_EXPIRY = exports.MAX_LIMIT = exports.DEFAULT_LIMIT = exports.DEFAULT_PAGE = exports.DEFAULT_MENU_CATEGORIES = exports.DEFAULT_BRANDING = exports.ROLE_HIERARCHY = exports.ORDER_STATUS_LABELS = exports.ORDER_STATUS_TRANSITIONS = void 0;
const index_1 = require("../types/index");
// ─── Order Status Flow ────────────────────────────────────────────────────────
exports.ORDER_STATUS_TRANSITIONS = {
    [index_1.OrderStatus.PENDING]: [index_1.OrderStatus.PLACED, index_1.OrderStatus.CANCELLED],
    [index_1.OrderStatus.PLACED]: [index_1.OrderStatus.ACCEPTED, index_1.OrderStatus.CANCELLED],
    [index_1.OrderStatus.ACCEPTED]: [index_1.OrderStatus.PREPARING, index_1.OrderStatus.CANCELLED],
    [index_1.OrderStatus.PREPARING]: [index_1.OrderStatus.READY],
    [index_1.OrderStatus.READY]: [index_1.OrderStatus.SERVED],
    [index_1.OrderStatus.SERVED]: [],
    [index_1.OrderStatus.CANCELLED]: [],
    [index_1.OrderStatus.REFUNDED]: [],
};
exports.ORDER_STATUS_LABELS = {
    [index_1.OrderStatus.PENDING]: 'Pending',
    [index_1.OrderStatus.PLACED]: 'Order Placed',
    [index_1.OrderStatus.ACCEPTED]: 'Accepted',
    [index_1.OrderStatus.PREPARING]: 'Preparing',
    [index_1.OrderStatus.READY]: 'Ready for Pickup',
    [index_1.OrderStatus.SERVED]: 'Served',
    [index_1.OrderStatus.CANCELLED]: 'Cancelled',
    [index_1.OrderStatus.REFUNDED]: 'Refunded',
};
// ─── Role Hierarchy ───────────────────────────────────────────────────────────
exports.ROLE_HIERARCHY = {
    [index_1.UserRole.SUPER_ADMIN]: 100,
    [index_1.UserRole.OWNER]: 80,
    [index_1.UserRole.MANAGER]: 60,
    [index_1.UserRole.KITCHEN]: 40,
    [index_1.UserRole.WAITER]: 20,
    [index_1.UserRole.CUSTOMER]: 0,
};
// ─── Default Branding ─────────────────────────────────────────────────────────
exports.DEFAULT_BRANDING = {
    primaryColor: '#FF6B35',
    secondaryColor: '#2C3E50',
    accentColor: '#F7C59F',
    fontFamily: 'Inter',
    theme: 'light',
    language: 'en',
};
// ─── Default Menu Categories ──────────────────────────────────────────────────
exports.DEFAULT_MENU_CATEGORIES = [
    { name: 'Starters', sortOrder: 0 },
    { name: 'Main Course', sortOrder: 1 },
    { name: 'Beverages', sortOrder: 2 },
    { name: 'Desserts', sortOrder: 3 },
];
// ─── Pagination ───────────────────────────────────────────────────────────────
exports.DEFAULT_PAGE = 1;
exports.DEFAULT_LIMIT = 20;
exports.MAX_LIMIT = 100;
// ─── Token Expiry ─────────────────────────────────────────────────────────────
exports.ACCESS_TOKEN_EXPIRY = '15m';
exports.REFRESH_TOKEN_EXPIRY_DAYS = 30;
exports.QR_SESSION_EXPIRY_HOURS = 1;
// ─── File Limits ─────────────────────────────────────────────────────────────
exports.MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
exports.ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
// ─── Image Sizes ─────────────────────────────────────────────────────────────
exports.IMAGE_SIZES = {
    THUMB: 80,
    CARD: 400,
    DETAIL: 800,
};
// ─── Rate Limiting ────────────────────────────────────────────────────────────
exports.RATE_LIMIT_DEFAULT = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
};
exports.RATE_LIMIT_AUTH = {
    windowMs: 15 * 60 * 1000,
    max: 10,
};
// ─── Cache TTLs (seconds) ─────────────────────────────────────────────────────
exports.CACHE_TTL = {
    MENU: 60 * 5, // 5 minutes
    BRANDING: 60 * 10, // 10 minutes
    DASHBOARD: 60, // 1 minute
};
// ─── Currency ─────────────────────────────────────────────────────────────────
exports.DEFAULT_CURRENCY = 'INR';
exports.DEFAULT_TIMEZONE = 'Asia/Kolkata';
// ─── WebSocket Rooms ──────────────────────────────────────────────────────────
exports.WS_ROOM = {
    kitchen: (restaurantId) => `kitchen:${restaurantId}`,
    order: (orderId) => `order:${orderId}`,
    restaurant: (restaurantId) => `restaurant:${restaurantId}`,
};
// ─── WebSocket Events ─────────────────────────────────────────────────────────
exports.WS_EVENTS = {
    ORDER_NEW: 'order:new',
    ORDER_STATUS: 'order:status',
    ITEM_STOCK_UPDATE: 'item:stock_update',
    ORDER_ACCEPT: 'order:accept',
    ORDER_UPDATE: 'order:update',
    SUBSCRIBE_ROOM: 'subscribe:room',
};
// ─── Error Codes ──────────────────────────────────────────────────────────────
exports.ERROR_CODES = {
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
};
//# sourceMappingURL=index.js.map