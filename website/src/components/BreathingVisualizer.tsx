"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, RefreshCw } from "lucide-react";

type BreathPhase = "Inhale" | "Hold" | "Exhale" | "Pause";

export const BreathingVisualizer: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("Inhale");
  const [seconds, setSeconds] = useState(4);
  const [pattern] = useState<"box" | "relax">("relax"); // 4-2-8-2 or 4-4-4-4

  useEffect(() => {
    if (!isActive) {
      setPhase("Inhale");
      setSeconds(4);
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Phase transitions
        if (pattern === "relax") {
          // 4s Inhale -> 2s Hold -> 8s Exhale -> 2s Pause
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
        } else {
          // 4-4-4-4 Box
          if (phase === "Inhale") {
            setPhase("Hold");
            return 4;
          } else if (phase === "Hold") {
            setPhase("Exhale");
            return 4;
          } else if (phase === "Exhale") {
            setPhase("Pause");
            return 4;
          } else {
            setPhase("Inhale");
            return 4;
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase, pattern]);

  const getScaleClass = () => {
    if (!isActive) return "scale-100";
    if (phase === "Inhale") return "scale-130 duration-4000 ease-in-out";
    if (phase === "Hold") return "scale-130 duration-1000";
    if (phase === "Exhale") return "scale-90 duration-8000 ease-in-out";
    return "scale-90 duration-1000";
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-8 sm:p-10 bg-gradient-to-b from-[#C8F3FF]/70 to-white/90 border border-[#8EE0F7] rounded-3xl shadow-xl shadow-cyan-950/5 max-w-md w-full mx-auto">
      {/* Visualizer Circle Container */}
      <div className="relative w-60 h-60 flex items-center justify-center my-6">
        {/* Outer Halo */}
        <div
          className={`absolute w-56 h-56 rounded-full bg-[#C8F3FF] border border-[#8EE0F7] opacity-60 transition-transform ${getScaleClass()}`}
        />

        {/* Middle Pulse Ring */}
        <div
          className={`absolute w-44 h-44 rounded-full bg-[#FF5C23]/10 border-2 border-[#FF5C23]/30 transition-transform ${getScaleClass()}`}
        />

        {/* Center Orb */}
        <div className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-[#FF5C23] to-[#E04B14] shadow-lg shadow-[#FF5C23]/30 flex flex-col items-center justify-center text-white text-center p-2">
          <span className="text-xs uppercase font-bold tracking-widest text-[#C8F3FF]">
            {isActive ? phase : "Ready"}
          </span>
          <span className="text-4xl font-serif font-extrabold my-0.5">
            {isActive ? seconds : "4"}
          </span>
          <span className="text-[10px] text-white/80 font-medium tracking-tight">
            {isActive ? (phase === "Inhale" ? "Expand Belly" : phase === "Exhale" ? "Release Slowly" : "Remain Still") : "Tap to Begin"}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={() => setIsActive(!isActive)}
          className="flex items-center gap-2 bg-[#092832] hover:bg-slate-900 text-[#C8F3FF] px-6 py-2.5 rounded-full font-bold text-sm shadow-md transition-all active:scale-95"
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4 text-[#FF5C23]" />
              <span>Pause Rhythm</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-[#FF5C23] fill-current" />
              <span>Try 1:2 Breath</span>
            </>
          )}
        </button>

        {isActive && (
          <button
            onClick={() => {
              setIsActive(false);
              setTimeout(() => setIsActive(true), 50);
            }}
            aria-label="Reset breath count"
            className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="text-[11px] text-slate-500 font-medium mt-4 tracking-tight">
        4s Inhale → 2s Hold → 8s Exhale • Vagus Nerve Stimulation
      </p>
    </div>
  );
};
