"use strict";
// ─── Enums ───────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrTokenType = exports.DiscountType = exports.PaymentStatus = exports.PaymentMethod = exports.DishType = exports.OrderType = exports.OrderStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["OWNER"] = "owner";
    UserRole["MANAGER"] = "manager";
    UserRole["KITCHEN"] = "kitchen";
    UserRole["WAITER"] = "waiter";
    UserRole["CUSTOMER"] = "customer";
})(UserRole || (exports.UserRole = UserRole = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["PLACED"] = "placed";
    OrderStatus["ACCEPTED"] = "accepted";
    OrderStatus["PREPARING"] = "preparing";
    OrderStatus["READY"] = "ready";
    OrderStatus["SERVED"] = "served";
    OrderStatus["CANCELLED"] = "cancelled";
    OrderStatus["REFUNDED"] = "refunded";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var OrderType;
(function (OrderType) {
    OrderType["DINE_IN"] = "dine_in";
    OrderType["TAKEAWAY"] = "takeaway";
    OrderType["DELIVERY"] = "delivery";
})(OrderType || (exports.OrderType = OrderType = {}));
var DishType;
(function (DishType) {
    DishType["VEG"] = "veg";
    DishType["NON_VEG"] = "non_veg";
    DishType["VEGAN"] = "vegan";
    DishType["EGG"] = "egg";
})(DishType || (exports.DishType = DishType = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["UPI"] = "upi";
    PaymentMethod["CARD"] = "card";
    PaymentMethod["WALLET"] = "wallet";
    PaymentMethod["RAZORPAY"] = "razorpay";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var DiscountType;
(function (DiscountType) {
    DiscountType["PERCENTAGE"] = "percentage";
    DiscountType["FIXED"] = "fixed";
})(DiscountType || (exports.DiscountType = DiscountType = {}));
var QrTokenType;
(function (QrTokenType) {
    QrTokenType["TABLE"] = "table";
    QrTokenType["TAKEAWAY"] = "takeaway";
    QrTokenType["DELIVERY"] = "delivery";
})(QrTokenType || (exports.QrTokenType = QrTokenType = {}));
//# sourceMappingURL=index.js.map