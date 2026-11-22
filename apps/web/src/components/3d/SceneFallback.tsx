'use client';

import React from 'react';
import { Coffee } from 'lucide-react';

export function SceneFallback() {
  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 border border-stone-800/80 flex flex-col items-center justify-center p-8 text-center overflow-hidden">
      {/* Ambient warm radial glow */}
      <div className="absolute w-72 h-72 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        <div className="w-24 h-24 mx-auto rounded-full bg-stone-900 border border-amber-600/30 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-950/40">
          <Coffee className="w-12 h-12 stroke-[1.2]" />
        </div>
        <div className="space-y-1">
          <h4 className="font-serif text-lg font-bold text-white tracking-wide">
            Cafex Signature Cup
          </h4>
          <p className="text-xs text-stone-400 max-w-xs mx-auto">
            Single-origin Ethiopian Yirgacheffe poured over textured microfoam.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-700/30 text-[11px] font-semibold text-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          Interactive 3D Ready
        </div>
      </div>
    </div>
  );
}
