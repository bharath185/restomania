import { OrderStatus, UserRole } from '../types/index';
export declare const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]>;
export declare const ORDER_STATUS_LABELS: Record<OrderStatus, string>;
export declare const ROLE_HIERARCHY: Record<UserRole, number>;
export declare const DEFAULT_BRANDING: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    theme: "light";
    language: string;
};
export declare const DEFAULT_MENU_CATEGORIES: {
    name: string;
    sortOrder: number;
}[];
export declare const DEFAULT_PAGE = 1;
export declare const DEFAULT_LIMIT = 20;
export declare const MAX_LIMIT = 100;
export declare const ACCESS_TOKEN_EXPIRY = "15m";
export declare const REFRESH_TOKEN_EXPIRY_DAYS = 30;
export declare const QR_SESSION_EXPIRY_HOURS = 1;
export declare const MAX_IMAGE_SIZE_BYTES: number;
export declare const ALLOWED_IMAGE_MIME_TYPES: string[];
export declare const IMAGE_SIZES: {
    readonly THUMB: 80;
    readonly CARD: 400;
    readonly DETAIL: 800;
};
export declare const RATE_LIMIT_DEFAULT: {
    windowMs: number;
    max: number;
};
export declare const RATE_LIMIT_AUTH: {
    windowMs: number;
    max: number;
};
export declare const CACHE_TTL: {
    readonly MENU: number;
    readonly BRANDING: number;
    readonly DASHBOARD: 60;
};
export declare const DEFAULT_CURRENCY = "INR";
export declare const DEFAULT_TIMEZONE = "Asia/Kolkata";
export declare const WS_ROOM: {
    kitchen: (restaurantId: string) => string;
    order: (orderId: string) => string;
    restaurant: (restaurantId: string) => string;
};
export declare const WS_EVENTS: {
    readonly ORDER_NEW: "order:new";
    readonly ORDER_STATUS: "order:status";
    readonly ITEM_STOCK_UPDATE: "item:stock_update";
    readonly ORDER_ACCEPT: "order:accept";
    readonly ORDER_UPDATE: "order:update";
    readonly SUBSCRIBE_ROOM: "subscribe:room";
};
export declare const ERROR_CODES: {
    readonly TENANT_NOT_FOUND: "TENANT_NOT_FOUND";
    readonly TENANT_INACTIVE: "TENANT_INACTIVE";
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly QR_TOKEN_INVALID: "QR_TOKEN_INVALID";
    readonly QR_TOKEN_EXPIRED: "QR_TOKEN_EXPIRED";
    readonly ITEM_OUT_OF_STOCK: "ITEM_OUT_OF_STOCK";
    readonly COUPON_INVALID: "COUPON_INVALID";
    readonly COUPON_EXPIRED: "COUPON_EXPIRED";
    readonly PAYMENT_FAILED: "PAYMENT_FAILED";
    readonly INVALID_STATUS_TRANSITION: "INVALID_STATUS_TRANSITION";
    readonly DUPLICATE_ENTRY: "DUPLICATE_ENTRY";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
};
//# sourceMappingURL=index.d.ts.map