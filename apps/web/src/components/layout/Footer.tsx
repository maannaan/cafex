import React from 'react';
import Link from 'next/link';
import { Coffee, MapPin, Clock, Phone, Mail, Instagram, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-stone-950 border-t border-stone-900 text-stone-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white">
                <Coffee className="w-4 h-4" />
              </div>
              <span className="font-serif text-xl font-bold text-white tracking-wide">CAFEX</span>
            </div>
            <p className="text-xs leading-relaxed text-stone-400">
              A sensory sanctuary dedicated to micro-lot roasting, calibrated espresso extractions, and the quiet ritual of hand-poured single origins.
            </p>
            <div className="flex items-center gap-3 text-stone-400 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-stone-900 hover:text-amber-400 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Visiting & Hours */}
          <div className="space-y-3">
            <h4 className="font-serif text-white font-semibold tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Operating Hours
            </h4>
            <ul className="text-xs space-y-2 text-stone-400">
              <li className="flex justify-between">
                <span>Mon – Thu:</span> <span className="text-stone-300">07:30 – 20:30</span>
              </li>
              <li className="flex justify-between">
                <span>Friday:</span> <span className="text-stone-300">07:30 – 22:00</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday:</span> <span className="text-stone-300">08:00 – 22:00</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday:</span> <span className="text-stone-300">08:00 – 21:00</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Location & Contact */}
          <div className="space-y-3">
            <h4 className="font-serif text-white font-semibold tracking-wide flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" /> Roastery Address
            </h4>
            <p className="text-xs leading-relaxed text-stone-400">
              42 Roaster Walk, Arts District<br />
              New Delhi, India 110001
            </p>
            <div className="space-y-1 pt-1 text-xs">
              <div className="flex items-center gap-2 text-stone-400">
                <Phone className="w-3.5 h-3.5 text-amber-500" /> +91 98101 23456
              </div>
              <div className="flex items-center gap-2 text-stone-400">
                <Mail className="w-3.5 h-3.5 text-amber-500" /> roastery@cafexartisan.com
              </div>
            </div>
          </div>

          {/* Col 4: Operations & Licences */}
          <div className="space-y-3">
            <h4 className="font-serif text-white font-semibold tracking-wide">Portals & Policies</h4>
            <ul className="text-xs space-y-2">
              <li>
                <Link href="/admin" className="text-amber-400 hover:underline flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Staff & Owner Login
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-stone-200">Full Catalog & Allergens</Link>
              </li>
              <li>
                <Link href="/reservations" className="hover:text-stone-200">Table Reservation Policy</Link>
              </li>
              <li>
                <Link href="/visit" className="hover:text-stone-200">Curbside Pickup Instructions</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & 3D Legal Attribution */}
        <div className="mt-12 pt-8 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} Cafex Artisan Roastery. All rights reserved.</p>
          <p className="text-center sm:text-right text-[11px] text-stone-400">
            3D interactive coffee cup based on &ldquo;Coffee Mug&rdquo; by Ole Gunnar Isager licensed under CC-BY-4.0.
          </p>
        </div>
      </div>
    </footer>
  );
}

