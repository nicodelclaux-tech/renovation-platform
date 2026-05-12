
'use client'

import React, { useState } from 'react';
import { Columns, ArrowLeftRight, Maximize2 } from 'lucide-react';

interface ComparisonViewProps {
  beforeImg: string;
  afterImg: string;
}

export const ComparisonView = ({ beforeImg, afterImg }: ComparisonViewProps) => {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border group">
      {/* After Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${afterImg})` }}
      />
      
      {/* Before Image (Clipped) */}
      <div 
        className="absolute inset-0 bg-cover bg-center border-r-2 border-accent"
        style={{ 
          backgroundImage: `url(${beforeImg})`,
          clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
        }}
      />

      {/* Slider Control */}
      <input 
        type="range"
        min="0"
        max="100"
        value={sliderPos}
        onChange={(e) => setSliderPos(Number(e.target.value))}
        className="absolute inset-0 opacity-0 cursor-ew-resize z-20"
      />

      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-accent z-10 pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/40">
           <ArrowLeftRight size={16} className="text-neutral" />
        </div>
      </div>

      <div className="absolute bottom-md left-md bg-primary/80 backdrop-blur-md px-xs py-1 rounded text-[10px] font-mono uppercase text-text-dim border border-border">Before: Original Space</div>
      <div className="absolute bottom-md right-md bg-accent/80 backdrop-blur-md px-xs py-1 rounded text-[10px] font-mono uppercase text-neutral border border-accent">After: AI Concept</div>
    </div>
  );
};
