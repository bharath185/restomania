import { z } from 'zod';
import { DishType, DiscountType, OrderType, PaymentMethod, UserRole } from '../types/index';

// ─── Auth Validators ──────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RegisterSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/).optional(),
  name: z.string().min(2).max(100),
  password: z.string().min(8).max(128),
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone is required',
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

// ─── Menu Validators ──────────────────────────────────────────────────────────

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  availableFrom: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  availableTo: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export const CreateMenuItemSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  dishType: z.nativeEnum(DishType).default(DishType.VEG),
  basePrice: z.number().positive().multipleOf(0.01),
  discountedPrice: z.number().positive().multipleOf(0.01).optional(),
  calories: z.number().int().positive().optional(),
  prepTimeMins: z.number().int().positive().max(300).optional(),
  isActive: z.boolean().default(true),
  isInStock: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  spiceLevel: z.number().int().min(0).max(5).default(0),
  tags: z.array(z.string()).max(10).default([]),
  sortOrder: z.number().int().min(0).default(0),
  variants: z.array(z.object({
    name: z.string().min(1).max(100),
    priceDelta: z.number().multipleOf(0.01).default(0),
    isDefault: z.boolean().default(false),
    sortOrder: z.number().int().min(0).default(0),
  })).default([]),
  addons: z.array(z.object({
    name: z.string().min(1).max(100),
    price: z.number().min(0).multipleOf(0.01).default(0),
    isRequired: z.boolean().default(false),
    maxSelect: z.number().int().min(1).default(1),
  })).default([]),
});

// ─── Order Validators ─────────────────────────────────────────────────────────

export const PlaceOrderSchema = z.object({
  orderType: z.nativeEnum(OrderType).default(OrderType.DINE_IN),
  paymentMethod: z.nativeEnum(PaymentMethod),
  specialNotes: z.string().max(500).optional(),
  couponCode: z.string().optional(),
  deliveryAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    pincode: z.string().min(4).max(10),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }).optional(),
  items: z.array(z.object({
    itemId: z.string().uuid(),
    quantity: z.number().int().positive().max(50),
    variantId: z.string().uuid().optional(),
    addonIds: z.array(z.string().uuid()).default([]),
    specialNotes: z.string().max(200).optional(),
  })).min(1).max(50),
});

// ─── Table Validators ─────────────────────────────────────────────────────────

export const CreateTableSchema = z.object({
  tableNumber: z.string().min(1).max(20),
  capacity: z.number().int().positive().max(100).default(4),
  section: z.string().max(100).optional(),
});

// ─── Coupon Validators ────────────────────────────────────────────────────────

export const CreateCouponSchema = z.object({
  code: z.string().min(3).max(30).toUpperCase(),
  description: z.string().max(500).optional(),
  discountType: z.nativeEnum(DiscountType),
  discountValue: z.number().positive(),
  minOrderValue: z.number().min(0).default(0),
  maxDiscount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
});

// ─── Branding Validators ──────────────────────────────────────────────────────

export const UpdateBrandingSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  fontFamily: z.string().max(100).optional(),
  welcomeText: z.string().max(500).optional(),
  tagline: z.string().max(200).optional(),
  footerText: z.string().max(300).optional(),
  language: z.string().length(2).optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  customCss: z.string().max(10000).optional(),
});

// ─── Staff Validators ─────────────────────────────────────────────────────────

export const InviteStaffSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum([UserRole.MANAGER, UserRole.KITCHEN, UserRole.WAITER]),
});

// ─── Onboarding Wizard Validator ──────────────────────────────────────────────

export const OnboardRestaurantSchema = z.object({
  // Step 1: Details
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().length(2).default('IN'),
  currency: z.string().length(3).default('INR'),
  taxRate: z.number().min(0).max(50).default(0),
  serviceCharge: z.number().min(0).max(50).default(0),
  gstNumber: z.string().max(20).optional(),
  planId: z.string().uuid().optional(),
  // Step 2: Owner
  ownerName: z.string().min(2).max(100),
  ownerEmail: z.string().email(),
  // Step 3: Branding
  branding: UpdateBrandingSchema.optional(),
  // Step 4: Tables
  tableCount: z.number().int().min(1).max(200).default(5),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type CreateMenuItemInput = z.infer<typeof CreateMenuItemSchema>;
export type PlaceOrderInput = z.infer<typeof PlaceOrderSchema>;
export type CreateTableInput = z.infer<typeof CreateTableSchema>;
export type CreateCouponInput = z.infer<typeof CreateCouponSchema>;
export type UpdateBrandingInput = z.infer<typeof UpdateBrandingSchema>;
export type InviteStaffInput = z.infer<typeof InviteStaffSchema>;
export type OnboardRestaurantInput = z.infer<typeof OnboardRestaurantSchema>;
