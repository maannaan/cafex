'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, Clock, Coffee, PackageCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { OrderStatus } from '@cafex/shared-types';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;

  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOrder = () => {
    if (!orderNumber) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    fetch(`${apiUrl}/orders/${orderNumber}`)
      .then((res) => {
        if (!res.ok) throw new Error('Order not found');
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setErrorMsg(err.message);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 6000);
    return () => clearInterval(interval);
  }, [orderNumber]);

  const stages = [
    { key: OrderStatus.PLACED, label: 'Order Received', desc: 'Sent to roastery bar' },
    { key: OrderStatus.ACCEPTED, label: 'Accepted', desc: 'Barista queue confirmed' },
    { key: OrderStatus.PREPARING, label: 'Brewing & Baking', desc: 'Dialing in espresso & steaming' },
    { key: OrderStatus.READY, label: 'Ready for Pickup', desc: 'Waiting at the counter' },
    { key: OrderStatus.COMPLETED, label: 'Handed Over', desc: 'Enjoy your coffee' },
  ];

  const getStageIndex = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING_PAYMENT:
        return -1;
      case OrderStatus.PLACED:
        return 0;
      case OrderStatus.ACCEPTED:
        return 1;
      case OrderStatus.PREPARING:
        return 2;
      case OrderStatus.READY:
        return 3;
      case OrderStatus.COMPLETED:
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = order ? getStageIndex(order.status) : 0;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center text-stone-500 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
        <p className="text-sm">Connecting to live order tracker...</p>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-white">Order Lookup Failed</h2>
        <p className="text-xs text-stone-400">Could not locate order #{orderNumber}. Check the number and try again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-stone-900 border border-stone-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Real-Time Order Tracking
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Placed on {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {order.fulfilmentType}
          </p>
        </div>
        <button
          onClick={fetchOrder}
          className="self-start sm:self-center px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
        </button>
      </div>

      {/* Live Lifecycle Stepper */}
      <div className="p-8 rounded-3xl card-gradient shadow-2xl space-y-8">
        <div className="space-y-6">
          {stages.map((stage, idx) => {
            const isDone = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={stage.key} className="flex items-start gap-4 relative">
                {idx < stages.length - 1 && (
                  <div
                    className={`absolute left-4 top-8 w-0.5 h-10 ${
                      idx < currentIndex ? 'bg-amber-500' : 'bg-stone-800'
                    }`}
                  />
                )}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                    isDone
                      ? 'bg-amber-600 text-white'
                      : isCurrent
                      ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-400 animate-pulse'
                      : 'bg-stone-900 border border-stone-800 text-stone-600'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{idx + 1}</span>
                  )}
                </div>

                <div className="space-y-0.5">
                  <h4
                    className={`text-sm font-bold ${
                      isCurrent ? 'text-amber-400' : isDone ? 'text-white' : 'text-stone-500'
                    }`}
                  >
                    {stage.label}
                  </h4>
                  <p className="text-xs text-stone-400">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Summary & Total Paid */}
      <div className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-4">
        <h3 className="font-serif text-lg font-bold text-white border-b border-stone-800 pb-3">
          Order Summary
        </h3>
        <div className="text-xs space-y-2 text-stone-300">
          <div className="flex justify-between text-stone-400">
            <span>Customer Name</span>
            <span className="text-white font-medium">{order.customerName}</span>
          </div>
          <div className="flex justify-between text-stone-400">
            <span>Email</span>
            <span className="text-white font-medium">{order.customerEmail}</span>
          </div>
          <div className="flex justify-between text-stone-400">
            <span>Subtotal</span>
            <span>₹{(order.subtotalMinor / 100).toFixed(2)}</span>
          </div>
          {order.discountMinor > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Discount</span>
              <span>-₹{(order.discountMinor / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-stone-400">
            <span>Tax (5% GST)</span>
            <span>₹{(order.taxMinor / 100).toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-stone-800 flex justify-between font-bold text-sm text-white">
            <span>Total Paid (Sandbox Verified)</span>
            <span className="text-amber-400">₹{(order.totalMinor / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
