// ─── Enums ───────────────────────────────────────────────────────────────────

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  OWNER = 'owner',
  MANAGER = 'manager',
  KITCHEN = 'kitchen',
  WAITER = 'waiter',
  CUSTOMER = 'customer',
}

export enum OrderStatus {
  PENDING = 'pending',
  PLACED = 'placed',
  ACCEPTED = 'accepted',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum OrderType {
  DINE_IN = 'dine_in',
  TAKEAWAY = 'takeaway',
  DELIVERY = 'delivery',
}

export enum DishType {
  VEG = 'veg',
  NON_VEG = 'non_veg',
  VEGAN = 'vegan',
  EGG = 'egg',
}

export enum PaymentMethod {
  CASH = 'cash',
  UPI = 'upi',
  CARD = 'card',
  WALLET = 'wallet',
  RAZORPAY = 'razorpay',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum QrTokenType {
  TABLE = 'table',
  TAKEAWAY = 'takeaway',
  DELIVERY = 'delivery',
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

// ─── Branding ─────────────────────────────────────────────────────────────────

export interface RestaurantBranding {
  id: string;
  restaurantId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  coverImageUrl: string | null;
  welcomeText: string | null;
  tagline: string | null;
  footerText: string | null;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  customCss: string | null;
}

// ─── Restaurant ───────────────────────────────────────────────────────────────

export interface RestaurantPublic {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  currency: string;
  timezone: string;
  taxRate: number;
  serviceCharge: number;
  isActive: boolean;
  branding: RestaurantBranding | null;
  hours: RestaurantHour[];
}

export interface RestaurantHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  availableFrom: string | null;
  availableTo: string | null;
  items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string | null;
  dishType: DishType;
  basePrice: number;
  discountedPrice: number | null;
  calories: number | null;
  prepTimeMins: number | null;
  isActive: boolean;
  isInStock: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  spiceLevel: number;
  tags: string[];
  sortOrder: number;
  images: ItemImage[];
  variants: ItemVariant[];
  addons: ItemAddon[];
}

export interface ItemImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ItemVariant {
  id: string;
  name: string;
  priceDelta: number;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface ItemAddon {
  id: string;
  name: string;
  price: number;
  isRequired: boolean;
  maxSelect: number;
  isActive: boolean;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  restaurantId: string;
  tableId: string | null;
  customerId: string | null;
  orderNumber: string;
  orderType: OrderType;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  serviceCharge: number;
  totalAmount: number;
  specialNotes: string | null;
  estimatedTime: number | null;
  items: OrderItem[];
  payment: Payment | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  itemId: string;
  itemName: string;
  itemPrice: number;
  quantity: number;
  specialNotes: string | null;
  totalPrice: number;
  variants: OrderItemVariant[];
  addons: OrderItemAddon[];
}

export interface OrderItemVariant {
  variantId: string | null;
  variantName: string;
  priceDelta: number;
}

export interface OrderItemAddon {
  addonId: string | null;
  addonName: string;
  price: number;
}

export interface Payment {
  id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  gatewayOrderId: string | null;
  gatewayPaymentId: string | null;
  paidAt: string | null;
}

// ─── Cart (client-side) ───────────────────────────────────────────────────────

export interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  selectedVariant: ItemVariant | null;
  selectedAddons: ItemAddon[];
  specialNotes: string;
  totalPrice: number;
  imageUrl: string | null;
}

// ─── QR ───────────────────────────────────────────────────────────────────────

export interface QrVerifyResponse {
  restaurantId: string;
  restaurantSlug: string;
  tableId: string | null;
  tableNumber: string | null;
  tokenType: QrTokenType;
  branding: RestaurantBranding | null;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface UserPublic {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  avgOrderValue: number;
  topDishes: TopDish[];
  recentOrders: Order[];
}

export interface TopDish {
  itemId: string;
  name: string;
  orderCount: number;
  revenue: number;
  imageUrl: string | null;
}

// ─── WebSocket Events ─────────────────────────────────────────────────────────

export interface WsOrderNew {
  order: Order;
}

export interface WsOrderStatus {
  orderId: string;
  status: OrderStatus;
  updatedBy: string;
  timestamp: string;
}

export interface WsItemStockUpdate {
  itemId: string;
  itemName: string;
  isInStock: boolean;
}
