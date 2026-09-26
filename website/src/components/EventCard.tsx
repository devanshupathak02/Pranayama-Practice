import React from "react";
import { Event } from "@/types";
import { Calendar, Clock, MapPin, Globe, ArrowUpRight } from "lucide-react";

interface Props {
  event: Event;
}

export const EventCard: React.FC<Props> = ({ event }) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-[#8EE0F7] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-3 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-[#C8F3FF] text-[#092832] border border-[#8EE0F7] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {event.category}
          </span>
          {event.isOnline ? (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>Online Stream</span>
            </span>
          ) : (
            <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#FF5C23]" />
              <span>In-Person Sanctuary</span>
            </span>
          )}
        </div>

        <h3 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 leading-snug">
          {event.title}
        </h3>

        <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
          {event.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 pt-1">
          <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
            <Calendar className="w-4 h-4 text-[#FF5C23]" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>

      {/* RSVP Action */}
      <div className="md:border-l md:border-slate-100 md:pl-8 flex flex-col items-start md:items-end justify-center min-w-[160px]">
        {event.capacity && (
          <span className="text-xs text-slate-500 font-medium mb-2">
            Limit: {event.capacity}
          </span>
        )}
        <a
          href={event.rsvpUrl || "#"}
          className="inline-flex items-center gap-2 bg-[#FF5C23] hover:bg-[#E04B14] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <span>Reserve Spot</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
