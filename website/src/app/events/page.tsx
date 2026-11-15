import React from "react";
import type { Metadata } from "next";
import { getEvents } from "@/lib/wordpress/events";
import { EventCard } from "@/components/EventCard";
import { Event } from "@/types";
import { Calendar, ArrowUpRight } from "lucide-react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Events & Broadcasts — Still Mountain Wellness Retreat",
  description:
    "Join Still Mountain for live chanting circles, bandha masterclasses, and solstice meditations.",
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="pt-28 sm:pt-36 pb-20 space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#FAF7F2] text-[#263F35] border border-[#D6C6A5] px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase">
            <Calendar className="w-3.5 h-3.5 text-[#82947A]" />
            <span>Still Mountain Gatherings & Broadcasts</span>
          </div>

          <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-[#263F35] leading-tight">
            Workshops, Satsangs & Global Circles.
          </h1>

          <p className="text-[#355245] text-lg sm:text-xl leading-relaxed font-normal">
            Online broadcasts and sanctuary masterclasses hosted by Still Mountain Wellness Retreat teachers.
          </p>

          <div className="pt-2">
            <a
              href="https://smwr.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#263F35] hover:bg-[#1A2D25] text-[#FAF7F2] px-6 py-3 rounded-xl font-medium text-sm transition-colors"
            >
              <span>View Full Calendar at smwr.org</span>
              <ArrowUpRight className="w-4 h-4 text-[#D6C6A5]" />
            </a>
          </div>
        </div>

        <div className="space-y-6">
          {events.map((event: Event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}
