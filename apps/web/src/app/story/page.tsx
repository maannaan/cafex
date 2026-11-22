import React from 'react';
import Link from 'next/link';
import { Coffee, Flame, Heart, Compass, ArrowRight } from 'lucide-react';

export default function StoryPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold tracking-widest uppercase text-amber-500">
          Our Roasting Philosophy
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
          Obsession with the Craft of Coffee.
        </h1>
        <p className="text-base text-stone-300 leading-relaxed">
          Born out of a reverence for single origins and slow living, Cafex is a union of scientific roasting precision and serene interior architecture.
        </p>
      </div>

      {/* Narrative Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <img
          src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1000&q=80"
          alt="Coffee roasting process"
          className="rounded-3xl border border-stone-800 object-cover w-full h-[450px] shadow-2xl"
        />
        <div className="space-y-6">
          <div className="w-10 h-10 rounded-full bg-amber-600/20 border border-amber-600/30 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-white">
            Micro-Lot Roasting with Thermodynamic Control
          </h2>
          <p className="text-sm text-stone-300 leading-relaxed">
            We source green beans exclusively from high-altitude estates across Ethiopia, Colombia, Guatemala, and Karnataka. Every roasting profile is customized using real-time thermodynamic curve logging, ensuring each bean reveals its inherent floral esters, sweet stone-fruit acidity, and caramel sugars without scorched bitterness.
          </p>
          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 text-xs text-stone-400 italic">
            &ldquo;A great roast doesn&apos;t impose flavor; it unmasks the soil, the elevation, and the hands that harvested it.&rdquo;
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
        <div className="space-y-6 order-2 md:order-1">
          <div className="w-10 h-10 rounded-full bg-amber-600/20 border border-amber-600/30 flex items-center justify-center text-amber-400">
            <Heart className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-white">
            The Physical Atmosphere as Digital Experience
          </h2>
          <p className="text-sm text-stone-300 leading-relaxed">
            Our physical cafe in the Arts District is crafted with hand-troweled terracotta, blackened steel counters, and gentle acoustic warmth. We built this 3D commerce platform so that when you browse our roasts remotely, you feel the same tranquil sensory connection as someone sitting by our pour-over bar.
          </p>
          <Link
            href="/reservations"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs tracking-wider uppercase transition-colors"
          >
            Experience It In Person · Book a Table <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <img
          src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80"
          alt="Cafe seating area"
          className="rounded-3xl border border-stone-800 object-cover w-full h-[450px] shadow-2xl order-1 md:order-2"
        />
      </div>
    </div>
  );
}
