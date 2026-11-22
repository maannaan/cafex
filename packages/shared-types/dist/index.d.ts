export declare enum RoleType {
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    STAFF = "STAFF",
    CUSTOMER = "CUSTOMER"
}
export declare enum FulfilmentType {
    PICKUP = "PICKUP",
    DINE_IN = "DINE_IN",
    DELIVERY = "DELIVERY"
}
export declare enum OrderStatus {
    PENDING_PAYMENT = "PENDING_PAYMENT",
    PLACED = "PLACED",
    ACCEPTED = "ACCEPTED",
    PREPARING = "PREPARING",
    READY = "READY",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    PAYMENT_FAILED = "PAYMENT_FAILED"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    AUTHORIZED = "AUTHORIZED",
    CAPTURED = "CAPTURED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare enum ReservationStatus {
    PENDING_APPROVAL = "PENDING_APPROVAL",
    CONFIRMED = "CONFIRMED",
    SEATED = "SEATED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    REJECTED = "REJECTED",
    NO_SHOW = "NO_SHOW"
}
export interface ProductOption {
    id: string;
    name: string;
    priceDeltaMinor: number;
    isAvailable: boolean;
}
export interface ProductOptionGroup {
    id: string;
    name: string;
    minSelect: number;
    maxSelect: number;
    options: ProductOption[];
}
export interface Product {
    id: string;
    categoryId: string;
    name: string;
    slug: string;
    description: string;
    basePriceMinor: number;
    imageUrl: string;
    modelUrl?: string | null;
    isAvailable: boolean;
    dietaryNotes: string[];
    sortOrder: number;
    optionGroups?: ProductOptionGroup[];
}
export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    sortOrder: number;
    isActive: boolean;
    products?: Product[];
}
export interface CartItemOption {
    groupId: string;
    groupName: string;
    optionId: string;
    optionName: string;
    priceDeltaMinor: number;
}
export interface CartItem {
    productId: string;
    productName: string;
    productImage: string;
    basePriceMinor: number;
    quantity: number;
    selectedOptions: CartItemOption[];
    lineTotalMinor: number;
}
export interface QuoteRequestDto {
    items: Array<{
        productId: string;
        quantity: number;
        optionIds?: string[];
    }>;
    couponCode?: string;
    fulfilmentType: FulfilmentType;
}
export interface QuoteResponseDto {
    subtotalMinor: number;
    discountMinor: number;
    taxMinor: number;
    deliveryFeeMinor: number;
    totalMinor: number;
    items: Array<{
        productId: string;
        productName: string;
        unitPriceMinor: number;
        quantity: number;
        options: Array<{
            name: string;
            priceDeltaMinor: number;
        }>;
        lineTotalMinor: number;
    }>;
}
export interface CreateOrderDto {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    fulfilmentType: FulfilmentType;
    items: Array<{
        productId: string;
        quantity: number;
        optionIds?: string[];
    }>;
    couponCode?: string;
    notes?: string;
    idempotencyKey?: string;
}
export interface OrderResponseDto {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    fulfilmentType: FulfilmentType;
    status: OrderStatus;
    subtotalMinor: number;
    taxMinor: number;
    discountMinor: number;
    deliveryFeeMinor: number;
    totalMinor: number;
    notes?: string | null;
    paymentSession?: {
        provider: string;
        orderId: string;
        amountMinor: number;
        currency: string;
        keyId: string;
    };
    createdAt: string;
}
export interface ReservationRequestDto {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    date: string;
    timeSlot: string;
    partySize: number;
    specialNotes?: string;
}
export interface BusinessSettingsDto {
    cafeName: string;
    tagline: string;
    address: string;
    phone: string;
    email: string;
    currency: string;
    currencySymbol: string;
    timezone: string;
    openingHours: Record<string, string>;
    taxPercentage: number;
    deliveryEnabled: boolean;
}
//# sourceMappingURL=index.d.ts.map