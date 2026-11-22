'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ReservationsPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [partySize, setPartySize] = useState(2);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch slot availability whenever date changes
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    fetch(`${apiUrl}/reservations/availability?date=${date}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.slots) {
          setSlots(data.slots);
          const firstAvailable = data.slots.find((s: any) => s.available);
          if (firstAvailable) {
            setSelectedSlot(firstAvailable.timeSlot);
          } else {
            setSelectedSlot('');
          }
        }
      })
      .catch(() => {});
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMsg('Please select an available seating slot');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${apiUrl}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          date,
          timeSlot: selectedSlot,
          partySize,
          specialNotes: notes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Unable to confirm reservation');
      }

      const booking = await res.json();
      setConfirmation(booking);
      setIsSubmitting(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit booking request');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest uppercase text-amber-500">
          Table Service & Tastings
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Reserve Seating
        </h1>
        <p className="text-sm text-stone-400">
          Book your table for specialty pour-overs, artisan breakfast bakes, or quiet laptop sessions. Instant slot verification.
        </p>
      </div>

      {confirmation ? (
        <div className="p-8 sm:p-10 rounded-3xl bg-stone-900 border border-stone-800 text-center space-y-6 shadow-2xl animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-green-950/60 border border-green-600/30 text-green-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold text-white">Table Confirmed</h2>
            <p className="text-sm text-stone-300">
              Thank you, <span className="font-semibold text-white">{confirmation.customerName}</span>. Your seating has been recorded in our roastery reservation ledger.
            </p>
          </div>

          <div className="max-w-xs mx-auto p-4 rounded-2xl bg-stone-950 border border-stone-800 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-stone-500">Date:</span>
              <span className="font-semibold text-white">{date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Seating Time:</span>
              <span className="font-semibold text-amber-400">{confirmation.timeSlot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Party Size:</span>
              <span className="font-semibold text-white">{confirmation.partySize} Guests</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Booking ID:</span>
              <span className="font-mono text-stone-300">{confirmation.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>

          <button
            onClick={() => setConfirmation(null)}
            className="px-6 py-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-white transition-colors"
          >
            Make Another Booking
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card-gradient rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/80 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Date & Guests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-amber-500" /> Select Date
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" /> Party Size
              </label>
              <div className="flex gap-2">
                {[1, 2, 4, 6, 8].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setPartySize(size)}
                    className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all ${
                      partySize === size
                        ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    {size} {size === 1 ? 'Guest' : 'Guests'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time Slots */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-stone-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Available Seating Slots ({date})
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {slots.map((s) => (
                <button
                  key={s.timeSlot}
                  type="button"
                  disabled={!s.available}
                  onClick={() => setSelectedSlot(s.timeSlot)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    !s.available
                      ? 'bg-stone-950/40 border-stone-900 text-stone-600 cursor-not-allowed line-through'
                      : selectedSlot === s.timeSlot
                      ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500'
                      : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <span className="text-sm font-bold">{s.timeSlot}</span>
                  <span className="text-[10px] text-stone-500 font-normal">
                    {s.available ? `${s.remainingCovers} seats` : 'Booked'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Customer Details */}
          <div className="pt-6 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Elena Rostova"
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="elena@example.com"
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Phone</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98101 23456"
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Dietary Allergens or Seating Preference (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Quiet corner table, high chair needed, etc."
              className="w-full px-3.5 py-2 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-600 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedSlot}
            className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl tracking-wide shadow-xl transition-all"
          >
            {isSubmitting ? 'Confirming Reservation...' : 'Confirm Table Reservation'}
          </button>
        </form>
      )}
    </div>
  );
}

