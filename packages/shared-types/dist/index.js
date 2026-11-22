"use strict";
// Shared Business Enums & Interfaces
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationStatus = exports.PaymentStatus = exports.OrderStatus = exports.FulfilmentType = exports.RoleType = void 0;
var RoleType;
(function (RoleType) {
    RoleType["ADMIN"] = "ADMIN";
    RoleType["MANAGER"] = "MANAGER";
    RoleType["STAFF"] = "STAFF";
    RoleType["CUSTOMER"] = "CUSTOMER";
})(RoleType || (exports.RoleType = RoleType = {}));
var FulfilmentType;
(function (FulfilmentType) {
    FulfilmentType["PICKUP"] = "PICKUP";
    FulfilmentType["DINE_IN"] = "DINE_IN";
    FulfilmentType["DELIVERY"] = "DELIVERY";
})(FulfilmentType || (exports.FulfilmentType = FulfilmentType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING_PAYMENT"] = "PENDING_PAYMENT";
    OrderStatus["PLACED"] = "PLACED";
    OrderStatus["ACCEPTED"] = "ACCEPTED";
    OrderStatus["PREPARING"] = "PREPARING";
    OrderStatus["READY"] = "READY";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["PAYMENT_FAILED"] = "PAYMENT_FAILED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["AUTHORIZED"] = "AUTHORIZED";
    PaymentStatus["CAPTURED"] = "CAPTURED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var ReservationStatus;
(function (ReservationStatus) {
    ReservationStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    ReservationStatus["CONFIRMED"] = "CONFIRMED";
    ReservationStatus["SEATED"] = "SEATED";
    ReservationStatus["COMPLETED"] = "COMPLETED";
    ReservationStatus["CANCELLED"] = "CANCELLED";
    ReservationStatus["REJECTED"] = "REJECTED";
    ReservationStatus["NO_SHOW"] = "NO_SHOW";
})(ReservationStatus || (exports.ReservationStatus = ReservationStatus = {}));
//# sourceMappingURL=index.js.map