'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Calendar, Menu as MenuIcon, X, Coffee } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);

  const totalItemCount = items.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif text-2xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
              CAFEX
            </span>
            <span className="block text-[10px] tracking-widest uppercase text-amber-200/60 font-medium">
              Artisan Roastery
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-300">
          <Link href="/" className="hover:text-amber-400 transition-colors">
            Home
          </Link>
          <Link href="/menu" className="hover:text-amber-400 transition-colors">
            Menu & Roasts
          </Link>
          <Link href="/story" className="hover:text-amber-400 transition-colors">
            Our Story
          </Link>
          <Link href="/reservations" className="hover:text-amber-400 transition-colors">
            Reserve Table
          </Link>
          <Link href="/visit" className="hover:text-amber-400 transition-colors">
            Visit & Hours
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/reservations"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-amber-600/30 text-amber-300 hover:bg-amber-600/10 text-xs font-semibold tracking-wide uppercase transition-all duration-300"
          >
            <Calendar className="w-3.5 h-3.5" />
            Book Seating
          </Link>

          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open Shopping Cart"
            className="relative p-2.5 rounded-full bg-stone-900 border border-stone-800 text-stone-200 hover:text-amber-400 hover:border-amber-600/50 transition-all duration-300"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center animate-pulse">
                {totalItemCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
            className="md:hidden p-2 text-stone-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-stone-950/95 border-b border-stone-800 px-6 py-6 space-y-4 backdrop-blur-xl animate-fadeIn">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-stone-200 hover:text-amber-400"
          >
            Home
          </Link>
          <Link
            href="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-stone-200 hover:text-amber-400"
          >
            Menu & Roasts
          </Link>
          <Link
            href="/story"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-stone-200 hover:text-amber-400"
          >
            Our Story
          </Link>
          <Link
            href="/reservations"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-stone-200 hover:text-amber-400"
          >
            Reserve Table
          </Link>
          <Link
            href="/visit"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-stone-200 hover:text-amber-400"
          >
            Visit & Hours
          </Link>
          <div className="pt-2">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-stone-400 hover:text-amber-400"
            >
              Owner & Staff Portal →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

