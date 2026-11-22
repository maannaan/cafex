'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowRight, Sparkles, Award, Coffee, Clock, Compass, ShieldCheck } from 'lucide-react';
import { SceneFallback } from '../components/3d/SceneFallback';
import { useCartStore } from '../stores/cartStore';

// Dynamically import Three.js HeroScene with SSR disabled for optimal First Contentful Paint
const HeroScene = dynamic(
  () => import('../components/3d/HeroScene').then((mod) => mod.HeroScene),
  {
    ssr: false,
    loading: () => <SceneFallback />,
  }
);

export default function HomePage() {
  const [signatureProducts, setSignatureProducts] = useState<any[]>([]);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    // Fetch menu from backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    fetch(`${apiUrl}/menu`)
      .then((res) => (res.ok ? res.json() : []))
      .then((categories) => {
        if (categories && categories.length > 0) {
          // Extract signature products or first category products
          const sigCat = categories.find((c: any) => c.slug === 'signature-drinks') || categories[0];
          setSignatureProducts(sigCat?.products?.slice(0, 3) || []);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-24 pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/40 border border-amber-600/30 text-amber-300 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Micro-Lot Roasting · Handcrafted Pours
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Slow Crafted Coffee. <br />
              <span className="amber-gradient-text">Sensory Atmosphere.</span>
            </h1>

            <p className="text-base text-stone-300 max-w-xl leading-relaxed">
              Step inside Cafex Roastery. We bridge physical estate roasts, calibrated Italian pressure extractions, and mindful culinary craftsmanship into an immersive digital cafe experience.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/menu"
                className="px-6 py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold text-sm rounded-full tracking-wide shadow-lg shadow-amber-950/40 flex items-center gap-2 transition-all duration-300"
              >
                Explore Roastery Menu <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/reservations"
                className="px-6 py-3.5 rounded-full border border-stone-800 bg-stone-900/60 hover:bg-stone-800 text-stone-200 font-semibold text-sm tracking-wide transition-all duration-300"
              >
                Reserve Table Seating
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="pt-8 border-t border-stone-900 grid grid-cols-3 gap-6 text-left">
              <div>
                <span className="font-serif text-2xl font-bold text-amber-400">100%</span>
                <p className="text-xs text-stone-400 mt-0.5">High-altitude Arabica</p>
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-amber-400">48h</span>
                <p className="text-xs text-stone-400 mt-0.5">Anaerobic fermentation</p>
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-amber-400">42°</span>
                <p className="text-xs text-stone-400 mt-0.5">Precision extraction angle</p>
              </div>
            </div>
          </div>

          {/* Right 3D Experience Column */}
          <div className="lg:col-span-6 relative">
            <HeroScene />
          </div>
        </div>
      </section>

      {/* 2. SIGNATURE CREATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-widest uppercase text-amber-500">
              Curated Roasts
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Signature House Creations
            </h2>
          </div>
          <Link
            href="/menu"
            className="text-amber-400 hover:text-amber-300 text-sm font-semibold flex items-center gap-1.5 mt-4 md:mt-0"
          >
            View Complete Menu ({signatureProducts.length > 0 ? '5 Categories' : 'Loading...'}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(signatureProducts.length > 0
            ? signatureProducts
            : [
                {
                  id: 'fallback-1',
                  name: 'Artisan Amber Latte',
                  slug: 'artisan-amber-latte',
                  description: 'Ethiopian Yirgacheffe, steamed oat milk, raw cardamom honey & Madagascar vanilla.',
                  basePriceMinor: 32000,
                  imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80',
                  dietaryNotes: ['Vegetarian', 'Honey Cardamom'],
                },
                {
                  id: 'fallback-2',
                  name: 'Smoked Sea Salt Cortado',
                  slug: 'smoked-sea-salt-cortado',
                  description: '1:1 ratio of intense ristretto and silky milk with Maldon smoked sea salt flake.',
                  basePriceMinor: 26000,
                  imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
                  dietaryNotes: ['Vegetarian'],
                },
                {
                  id: 'fallback-3',
                  name: 'Nitro Cascade Cold Brew',
                  slug: 'nitro-cascade-cold-brew',
                  description: '20-hour steep infused with nitrogen for a velvety stout-like foam cap.',
                  basePriceMinor: 28000,
                  imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
                  dietaryNotes: ['Vegan'],
                },
              ]
          ).map((prod) => (
            <div
              key={prod.id}
              className="group card-gradient rounded-2xl overflow-hidden hover:border-amber-600/40 transition-all duration-300 flex flex-col"
            >
              <div className="relative h-60 overflow-hidden bg-stone-900">
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {prod.dietaryNotes?.map((note: string) => (
                    <span
                      key={note}
                      className="px-2.5 py-1 rounded-full bg-stone-950/80 backdrop-blur-md text-[10px] font-semibold text-amber-300 border border-stone-800"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-serif text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                      {prod.name}
                    </h3>
                    <span className="font-semibold text-amber-400 text-base flex-shrink-0">
                      ₹{(prod.basePriceMinor / 100).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() =>
                      addItem({
                        productId: prod.id,
                        productName: prod.name,
                        productImage: prod.imageUrl,
                        basePriceMinor: prod.basePriceMinor,
                        quantity: 1,
                        selectedOptions: [],
                        lineTotalMinor: prod.basePriceMinor,
                      })
                    }
                    className="flex-1 py-2.5 bg-stone-900 hover:bg-amber-600 border border-stone-800 hover:border-amber-500 text-white rounded-xl text-xs font-semibold tracking-wide transition-all duration-200"
                  >
                    Quick Add to Order
                  </button>
                  <Link
                    href={`/menu#${prod.slug}`}
                    className="p-2.5 rounded-xl border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-white transition-colors"
                    title="Customize item"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ROASTERY ATMOSPHERE & ETHOS */}
      <section className="bg-stone-900/40 border-y border-stone-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold tracking-widest uppercase text-amber-500">
              The Architecture of Atmosphere
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
              A Space Built for Contemplation, Microfoam & Unhurried Mornings.
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed">
              Our brick-and-mortar sanctuary features custom blackened steel counters, natural terracotta acoustics, and low-temperature diffused studio lighting. We calibrate water mineral profiles every sunrise to unlock the volatile floral esters of high-altitude origins.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800/80 space-y-1">
                <Coffee className="w-5 h-5 text-amber-500 mb-2" />
                <h4 className="text-sm font-semibold text-white">Direct Trade Lots</h4>
                <p className="text-xs text-stone-400">Sourced directly from family-run high estates.</p>
              </div>
              <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800/80 space-y-1">
                <Clock className="w-5 h-5 text-amber-500 mb-2" />
                <h4 className="text-sm font-semibold text-white">Dialed-In Daily</h4>
                <p className="text-xs text-stone-400">TDS refractometer checks on every batch.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80"
              alt="Cafex interior atmosphere"
              className="rounded-3xl shadow-2xl border border-stone-800 object-cover w-full h-[420px]"
            />
            <div className="absolute -bottom-6 -left-6 p-6 rounded-2xl bg-stone-950/95 border border-stone-800 shadow-xl max-w-xs backdrop-blur-md hidden sm:block">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
                <Compass className="w-4 h-4" /> Roastery Arts District
              </div>
              <p className="text-xs text-stone-300">
                Open 7 days a week for specialty coffee tastings, quiet work sessions, and curated dine-in reservations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TABLE RESERVATIONS TEASER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-amber-950/30 via-stone-900/60 to-stone-900 border border-amber-600/20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold tracking-widest uppercase text-amber-400">
              Table & Tasting Seating
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Reserve Your Table for Micro-Lot Pours
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Guarantee seating for your next morning meeting, solo reading session, or multi-course coffee flight tasting. Instant confirmation with real-time capacity checks.
            </p>
          </div>
          <Link
            href="/reservations"
            className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm rounded-full tracking-wide shadow-xl flex-shrink-0 transition-all duration-300"
          >
            Check Slot Availability →
          </Link>
        </div>
      </section>
    </div>
  );
}
