import { create } from 'zustand';
import { CartItem, FulfilmentType, QuoteResponseDto } from '@cafex/shared-types';

interface CartState {
  items: CartItem[];
  couponCode: string;
  fulfilmentType: FulfilmentType;
  quote: QuoteResponseDto | null;
  isDrawerOpen: boolean;
  isCheckoutOpen: boolean;
  isLoadingQuote: boolean;
  
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  setCouponCode: (code: string) => void;
  setFulfilmentType: (type: FulfilmentType) => void;
  setDrawerOpen: (open: boolean) => void;
  setCheckoutOpen: (open: boolean) => void;
  fetchQuote: () => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  couponCode: '',
  fulfilmentType: FulfilmentType.PICKUP,
  quote: null,
  isDrawerOpen: false,
  isCheckoutOpen: false,
  isLoadingQuote: false,

  addItem: (newItem) => {
    const { items, fetchQuote } = get();
    // Check if duplicate with same options exists
    const existingIndex = items.findIndex(
      (it) =>
        it.productId === newItem.productId &&
        JSON.stringify(it.selectedOptions) === JSON.stringify(newItem.selectedOptions)
    );

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex].quantity += newItem.quantity;
      updated[existingIndex].lineTotalMinor =
        (updated[existingIndex].basePriceMinor +
          updated[existingIndex].selectedOptions.reduce((acc, opt) => acc + opt.priceDeltaMinor, 0)) *
        updated[existingIndex].quantity;
    } else {
      updated = [...items, newItem];
    }

    set({ items: updated, isDrawerOpen: true });
    fetchQuote();
  },

  removeItem: (index) => {
    const { items, fetchQuote } = get();
    const updated = items.filter((_, i) => i !== index);
    set({ items: updated });
    if (updated.length > 0) {
      fetchQuote();
    } else {
      set({ quote: null });
    }
  },

  updateQuantity: (index, quantity) => {
    const { items, fetchQuote } = get();
    if (quantity <= 0) {
      get().removeItem(index);
      return;
    }
    const updated = [...items];
    updated[index].quantity = quantity;
    const unitPrice =
      updated[index].basePriceMinor +
      updated[index].selectedOptions.reduce((acc, opt) => acc + opt.priceDeltaMinor, 0);
    updated[index].lineTotalMinor = unitPrice * quantity;
    set({ items: updated });
    fetchQuote();
  },

  setCouponCode: (code) => {
    set({ couponCode: code });
    get().fetchQuote();
  },

  setFulfilmentType: (type) => {
    set({ fulfilmentType: type });
    get().fetchQuote();
  },

  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
  setCheckoutOpen: (open) => set({ isCheckoutOpen: open }),

  fetchQuote: async () => {
    const { items, couponCode, fulfilmentType } = get();
    if (items.length === 0) {
      set({ quote: null });
      return;
    }

    set({ isLoadingQuote: true });
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const payload = {
        items: items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          optionIds: it.selectedOptions.map((opt) => opt.optionId),
        })),
        couponCode: couponCode ? couponCode.trim().toUpperCase() : undefined,
        fulfilmentType,
      };

      const res = await fetch(`${apiUrl}/orders/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const quote = await res.json();
        set({ quote, isLoadingQuote: false });
      } else {
        set({ isLoadingQuote: false });
      }
    } catch {
      set({ isLoadingQuote: false });
    }
  },

  clearCart: () => set({ items: [], quote: null, couponCode: '', isDrawerOpen: false, isCheckoutOpen: false }),
}));

