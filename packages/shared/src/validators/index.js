"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardRestaurantSchema = exports.InviteStaffSchema = exports.UpdateBrandingSchema = exports.CreateCouponSchema = exports.CreateTableSchema = exports.PlaceOrderSchema = exports.CreateMenuItemSchema = exports.CreateCategorySchema = exports.ResetPasswordSchema = exports.RegisterSchema = exports.LoginSchema = void 0;
const zod_1 = require("zod");
const index_1 = require("../types/index");
// ─── Auth Validators ──────────────────────────────────────────────────────────
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().regex(/^\+?[1-9]\d{9,14}$/).optional(),
    name: zod_1.z.string().min(2).max(100),
    password: zod_1.z.string().min(8).max(128),
}).refine((data) => data.email || data.phone, {
    message: 'Either email or phone is required',
});
exports.ResetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
    password: zod_1.z.string().min(8).max(128),
});
// ─── Menu Validators ──────────────────────────────────────────────────────────
exports.CreateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().max(500).optional(),
    sortOrder: zod_1.z.number().int().min(0).default(0),
    isActive: zod_1.z.boolean().default(true),
    availableFrom: zod_1.z.string().regex(/^\d{2}:\d{2}$/).optional(),
    availableTo: zod_1.z.string().regex(/^\d{2}:\d{2}$/).optional(),
});
exports.CreateMenuItemSchema = zod_1.z.object({
    categoryId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().max(1000).optional(),
    dishType: zod_1.z.nativeEnum(index_1.DishType).default(index_1.DishType.VEG),
    basePrice: zod_1.z.number().positive().multipleOf(0.01),
    discountedPrice: zod_1.z.number().positive().multipleOf(0.01).optional(),
    calories: zod_1.z.number().int().positive().optional(),
    prepTimeMins: zod_1.z.number().int().positive().max(300).optional(),
    isActive: zod_1.z.boolean().default(true),
    isInStock: zod_1.z.boolean().default(true),
    isFeatured: zod_1.z.boolean().default(false),
    isBestseller: zod_1.z.boolean().default(false),
    spiceLevel: zod_1.z.number().int().min(0).max(5).default(0),
    tags: zod_1.z.array(zod_1.z.string()).max(10).default([]),
    sortOrder: zod_1.z.number().int().min(0).default(0),
    variants: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        priceDelta: zod_1.z.number().multipleOf(0.01).default(0),
        isDefault: zod_1.z.boolean().default(false),
        sortOrder: zod_1.z.number().int().min(0).default(0),
    })).default([]),
    addons: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        price: zod_1.z.number().min(0).multipleOf(0.01).default(0),
        isRequired: zod_1.z.boolean().default(false),
        maxSelect: zod_1.z.number().int().min(1).default(1),
    })).default([]),
});
// ─── Order Validators ─────────────────────────────────────────────────────────
exports.PlaceOrderSchema = zod_1.z.object({
    orderType: zod_1.z.nativeEnum(index_1.OrderType).default(index_1.OrderType.DINE_IN),
    paymentMethod: zod_1.z.nativeEnum(index_1.PaymentMethod),
    specialNotes: zod_1.z.string().max(500).optional(),
    couponCode: zod_1.z.string().optional(),
    deliveryAddress: zod_1.z.object({
        street: zod_1.z.string().min(1),
        city: zod_1.z.string().min(1),
        pincode: zod_1.z.string().min(4).max(10),
        lat: zod_1.z.number().optional(),
        lng: zod_1.z.number().optional(),
    }).optional(),
    items: zod_1.z.array(zod_1.z.object({
        itemId: zod_1.z.string().uuid(),
        quantity: zod_1.z.number().int().positive().max(50),
        variantId: zod_1.z.string().uuid().optional(),
        addonIds: zod_1.z.array(zod_1.z.string().uuid()).default([]),
        specialNotes: zod_1.z.string().max(200).optional(),
    })).min(1).max(50),
});
// ─── Table Validators ─────────────────────────────────────────────────────────
exports.CreateTableSchema = zod_1.z.object({
    tableNumber: zod_1.z.string().min(1).max(20),
    capacity: zod_1.z.number().int().positive().max(100).default(4),
    section: zod_1.z.string().max(100).optional(),
});
// ─── Coupon Validators ────────────────────────────────────────────────────────
exports.CreateCouponSchema = zod_1.z.object({
    code: zod_1.z.string().min(3).max(30).toUpperCase(),
    description: zod_1.z.string().max(500).optional(),
    discountType: zod_1.z.nativeEnum(index_1.DiscountType),
    discountValue: zod_1.z.number().positive(),
    minOrderValue: zod_1.z.number().min(0).default(0),
    maxDiscount: zod_1.z.number().positive().optional(),
    maxUses: zod_1.z.number().int().positive().optional(),
    validFrom: zod_1.z.string().datetime().optional(),
    validUntil: zod_1.z.string().datetime().optional(),
});
// ─── Branding Validators ──────────────────────────────────────────────────────
exports.UpdateBrandingSchema = zod_1.z.object({
    primaryColor: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    secondaryColor: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    accentColor: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    fontFamily: zod_1.z.string().max(100).optional(),
    welcomeText: zod_1.z.string().max(500).optional(),
    tagline: zod_1.z.string().max(200).optional(),
    footerText: zod_1.z.string().max(300).optional(),
    language: zod_1.z.string().length(2).optional(),
    theme: zod_1.z.enum(['light', 'dark', 'auto']).optional(),
    customCss: zod_1.z.string().max(10000).optional(),
});
// ─── Staff Validators ─────────────────────────────────────────────────────────
exports.InviteStaffSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().min(2).max(100),
    role: zod_1.z.enum([index_1.UserRole.MANAGER, index_1.UserRole.KITCHEN, index_1.UserRole.WAITER]),
});
// ─── Onboarding Wizard Validator ──────────────────────────────────────────────
exports.OnboardRestaurantSchema = zod_1.z.object({
    // Step 1: Details
    name: zod_1.z.string().min(2).max(200),
    slug: zod_1.z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
    phone: zod_1.z.string().regex(/^\+?[1-9]\d{9,14}$/).optional(),
    address: zod_1.z.string().max(500).optional(),
    city: zod_1.z.string().max(100).optional(),
    country: zod_1.z.string().length(2).default('IN'),
    currency: zod_1.z.string().length(3).default('INR'),
    taxRate: zod_1.z.number().min(0).max(50).default(0),
    serviceCharge: zod_1.z.number().min(0).max(50).default(0),
    gstNumber: zod_1.z.string().max(20).optional(),
    planId: zod_1.z.string().uuid().optional(),
    // Step 2: Owner
    ownerName: zod_1.z.string().min(2).max(100),
    ownerEmail: zod_1.z.string().email(),
    // Step 3: Branding
    branding: exports.UpdateBrandingSchema.optional(),
    // Step 4: Tables
    tableCount: zod_1.z.number().int().min(1).max(200).default(5),
});
//# sourceMappingURL=index.js.map