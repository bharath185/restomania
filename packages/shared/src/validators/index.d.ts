import { z } from 'zod';
import { DishType, DiscountType, OrderType, PaymentMethod, UserRole } from '../types/index';
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const RegisterSchema: z.ZodEffects<z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    name: string;
    email?: string | undefined;
    phone?: string | undefined;
}, {
    password: string;
    name: string;
    email?: string | undefined;
    phone?: string | undefined;
}>, {
    password: string;
    name: string;
    email?: string | undefined;
    phone?: string | undefined;
}, {
    password: string;
    name: string;
    email?: string | undefined;
    phone?: string | undefined;
}>;
export declare const ResetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    token: string;
}, {
    password: string;
    token: string;
}>;
export declare const CreateCategorySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    availableFrom: z.ZodOptional<z.ZodString>;
    availableTo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    sortOrder: number;
    isActive: boolean;
    description?: string | undefined;
    availableFrom?: string | undefined;
    availableTo?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    sortOrder?: number | undefined;
    isActive?: boolean | undefined;
    availableFrom?: string | undefined;
    availableTo?: string | undefined;
}>;
export declare const CreateMenuItemSchema: z.ZodObject<{
    categoryId: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    dishType: z.ZodDefault<z.ZodNativeEnum<typeof DishType>>;
    basePrice: z.ZodNumber;
    discountedPrice: z.ZodOptional<z.ZodNumber>;
    calories: z.ZodOptional<z.ZodNumber>;
    prepTimeMins: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    isInStock: z.ZodDefault<z.ZodBoolean>;
    isFeatured: z.ZodDefault<z.ZodBoolean>;
    isBestseller: z.ZodDefault<z.ZodBoolean>;
    spiceLevel: z.ZodDefault<z.ZodNumber>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
    variants: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        priceDelta: z.ZodDefault<z.ZodNumber>;
        isDefault: z.ZodDefault<z.ZodBoolean>;
        sortOrder: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        sortOrder: number;
        priceDelta: number;
        isDefault: boolean;
    }, {
        name: string;
        sortOrder?: number | undefined;
        priceDelta?: number | undefined;
        isDefault?: boolean | undefined;
    }>, "many">>;
    addons: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        price: z.ZodDefault<z.ZodNumber>;
        isRequired: z.ZodDefault<z.ZodBoolean>;
        maxSelect: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        price: number;
        isRequired: boolean;
        maxSelect: number;
    }, {
        name: string;
        price?: number | undefined;
        isRequired?: boolean | undefined;
        maxSelect?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    sortOrder: number;
    isActive: boolean;
    categoryId: string;
    dishType: DishType;
    basePrice: number;
    isInStock: boolean;
    isFeatured: boolean;
    isBestseller: boolean;
    spiceLevel: number;
    tags: string[];
    variants: {
        name: string;
        sortOrder: number;
        priceDelta: number;
        isDefault: boolean;
    }[];
    addons: {
        name: string;
        price: number;
        isRequired: boolean;
        maxSelect: number;
    }[];
    description?: string | undefined;
    discountedPrice?: number | undefined;
    calories?: number | undefined;
    prepTimeMins?: number | undefined;
}, {
    name: string;
    categoryId: string;
    basePrice: number;
    description?: string | undefined;
    sortOrder?: number | undefined;
    isActive?: boolean | undefined;
    dishType?: DishType | undefined;
    discountedPrice?: number | undefined;
    calories?: number | undefined;
    prepTimeMins?: number | undefined;
    isInStock?: boolean | undefined;
    isFeatured?: boolean | undefined;
    isBestseller?: boolean | undefined;
    spiceLevel?: number | undefined;
    tags?: string[] | undefined;
    variants?: {
        name: string;
        sortOrder?: number | undefined;
        priceDelta?: number | undefined;
        isDefault?: boolean | undefined;
    }[] | undefined;
    addons?: {
        name: string;
        price?: number | undefined;
        isRequired?: boolean | undefined;
        maxSelect?: number | undefined;
    }[] | undefined;
}>;
export declare const PlaceOrderSchema: z.ZodObject<{
    orderType: z.ZodDefault<z.ZodNativeEnum<typeof OrderType>>;
    paymentMethod: z.ZodNativeEnum<typeof PaymentMethod>;
    specialNotes: z.ZodOptional<z.ZodString>;
    couponCode: z.ZodOptional<z.ZodString>;
    deliveryAddress: z.ZodOptional<z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        pincode: z.ZodString;
        lat: z.ZodOptional<z.ZodNumber>;
        lng: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        pincode: string;
        lat?: number | undefined;
        lng?: number | undefined;
    }, {
        street: string;
        city: string;
        pincode: string;
        lat?: number | undefined;
        lng?: number | undefined;
    }>>;
    items: z.ZodArray<z.ZodObject<{
        itemId: z.ZodString;
        quantity: z.ZodNumber;
        variantId: z.ZodOptional<z.ZodString>;
        addonIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        specialNotes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        itemId: string;
        quantity: number;
        addonIds: string[];
        specialNotes?: string | undefined;
        variantId?: string | undefined;
    }, {
        itemId: string;
        quantity: number;
        specialNotes?: string | undefined;
        variantId?: string | undefined;
        addonIds?: string[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        itemId: string;
        quantity: number;
        addonIds: string[];
        specialNotes?: string | undefined;
        variantId?: string | undefined;
    }[];
    orderType: OrderType;
    paymentMethod: PaymentMethod;
    specialNotes?: string | undefined;
    couponCode?: string | undefined;
    deliveryAddress?: {
        street: string;
        city: string;
        pincode: string;
        lat?: number | undefined;
        lng?: number | undefined;
    } | undefined;
}, {
    items: {
        itemId: string;
        quantity: number;
        specialNotes?: string | undefined;
        variantId?: string | undefined;
        addonIds?: string[] | undefined;
    }[];
    paymentMethod: PaymentMethod;
    orderType?: OrderType | undefined;
    specialNotes?: string | undefined;
    couponCode?: string | undefined;
    deliveryAddress?: {
        street: string;
        city: string;
        pincode: string;
        lat?: number | undefined;
        lng?: number | undefined;
    } | undefined;
}>;
export declare const CreateTableSchema: z.ZodObject<{
    tableNumber: z.ZodString;
    capacity: z.ZodDefault<z.ZodNumber>;
    section: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tableNumber: string;
    capacity: number;
    section?: string | undefined;
}, {
    tableNumber: string;
    capacity?: number | undefined;
    section?: string | undefined;
}>;
export declare const CreateCouponSchema: z.ZodObject<{
    code: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    discountType: z.ZodNativeEnum<typeof DiscountType>;
    discountValue: z.ZodNumber;
    minOrderValue: z.ZodDefault<z.ZodNumber>;
    maxDiscount: z.ZodOptional<z.ZodNumber>;
    maxUses: z.ZodOptional<z.ZodNumber>;
    validFrom: z.ZodOptional<z.ZodString>;
    validUntil: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderValue: number;
    description?: string | undefined;
    maxDiscount?: number | undefined;
    maxUses?: number | undefined;
    validFrom?: string | undefined;
    validUntil?: string | undefined;
}, {
    code: string;
    discountType: DiscountType;
    discountValue: number;
    description?: string | undefined;
    minOrderValue?: number | undefined;
    maxDiscount?: number | undefined;
    maxUses?: number | undefined;
    validFrom?: string | undefined;
    validUntil?: string | undefined;
}>;
export declare const UpdateBrandingSchema: z.ZodObject<{
    primaryColor: z.ZodOptional<z.ZodString>;
    secondaryColor: z.ZodOptional<z.ZodString>;
    accentColor: z.ZodOptional<z.ZodString>;
    fontFamily: z.ZodOptional<z.ZodString>;
    welcomeText: z.ZodOptional<z.ZodString>;
    tagline: z.ZodOptional<z.ZodString>;
    footerText: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
    theme: z.ZodOptional<z.ZodEnum<["light", "dark", "auto"]>>;
    customCss: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    primaryColor?: string | undefined;
    secondaryColor?: string | undefined;
    accentColor?: string | undefined;
    fontFamily?: string | undefined;
    welcomeText?: string | undefined;
    tagline?: string | undefined;
    footerText?: string | undefined;
    language?: string | undefined;
    theme?: "light" | "dark" | "auto" | undefined;
    customCss?: string | undefined;
}, {
    primaryColor?: string | undefined;
    secondaryColor?: string | undefined;
    accentColor?: string | undefined;
    fontFamily?: string | undefined;
    welcomeText?: string | undefined;
    tagline?: string | undefined;
    footerText?: string | undefined;
    language?: string | undefined;
    theme?: "light" | "dark" | "auto" | undefined;
    customCss?: string | undefined;
}>;
export declare const InviteStaffSchema: z.ZodObject<{
    email: z.ZodString;
    name: z.ZodString;
    role: z.ZodEnum<[UserRole.MANAGER, UserRole.KITCHEN, UserRole.WAITER]>;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
    role: UserRole.MANAGER | UserRole.KITCHEN | UserRole.WAITER;
}, {
    email: string;
    name: string;
    role: UserRole.MANAGER | UserRole.KITCHEN | UserRole.WAITER;
}>;
export declare const OnboardRestaurantSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    country: z.ZodDefault<z.ZodString>;
    currency: z.ZodDefault<z.ZodString>;
    taxRate: z.ZodDefault<z.ZodNumber>;
    serviceCharge: z.ZodDefault<z.ZodNumber>;
    gstNumber: z.ZodOptional<z.ZodString>;
    planId: z.ZodOptional<z.ZodString>;
    ownerName: z.ZodString;
    ownerEmail: z.ZodString;
    branding: z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        accentColor: z.ZodOptional<z.ZodString>;
        fontFamily: z.ZodOptional<z.ZodString>;
        welcomeText: z.ZodOptional<z.ZodString>;
        tagline: z.ZodOptional<z.ZodString>;
        footerText: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
        theme: z.ZodOptional<z.ZodEnum<["light", "dark", "auto"]>>;
        customCss: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        accentColor?: string | undefined;
        fontFamily?: string | undefined;
        welcomeText?: string | undefined;
        tagline?: string | undefined;
        footerText?: string | undefined;
        language?: string | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        customCss?: string | undefined;
    }, {
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        accentColor?: string | undefined;
        fontFamily?: string | undefined;
        welcomeText?: string | undefined;
        tagline?: string | undefined;
        footerText?: string | undefined;
        language?: string | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        customCss?: string | undefined;
    }>>;
    tableCount: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
    country: string;
    currency: string;
    taxRate: number;
    serviceCharge: number;
    ownerName: string;
    ownerEmail: string;
    tableCount: number;
    phone?: string | undefined;
    city?: string | undefined;
    address?: string | undefined;
    gstNumber?: string | undefined;
    planId?: string | undefined;
    branding?: {
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        accentColor?: string | undefined;
        fontFamily?: string | undefined;
        welcomeText?: string | undefined;
        tagline?: string | undefined;
        footerText?: string | undefined;
        language?: string | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        customCss?: string | undefined;
    } | undefined;
}, {
    name: string;
    slug: string;
    ownerName: string;
    ownerEmail: string;
    phone?: string | undefined;
    city?: string | undefined;
    address?: string | undefined;
    country?: string | undefined;
    currency?: string | undefined;
    taxRate?: number | undefined;
    serviceCharge?: number | undefined;
    gstNumber?: string | undefined;
    planId?: string | undefined;
    branding?: {
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        accentColor?: string | undefined;
        fontFamily?: string | undefined;
        welcomeText?: string | undefined;
        tagline?: string | undefined;
        footerText?: string | undefined;
        language?: string | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
        customCss?: string | undefined;
    } | undefined;
    tableCount?: number | undefined;
}>;
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
//# sourceMappingURL=index.d.ts.map