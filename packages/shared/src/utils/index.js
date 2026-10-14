"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = formatCurrency;
exports.roundCurrency = roundCurrency;
exports.isValidStatusTransition = isValidStatusTransition;
exports.generateOrderNumber = generateOrderNumber;
exports.slugify = slugify;
exports.formatDate = formatDate;
exports.formatDateTime = formatDateTime;
exports.isRestaurantOpen = isRestaurantOpen;
exports.calculateOrderTotals = calculateOrderTotals;
exports.truncate = truncate;
exports.capitalize = capitalize;
exports.generatePassword = generatePassword;
exports.hexToRgb = hexToRgb;
exports.getContrastColor = getContrastColor;
const index_1 = require("../constants/index");
// ─── Currency ─────────────────────────────────────────────────────────────────
function formatCurrency(amount, currency = 'INR', locale = 'en-IN') {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(amount);
}
function roundCurrency(amount) {
    return Math.round(amount * 100) / 100;
}
// ─── Order ────────────────────────────────────────────────────────────────────
function isValidStatusTransition(from, to) {
    const allowed = index_1.ORDER_STATUS_TRANSITIONS[from];
    return allowed.includes(to);
}
function generateOrderNumber(sequence) {
    return `ORD-${String(sequence).padStart(4, '0')}`;
}
// ─── Slug ─────────────────────────────────────────────────────────────────────
function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);
}
// ─── Date/Time ────────────────────────────────────────────────────────────────
function formatDate(date, locale = 'en-IN') {
    return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date));
}
function formatDateTime(date, timezone = 'Asia/Kolkata') {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone,
    }).format(new Date(date));
}
function isRestaurantOpen(hours, timezone = 'Asia/Kolkata') {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
    const dayOfWeek = now.getDay();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentMins = currentHour * 60 + currentMin;
    const todayHours = hours.find((h) => h.dayOfWeek === dayOfWeek);
    if (!todayHours || todayHours.isClosed)
        return false;
    const [openH, openM] = todayHours.openTime.split(':').map(Number);
    const [closeH, closeM] = todayHours.closeTime.split(':').map(Number);
    if (openH === undefined || openM === undefined || closeH === undefined || closeM === undefined)
        return true;
    const openMins = openH * 60 + openM;
    const closeMins = closeH * 60 + closeM;
    return currentMins >= openMins && currentMins < closeMins;
}
function calculateOrderTotals(itemsTotal, taxRate, serviceChargeRate, discountAmount = 0) {
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
function truncate(str, length) {
    if (str.length <= length)
        return str;
    return str.substring(0, length - 3) + '...';
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
function generatePassword(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    return password;
}
// ─── Color Helpers ────────────────────────────────────────────────────────────
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1] ?? '0', 16),
            g: parseInt(result[2] ?? '0', 16),
            b: parseInt(result[3] ?? '0', 16),
        }
        : null;
}
function getContrastColor(hexColor) {
    const rgb = hexToRgb(hexColor);
    if (!rgb)
        return 'black';
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? 'black' : 'white';
}
//# sourceMappingURL=index.js.map