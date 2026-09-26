import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ArrowUpRight, Heart, Sparkles, MapPin, Mail, ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-200 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Column 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C8F3FF] border border-[#8EE0F7] flex items-center justify-center text-[#FF5C23] font-serif font-bold text-lg">
                ॐ
              </div>
              <span className="font-serif font-bold text-xl tracking-wider text-white">
                STILL MOUNTAIN
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              An authentic sanctuary for classical pranayama breathwork, restorative yoga nidra, and noble silence retreats situated in the serene Himalayan foothills.
            </p>
            <div className="pt-2 flex flex-col space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF5C23]" />
                <span>Still Mountain Sanctuary & Valley Ashram</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FF5C23]" />
                <span>practice@smwr.org</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="text-slate-400 hover:text-white transition-colors">
                  About the Lineage
                </Link>
              </li>
              <li>
                <Link href="/retreats" className="text-slate-400 hover:text-white transition-colors">
                  Upcoming Retreats
                </Link>
              </li>
              <li>
                <Link href="/journal" className="text-slate-400 hover:text-white transition-colors">
                  Breathwork Journal
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-slate-400 hover:text-white transition-colors">
                  Workshops & Events
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-white transition-colors">
                  Contact Sanctuary
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: The Practice PWA */}
          <div>
            <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider mb-4">
              Practice App
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={siteConfig.pwaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF5C23] font-semibold hover:underline flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch PWA</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
              <li className="text-slate-400 text-xs">
                Guided 35m / 46m / 60m Sets
              </li>
              <li className="text-slate-400 text-xs">
                4-Track Yoga Nidra Library
              </li>
              <li className="text-slate-400 text-xs">
                100% Offline & Private
              </li>
            </ul>
          </div>

          {/* Column 4: Parent Organization */}
          <div>
            <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider mb-4">
              Organization
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Visit our main retreat foundation for facility tours, holistic Ayurvedic programs, and resident teacher biographies.
            </p>
            <a
              href={siteConfig.orgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#C8F3FF] hover:underline font-semibold"
            >
              <span>Visit smwr.org</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Still Mountain Wellness Retreat. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted for daily stillness & mindful breath</span>
            <Heart className="w-3.5 h-3.5 text-[#FF5C23] inline fill-current ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};
