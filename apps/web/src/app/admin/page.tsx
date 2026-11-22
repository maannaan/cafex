'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  ShoppingBag,
  Calendar,
  Coffee,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { OrderStatus, ReservationStatus } from '@cafex/shared-types';

export default function AdminDashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('admin@cafexartisan.com');
  const [password, setPassword] = useState('CafexAdmin2026!');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'reservations'>('orders');
  const [stats, setStats] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Check saved token on mount
  useEffect(() => {
    const saved = localStorage.getItem('cafex_admin_token');
    if (saved) {
      setToken(saved);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error('Invalid email or password');
      }

      const data = await res.json();
      localStorage.setItem('cafex_admin_token', data.accessToken);
      setToken(data.accessToken);
      setIsLoggingIn(false);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cafex_admin_token');
    setToken(null);
  };

  const fetchDashboardData = async () => {
    if (!token) return;
    setIsLoadingData(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [statsRes, ordersRes, productsRes, resRes] = await Promise.all([
        fetch(`${apiUrl}/admin/stats`, { headers }),
        fetch(`${apiUrl}/admin/orders`, { headers }),
        fetch(`${apiUrl}/admin/products`, { headers }),
        fetch(`${apiUrl}/admin/reservations`, { headers }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (resRes.ok) setReservations(await resRes.json());
      setIsLoadingData(false);
    } catch {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    await fetch(`${apiUrl}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchDashboardData();
  };

  const toggleProductAvailability = async (productId: string, currentVal: boolean) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    await fetch(`${apiUrl}/admin/products/${productId}/availability`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isAvailable: !currentVal }),
    });
    fetchDashboardData();
  };

  const updateProductPrice = async (productId: string, priceRupees: string) => {
    const minorUnits = Math.round(parseFloat(priceRupees) * 100);
    if (isNaN(minorUnits) || minorUnits < 0) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    await fetch(`${apiUrl}/admin/products/${productId}/price`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ basePriceMinor: minorUnits }),
    });
    fetchDashboardData();
  };

  const updateReservationStatus = async (id: string, status: ReservationStatus) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    await fetch(`${apiUrl}/admin/reservations/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    fetchDashboardData();
  };

  // If not authenticated, render Login Modal
  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-24">
        <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-amber-600/20 border border-amber-600/30 text-amber-500 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-white">Owner & Staff Portal</h2>
            <p className="text-xs text-stone-400">
              Sign in to manage live orders, menu pricing, availability, and reservations.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-600"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-colors shadow-lg"
            >
              {isLoggingIn ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <p className="text-[11px] text-stone-500 text-center">
            Demo Credentials pre-filled: admin@cafexartisan.com
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Operational Console
          </div>
          <h1 className="font-serif text-3xl font-bold text-white mt-1">Roastery Operations</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-semibold text-stone-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1">
          <span className="text-xs font-semibold text-stone-400">Today&apos;s Revenue</span>
          <p className="font-serif text-2xl font-bold text-amber-400">
            ₹{((stats?.todayRevenueMinor || 0) / 100).toFixed(2)}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1">
          <span className="text-xs font-semibold text-stone-400">Today&apos;s Orders</span>
          <p className="font-serif text-2xl font-bold text-white">{stats?.todayOrdersCount || 0}</p>
        </div>
        <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1">
          <span className="text-xs font-semibold text-stone-400">Active Queue</span>
          <p className="font-serif text-2xl font-bold text-amber-500">
            {stats?.activePendingOrders || 0}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1">
          <span className="text-xs font-semibold text-stone-400">Upcoming Reservations</span>
          <p className="font-serif text-2xl font-bold text-white">
            {stats?.upcomingReservationsCount || 0}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-stone-800 pb-3">
        {[
          { key: 'orders', label: `Orders Queue (${orders.length})` },
          { key: 'menu', label: `Menu Manager (${products.length})` },
          { key: 'reservations', label: `Reservations (${reservations.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.key
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ORDERS QUEUE */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-stone-500">No orders currently in queue.</div>
          ) : (
            orders.map((o) => (
              <div
                key={o.id}
                className="p-5 rounded-2xl bg-stone-900/70 border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">#{o.orderNumber}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/60">
                      {o.status}
                    </span>
                    <span className="text-xs text-stone-500">· {o.fulfilmentType}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">
                    {o.customerName} ({o.customerPhone})
                  </h4>
                  <p className="text-xs text-stone-400">
                    {o.items?.map((it: any) => `${it.quantity}x ${it.productName}`).join(', ')}
                  </p>
                  <p className="text-xs font-semibold text-amber-400">
                    Total: ₹{(o.totalMinor / 100).toFixed(2)}
                  </p>
                </div>

                {/* State Transition Actions */}
                <div className="flex flex-wrap gap-2">
                  {o.status === OrderStatus.PLACED && (
                    <button
                      onClick={() => updateOrderStatus(o.id, OrderStatus.ACCEPTED)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                    >
                      Accept Order
                    </button>
                  )}
                  {o.status === OrderStatus.ACCEPTED && (
                    <button
                      onClick={() => updateOrderStatus(o.id, OrderStatus.PREPARING)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
                    >
                      Start Brewing
                    </button>
                  )}
                  {o.status === OrderStatus.PREPARING && (
                    <button
                      onClick={() => updateOrderStatus(o.id, OrderStatus.READY)}
                      className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-semibold"
                    >
                      Mark Ready
                    </button>
                  )}
                  {o.status === OrderStatus.READY && (
                    <button
                      onClick={() => updateOrderStatus(o.id, OrderStatus.COMPLETED)}
                      className="px-3 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-white text-xs font-semibold"
                    >
                      Complete Handover
                    </button>
                  )}
                  {o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED && (
                    <button
                      onClick={() => updateOrderStatus(o.id, OrderStatus.CANCELLED)}
                      className="px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: MENU MANAGER */}
      {activeTab === 'menu' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-12 h-12 rounded-xl object-cover bg-stone-800"
                />
                <div>
                  <h4 className="text-sm font-semibold text-white">{p.name}</h4>
                  <p className="text-xs text-stone-500">{p.category?.name}</p>
                  <p className="text-xs text-amber-400 font-semibold">
                    ₹{(p.basePriceMinor / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleProductAvailability(p.id, p.isAvailable)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    p.isAvailable
                      ? 'bg-green-950 border border-green-800 text-green-400'
                      : 'bg-red-950 border border-red-800 text-red-400'
                  }`}
                >
                  {p.isAvailable ? 'In Stock' : 'Sold Out'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: RESERVATIONS */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          {reservations.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-400">
                    {new Date(r.date).toISOString().slice(0, 10)} at {r.timeSlot}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-800 text-stone-300">
                    {r.status}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white mt-1">
                  {r.customerName} · {r.partySize} Guests
                </h4>
                <p className="text-xs text-stone-400">{r.customerPhone} · {r.customerEmail}</p>
                {r.specialNotes && (
                  <p className="text-xs text-stone-500 italic mt-0.5">&ldquo;{r.specialNotes}&rdquo;</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {r.status === ReservationStatus.PENDING_APPROVAL && (
                  <button
                    onClick={() => updateReservationStatus(r.id, ReservationStatus.CONFIRMED)}
                    className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-semibold"
                  >
                    Confirm
                  </button>
                )}
                {r.status !== ReservationStatus.CANCELLED && (
                  <button
                    onClick={() => updateReservationStatus(r.id, ReservationStatus.CANCELLED)}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-red-950 text-stone-300 hover:text-red-300 text-xs font-semibold"
                  >
                    Decline
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

