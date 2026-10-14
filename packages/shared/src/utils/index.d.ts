import { OrderStatus } from '../types/index';
export declare function formatCurrency(amount: number, currency?: string, locale?: string): string;
export declare function roundCurrency(amount: number): number;
export declare function isValidStatusTransition(from: OrderStatus, to: OrderStatus): boolean;
export declare function generateOrderNumber(sequence: number): string;
export declare function slugify(text: string): string;
export declare function formatDate(date: Date | string, locale?: string): string;
export declare function formatDateTime(date: Date | string, timezone?: string): string;
export declare function isRestaurantOpen(hours: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
}>, timezone?: string): boolean;
export interface PriceCalculation {
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    serviceCharge: number;
    total: number;
}
export declare function calculateOrderTotals(itemsTotal: number, taxRate: number, serviceChargeRate: number, discountAmount?: number): PriceCalculation;
export declare function truncate(str: string, length: number): string;
export declare function capitalize(str: string): string;
export declare function generatePassword(length?: number): string;
export declare function hexToRgb(hex: string): {
    r: number;
    g: number;
    b: number;
} | null;
export declare function getContrastColor(hexColor: string): 'black' | 'white';
//# sourceMappingURL=index.d.ts.map