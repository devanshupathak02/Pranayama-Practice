import React from "react";
import type { Metadata } from "next";
import { getEvents } from "@/lib/wordpress/events";
import { EventCard } from "@/components/EventCard";
import { AppCtaSection } from "@/components/AppCtaSection";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Workshops, Masterclasses & Global Broadcasts",
  description:
    "Join Still Mountain for live full-moon chanting circles, bandha masterclasses, and solstice meditations.",
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="space-y-20 py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Section */}
        <div className="max-w-3xl space-y-5">
          <span className="bg-[#C8F3FF] text-[#092832] border border-[#8EE0F7] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            Live Gatherings & Broadcasts
          </span>
          <h1 className="font-serif font-extrabold text-4xl sm:text-6xl text-slate-950 leading-tight">
            Workshops, Satsangs & Global Circles.
          </h1>
          <p className="text-slate-600 text-lg sm:text-xl leading-relaxed">
            Connect with our teaching faculty online and at the ashram for interactive technique breakdowns, seasonal immersions, and synchronized global practice.
          </p>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>

      {/* App CTA */}
      <AppCtaSection />
    </div>
  );
}

