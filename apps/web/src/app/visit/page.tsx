import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Phone, Mail, Navigation, Calendar } from 'lucide-react';

export default function VisitPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest uppercase text-amber-500">
          Find Your Seat
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Visit the Roastery
        </h1>
        <p className="text-sm text-stone-400">
          Located in the heart of the Cultural Arts District. Drop in for espresso, curbside pickup, or reserve a dedicated tasting table.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Column */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl card-gradient space-y-4">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" /> Address & Transit
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              42 Roaster Walk, Arts District<br />
              New Delhi, India 110001
            </p>
            <p className="text-xs text-stone-400">
              Metro: Central Arts Station (Exit 2), 3-minute walking distance.
            </p>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 pt-1"
            >
              Open in Google Maps <Navigation className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-6 rounded-2xl card-gradient space-y-4">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" /> Opening Schedule
            </h3>
            <div className="text-xs space-y-2 text-stone-300">
              <div className="flex justify-between border-b border-stone-800 pb-1">
                <span>Monday – Thursday:</span> <span className="text-white">07:30 – 20:30</span>
              </div>
              <div className="flex justify-between border-b border-stone-800 pb-1">
                <span>Friday:</span> <span className="text-white">07:30 – 22:00</span>
              </div>
              <div className="flex justify-between border-b border-stone-800 pb-1">
                <span>Saturday:</span> <span className="text-white">08:00 – 22:00</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span> <span className="text-white">08:00 – 21:00</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl card-gradient space-y-4">
            <h3 className="font-serif text-lg font-bold text-white">Contact & Direct Inquiries</h3>
            <div className="text-xs space-y-2 text-stone-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" /> +91 98101 23456
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500" /> roastery@cafexartisan.com
              </div>
            </div>
          </div>
        </div>

        {/* Visual Map / Photo Column */}
        <div className="lg:col-span-2 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl relative min-h-[480px]">
          <img
            src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80"
            alt="Cafe bar atmosphere"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent p-8 flex flex-col justify-end">
            <h3 className="font-serif text-2xl font-bold text-white">Counter Service & Slow Bar</h3>
            <p className="text-xs text-stone-300 max-w-lg mt-1">
              Curbside pickup bays available directly in front. Bring your favorite reusable mug for a ₹20 discount on all house roasts.
            </p>
            <div className="pt-4">
              <Link
                href="/reservations"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs tracking-wider uppercase transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" /> Book Seating in Advance
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
