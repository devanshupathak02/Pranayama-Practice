import React from "react";
import { siteConfig } from "@/config/site";
import { Sparkles, ArrowUpRight, Smartphone, WifiOff, Volume2, ShieldCheck, CheckCircle2 } from "lucide-react";

export const AppCtaSection: React.FC = () => {
  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#C8F3FF]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#FF5C23]/15 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-slate-700/80 rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#C8F3FF]/10 text-[#C8F3FF] border border-[#8EE0F7]/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#FF5C23]" />
                <span>Instant Progressive Web App</span>
              </div>

              <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
                Take Your Practice With You, Wherever You Sit.
              </h2>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
                Experience distraction-free breath timing designed specifically for closed-eye practice. No app store fees, no user accounts, and zero battery-draining telemetry.
              </p>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 text-sm text-slate-200">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FF5C23] shrink-0" />
                  <span>35m, 46m & 60m Master Sets</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FF5C23] shrink-0" />
                  <span>100% Works Offline</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FF5C23] shrink-0" />
                  <span>Locked-Screen Timing Accuracy</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FF5C23] shrink-0" />
                  <span>Custom Sequence Builder</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={siteConfig.pwaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 bg-[#FF5C23] hover:bg-[#E04B14] text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-[#FF5C23]/30 hover:shadow-2xl hover:shadow-[#FF5C23]/40 hover:-translate-y-0.5 transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Launch Practice App</span>
                  <ArrowUpRight className="w-5 h-5 opacity-90" />
                </a>

                <span className="text-xs text-slate-400 block sm:inline">
                  Installable on iPhone, Android, & Desktop via browser menu
                </span>
              </div>
            </div>

            {/* Right Interactive App Card Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm bg-gradient-to-b from-[#C8F3FF] to-white rounded-3xl p-6 border-4 border-white/10 shadow-2xl text-slate-900 space-y-5 transform hover:-rotate-1 transition-transform duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FF5C23]" />
                    <span className="font-serif font-bold text-sm tracking-wider">PRANAYAMA TIMER</span>
                  </div>
                  <span className="text-[10px] font-bold bg-[#FF5C23] text-white px-2 py-0.5 rounded-full uppercase">
                    Active
                  </span>
                </div>

                {/* Session Visualizer Mini */}
                <div className="bg-white rounded-2xl p-4 border border-[#8EE0F7] shadow-sm text-center space-y-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Bhastrika Pranayam • 3 min
                  </span>
                  <div className="text-4xl font-serif font-bold text-[#FF5C23] tracking-wider">
                    02:45
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#FF5C23] h-full w-2/3 rounded-full" />
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    Next: Normal Breath / Witness (1 min)
                  </span>
                </div>

                {/* Quick Badges */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white/80 rounded-xl p-2 border border-slate-100">
                    <WifiOff className="w-4 h-4 text-[#FF5C23] mx-auto mb-1" />
                    <span className="font-semibold text-[10px] block">Offline</span>
                  </div>
                  <div className="bg-white/80 rounded-xl p-2 border border-slate-100">
                    <Volume2 className="w-4 h-4 text-[#FF5C23] mx-auto mb-1" />
                    <span className="font-semibold text-[10px] block">Audio Bells</span>
                  </div>
                  <div className="bg-white/80 rounded-xl p-2 border border-slate-100">
                    <Smartphone className="w-4 h-4 text-[#FF5C23] mx-auto mb-1" />
                    <span className="font-semibold text-[10px] block">PWA Standalone</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
