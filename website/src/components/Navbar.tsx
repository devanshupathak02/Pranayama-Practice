"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { useAppUrl } from "@/lib/hooks/useAppUrl";
import { useDisplayMode } from "@/lib/hooks/useDisplayMode";
import { Menu, X, ArrowUpRight } from "lucide-react";

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const appUrl = useAppUrl();
  const { isTimerApp } = useDisplayMode();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Suppress marketing navbar inside dedicated timer application & /practice
  if (isTimerApp || pathname?.startsWith("/practice")) {
    return null;
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#FAF7F2]/95 backdrop-blur-md shadow-sm border-b border-[#D6C6A5]/60 py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FAF7F2] border border-[#D6C6A5] flex items-center justify-center p-1.5 shadow-xs group-hover:border-[#82947A] transition-colors">
              <Image
                src="/images/still-mountain-logo.png"
                alt="Still Mountain mark"
                width={28}
                height={28}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-serif font-bold text-lg sm:text-xl tracking-wider text-[#263F35] block leading-tight">
                STILL MOUNTAIN
              </span>
              <span className="text-[10px] sm:text-[11px] font-sans font-medium tracking-[0.2em] text-[#82947A] uppercase block">
                Pranayama & Breathwork
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
            {siteConfig.mainNav
              .filter((item) => item.title !== "Pranayama Timer")
              .map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "text-[#263F35] bg-[#D6C6A5]/25 font-semibold"
                        : "text-[#355245] hover:text-[#263F35] hover:bg-[#D6C6A5]/15"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}
          </nav>

          {/* Desktop Primary CTA: Pranayama Timer Subdomain */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={appUrl}
              className="inline-flex items-center gap-2 bg-[#263F35] hover:bg-[#1A2D25] text-[#FAF7F2] px-5 py-2.5 rounded-xl font-medium text-sm border border-[#263F35] shadow-xs hover:shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#263F35]"
            >
              <span>Open Timer App</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#82947A]" />
            </a>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href={appUrl}
              className="inline-flex items-center gap-1.5 bg-[#263F35] text-[#FAF7F2] px-3.5 py-1.5 rounded-lg text-xs font-medium"
            >
              <span>Timer</span>
            </a>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-[#263F35] hover:text-[#1A2D25] rounded-lg hover:bg-[#D6C6A5]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-[#D6C6A5]/80 bg-[#FAF7F2] px-4 pt-3 pb-6 space-y-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {siteConfig.mainNav.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? "text-[#263F35] bg-[#D6C6A5]/30 font-semibold"
                      : "text-[#355245] hover:text-[#263F35] hover:bg-[#D6C6A5]/15"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-[#D6C6A5]/40 flex flex-col gap-2">
            <a
              href={appUrl}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#263F35] hover:bg-[#1A2D25] text-[#FAF7F2] px-4 py-3 rounded-xl font-medium text-sm transition-colors text-center"
            >
              <span>Open Timer App</span>
            </a>
            <a
              href="https://smwr.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-xs text-[#82947A] hover:text-[#263F35] py-1 text-center"
            >
              <span>Visit smwr.org</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
