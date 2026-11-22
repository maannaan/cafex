'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useRouter } from 'next/navigation';

export function CheckoutModal() {
  const router = useRouter();
  const {
    isCheckoutOpen,
    setCheckoutOpen,
    items,
    quote,
    couponCode,
    fulfilmentType,
    clearCart,
  } = useCartStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isCheckoutOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setErrorMsg('Please complete all contact details.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const orderPayload = {
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        fulfilmentType,
        items: items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          optionIds: it.selectedOptions.map((opt) => opt.optionId),
        })),
        couponCode: couponCode ? couponCode.trim().toUpperCase() : undefined,
        notes,
        idempotencyKey: `idemp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      };

      const res = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to place order');
      }

      const order = await res.json();

      // Trigger sandbox payment verification on backend
      await fetch(`${apiUrl}/payments/verify-sandbox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
          paymentId: `pay_sandbox_${Date.now()}`,
        }),
      });

      clearCart();
      setCheckoutOpen(false);
      router.push(`/orders/${order.orderNumber}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong during payment processing');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-stone-950 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={() => setCheckoutOpen(false)}
          className="absolute right-5 top-5 p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-amber-500 mb-2">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Secure Storefront Checkout</span>
        </div>

        <h3 className="font-serif text-2xl font-bold text-white">Order Details</h3>
        <p className="text-xs text-stone-400 mt-1">
          Review details and finalize with sandbox payment verification.
        </p>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-950/50 border border-red-800/80 rounded-lg text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCheckout} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya Lin"
              className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maya@example.com"
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Barista Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Extra hot, double sleeve, etc."
              className="w-full px-3.5 py-2 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-600 resize-none"
            />
          </div>

          {/* Locked Order Summary */}
          <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800/80 space-y-2 text-xs">
            <div className="flex justify-between text-stone-400">
              <span>Fulfilment Mode</span>
              <span className="font-semibold text-amber-300">{fulfilmentType}</span>
            </div>
            <div className="flex justify-between text-stone-400">
              <span>Items Count</span>
              <span>{items.reduce((acc, it) => acc + it.quantity, 0)} beverages & bakes</span>
            </div>
            <div className="pt-2 border-t border-stone-800 flex justify-between font-bold text-sm text-white">
              <span>Amount Payable</span>
              <span className="text-amber-400">₹{((quote?.totalMinor || 0) / 100).toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Authorizing Payment...</span>
            ) : (
              <>
                <CreditCard className="w-4 h-4" /> Pay & Place Order
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

