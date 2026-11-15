import React from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { ArrowUpRight } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1A2D25] text-[#EDE8DC] pt-16 pb-12 border-t border-[#263F35]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-14">
          {/* Column 1: Brand & Positioning (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-3 group inline-block">
              <div className="w-9 h-9 rounded-full bg-[#263F35] border border-[#82947A]/40 flex items-center justify-center p-1.5">
                <Image
                  src="/images/still-mountain-logo.png"
                  alt="Still Mountain logo"
                  width={26}
                  height={26}
                  className="object-contain"
                />
              </div>
              <span className="font-serif font-bold text-xl tracking-wider text-[#FAF7F2]">
                STILL MOUNTAIN PRANAYAMA
              </span>
            </Link>

            <p className="text-[#A5B59E] text-sm leading-relaxed max-w-md">
              A dedicated digital wellness and learning platform operated under the Still Mountain Wellness Retreat (SMWR) brand. Bringing ancient conscious breathing practices and quietude into contemporary daily life.
            </p>

            <div className="pt-2">
              <a
                href={siteConfig.orgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#D6C6A5] hover:text-[#FAF7F2] transition-colors"
              >
                <span>Part of Still Mountain Wellness Retreat (smwr.org)</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Column 2: Platform Navigation (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-serif font-bold text-[#FAF7F2] text-sm uppercase tracking-wider">
              Platform
            </h3>
            <ul className="space-y-2 text-sm text-[#A5B59E]">
              <li>
                <Link href="/" className="hover:text-[#FAF7F2] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/learn" className="hover:text-[#FAF7F2] transition-colors">
                  Learn Pranayama
                </Link>
              </li>
              <li>
                <Link href="/journal" className="hover:text-[#FAF7F2] transition-colors">
                  Journal & Essays
                </Link>
              </li>
              <li>
                <Link href="/practice" className="hover:text-[#FAF7F2] text-[#D6C6A5] font-medium transition-colors">
                  Pranayama Timer
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Sanctuary & Lineage (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-serif font-bold text-[#FAF7F2] text-sm uppercase tracking-wider">
              Sanctuary
            </h3>
            <ul className="space-y-2 text-sm text-[#A5B59E]">
              <li>
                <Link href="/about" className="hover:text-[#FAF7F2] transition-colors">
                  About SMWR
                </Link>
              </li>
              <li>
                <a
                  href="https://smwr.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FAF7F2] inline-flex items-center gap-1 transition-colors"
                >
                  <span>Retreats & Ashram</span>
                  <ArrowUpRight className="w-3 h-3 opacity-70" />
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#FAF7F2] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Institutional / Legal (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-serif font-bold text-[#FAF7F2] text-sm uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-2 text-sm text-[#A5B59E]">
              <li>
                <Link href="/privacy" className="hover:text-[#FAF7F2] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#FAF7F2] transition-colors">
                  Terms of Practice
                </Link>
              </li>
              <li>
                <a
                  href={siteConfig.orgUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#82947A] hover:text-[#D6C6A5] transition-colors block pt-2"
                >
                  Main Website: smwr.org
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#263F35] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#82947A]">
          <p>
            &copy; {new Date().getFullYear()} Still Mountain Wellness Retreat (SMWR). All rights reserved.
          </p>
          <p className="text-center sm:text-right text-[#82947A]/80">
            Educational publication & guided practice instrument. Not medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
};
