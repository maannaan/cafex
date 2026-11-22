'use client';

import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { FulfilmentType } from '@cafex/shared-types';

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    setDrawerOpen,
    updateQuantity,
    removeItem,
    couponCode,
    setCouponCode,
    fulfilmentType,
    setFulfilmentType,
    quote,
    isLoadingQuote,
    setCheckoutOpen,
  } = useCartStore();

  if (!isDrawerOpen) return null;

  const currencySymbol = '₹';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-stone-950 border-l border-stone-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h2 className="font-serif text-xl font-bold text-white">Your Selection</h2>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Fulfilment Selector */}
          <div className="px-6 py-3 bg-stone-900/60 border-b border-stone-800/80 flex gap-2">
            {[
              { type: FulfilmentType.PICKUP, label: 'Counter Pickup' },
              { type: FulfilmentType.DINE_IN, label: 'Dine-In' },
              { type: FulfilmentType.DELIVERY, label: 'City Delivery (+₹50)' },
            ].map((f) => (
              <button
                key={f.type}
                onClick={() => setFulfilmentType(f.type)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  fulfilmentType === f.type
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-800/50 text-stone-400 hover:text-stone-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-stone-500 space-y-3">
                <ShoppingBag className="w-12 h-12 stroke-[1.2] text-stone-700" />
                <p className="text-sm font-medium">Your basket is currently empty.</p>
                <p className="text-xs text-stone-400 max-w-xs">
                  Explore our single-origin roasts and freshly baked pastries to start an order.
                </p>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={`${item.productId}-${idx}`}
                  className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 flex gap-4"
                >
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-16 h-16 rounded-lg object-cover bg-stone-800 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{item.productName}</h4>
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <p className="text-xs text-amber-200/70 truncate mt-0.5">
                        {item.selectedOptions.map((o) => o.optionName).join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-stone-400 mt-1">
                      {currencySymbol}{(item.lineTotalMinor / 100).toFixed(2)}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-stone-700 rounded-lg bg-stone-950 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(idx, item.quantity - 1)}
                          className="p-1 hover:bg-stone-800 text-stone-300"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(idx, item.quantity + 1)}
                          className="p-1 hover:bg-stone-800 text-stone-300"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(idx)}
                        className="text-stone-500 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout calculation */}
          {items.length > 0 && (
            <div className="p-6 border-t border-stone-800 bg-stone-950/80 space-y-4">
              {/* Promo code */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    placeholder="Promo code (e.g. WELCOME10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white placeholder-stone-500 uppercase tracking-wider focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="text-xs space-y-1.5 text-stone-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-stone-200">
                    {currencySymbol}{((quote?.subtotalMinor || 0) / 100).toFixed(2)}
                  </span>
                </div>
                {quote && quote.discountMinor > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-{currencySymbol}{(quote.discountMinor / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (5% GST)</span>
                  <span className="text-stone-200">
                    {currencySymbol}{((quote?.taxMinor || 0) / 100).toFixed(2)}
                  </span>
                </div>
                {quote && quote.deliveryFeeMinor > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="text-stone-200">
                      {currencySymbol}{(quote.deliveryFeeMinor / 100).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-stone-800 flex justify-between text-sm font-bold text-white">
                  <span>Authoritative Total</span>
                  <span className="text-amber-400">
                    {isLoadingQuote ? (
                      <span className="animate-pulse">Validating...</span>
                    ) : (
                      `${currencySymbol}${((quote?.totalMinor || 0) / 100).toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setCheckoutOpen(true);
                }}
                disabled={isLoadingQuote || !quote}
                className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all duration-300"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

