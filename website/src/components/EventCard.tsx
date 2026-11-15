import React from "react";
import { Event } from "@/types";
import { Calendar, Clock, MapPin, Globe, ArrowUpRight } from "lucide-react";

interface Props {
  event: Event;
}

export const EventCard: React.FC<Props> = ({ event }) => {
  return (
    <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#D6C6A5] shadow-xs hover:border-[#82947A] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-3 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-[#EDE8DC] text-[#263F35] border border-[#D6C6A5] px-3 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider">
            {event.category}
          </span>
          {event.isOnline ? (
            <span className="bg-[#E2E8DF] text-[#263F35] border border-[#82947A]/30 px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
              <Globe className="w-3 h-3 text-[#82947A]" />
              <span>Online Broadcast</span>
            </span>
          ) : (
            <span className="bg-[#EDE8DC] text-[#263F35] px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#82947A]" />
              <span>In-Person Sanctuary</span>
            </span>
          )}
        </div>

        <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#263F35] leading-snug">
          {event.title}
        </h3>

        <p className="text-[#355245] text-sm leading-relaxed max-w-2xl">
          {event.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#355245] pt-1">
          <div className="flex items-center gap-1.5 text-[#263F35] font-semibold">
            <Calendar className="w-4 h-4 text-[#82947A]" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#82947A]" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#82947A]" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>

      <div className="md:border-l md:border-[#D6C6A5]/50 md:pl-8 flex flex-col items-start md:items-end justify-center min-w-[160px]">
        {event.capacity && (
          <span className="text-xs text-[#82947A] font-medium mb-2">
            {event.capacity}
          </span>
        )}
        <a
          href="https://smwr.org"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#263F35] hover:bg-[#1A2D25] text-[#FAF7F2] px-5 py-2.5 rounded-xl font-medium text-xs shadow-xs transition-colors"
        >
          <span>Register on smwr.org</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#D6C6A5]" />
        </a>
      </div>
    </div>
  );
};
