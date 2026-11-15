"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, RefreshCw } from "lucide-react";

type BreathPhase = "Inhale" | "Hold" | "Exhale" | "Pause";

export const BreathingVisualizer: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("Inhale");
  const [seconds, setSeconds] = useState(4);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Classical calming 4s Inhale -> 2s Hold -> 8s Exhale -> 2s Pause
        if (phase === "Inhale") {
          setPhase("Hold");
          return 2;
        } else if (phase === "Hold") {
          setPhase("Exhale");
          return 8;
        } else if (phase === "Exhale") {
          setPhase("Pause");
          return 2;
        } else {
          setPhase("Inhale");
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase]);

  const handleToggle = () => {
    if (isActive) {
      setIsActive(false);
      setPhase("Inhale");
      setSeconds(4);
    } else {
      setIsActive(true);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase("Inhale");
    setSeconds(4);
    setTimeout(() => setIsActive(true), 50);
  };

  const getScaleClass = () => {
    if (!isActive) return "scale-100";
    if (phase === "Inhale") return "scale-120 duration-4000 ease-in-out";
    if (phase === "Hold") return "scale-120 duration-1000";
    if (phase === "Exhale") return "scale-90 duration-8000 ease-in-out";
    return "scale-90 duration-1000";
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-8 sm:p-10 bg-[#FAF7F2] border border-[#D6C6A5] rounded-3xl shadow-xs max-w-md w-full mx-auto">
      <div className="text-center space-y-1 mb-2">
        <span className="text-[11px] font-sans font-semibold tracking-widest text-[#82947A] uppercase block">
          Interactive Breath Rhythm
        </span>
        <h3 className="font-serif font-bold text-xl text-[#263F35]">
          Experience 1:2 Exhalation
        </h3>
      </div>

      {/* Visualizer Circle Container */}
      <div className="relative w-64 h-64 flex items-center justify-center my-4">
        {/* Outer Halo */}
        <div
          className={`absolute w-56 h-56 rounded-full bg-[#E2E8DF]/60 border border-[#82947A]/30 transition-transform ${getScaleClass()}`}
        />

        {/* Middle Pulse Ring */}
        <div
          className={`absolute w-44 h-44 rounded-full bg-[#D6C6A5]/25 border border-[#D6C6A5] transition-transform ${getScaleClass()}`}
        />

        {/* Center Orb */}
        <div className="relative z-10 w-32 h-32 rounded-full bg-[#263F35] border border-[#355245] shadow-sm flex flex-col items-center justify-center text-[#EDE8DC] text-center p-2">
          <span className="text-[11px] uppercase font-medium tracking-widest text-[#D6C6A5]">
            {isActive ? phase : "Ready"}
          </span>
          <span className="text-4xl font-serif font-bold text-[#FAF7F2] my-0.5">
            {isActive ? seconds : "4"}
          </span>
          <span className="text-[10px] text-[#A5B59E] font-normal tracking-tight px-1">
            {isActive
              ? phase === "Inhale"
                ? "Smooth Inhale"
                : phase === "Exhale"
                ? "Slow Release"
                : phase === "Hold"
                ? "Gentle Pause"
                : "Witness Calm"
              : "Tap to begin"}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 bg-[#263F35] hover:bg-[#1A2D25] text-[#FAF7F2] px-6 py-2.5 rounded-full font-medium text-sm border border-[#263F35] shadow-xs transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4 text-[#D6C6A5]" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-[#D6C6A5] fill-current" />
              <span>Breathe with rhythm</span>
            </>
          )}
        </button>

        {isActive && (
          <button
            onClick={handleReset}
            aria-label="Reset breath count"
            className="p-2.5 rounded-full bg-[#EDE8DC] hover:bg-[#E2E8DF] text-[#263F35] border border-[#D6C6A5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="text-[11px] text-[#82947A] font-medium mt-4 tracking-tight text-center">
        4s Inhale &bull; 2s Hold &bull; 8s Exhale &bull; 2s Pause
      </p>
    </div>
  );
};
