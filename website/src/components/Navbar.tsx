"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { Menu, X, ArrowUpRight, Sparkles } from "lucide-react";

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo / Brand Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#C8F3FF] border border-[#8EE0F7] flex items-center justify-center text-[#FF5C23] font-serif font-bold text-xl shadow-sm group-hover:scale-105 transition-transform">
              ॐ
            </div>
            <div>
              <span className="font-serif font-bold text-lg sm:text-xl tracking-wider text-slate-900 block leading-tight">
                STILL MOUNTAIN
              </span>
              <span className="text-[11px] font-sans font-semibold tracking-widest text-[#FF5C23] uppercase block">
                Pranayama & Retreats
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {siteConfig.mainNav.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-[#FF5C23] bg-[#C8F3FF]/40 font-bold"
                      : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Primary Action */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={siteConfig.pwaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#FF5C23] hover:bg-[#E04B14] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-[#FF5C23]/25 hover:shadow-lg hover:shadow-[#FF5C23]/35 hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Open Practice App</span>
              <ArrowUpRight className="w-4 h-4 opacity-80" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href={siteConfig.pwaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FF5C23] text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm flex items-center gap-1"
            >
              <span>App</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FF5C23]"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-xl px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-1">
            {siteConfig.mainNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                    isActive
                      ? "text-[#FF5C23] bg-[#C8F3FF] font-bold"
                      : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <a
              href={siteConfig.pwaUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-[#FF5C23] text-white px-5 py-3.5 rounded-xl font-bold text-base shadow-md shadow-[#FF5C23]/25"
            >
              <Sparkles className="w-5 h-5" />
              <span>Launch Practice App</span>
              <ArrowUpRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
