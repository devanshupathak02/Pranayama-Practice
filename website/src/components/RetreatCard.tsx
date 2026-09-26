import React from "react";
import Link from "next/link";
import { Retreat } from "@/types";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";

interface Props {
  retreat: Retreat;
}

export const RetreatCard: React.FC<Props> = ({ retreat }) => {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#8EE0F7] transition-all duration-300 flex flex-col h-full">
      {/* Image Header with Badge */}
      <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-100">
        <img
          src={retreat.featuredImage}
          alt={retreat.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span className="bg-[#C8F3FF] text-[#092832] border border-[#8EE0F7] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
            {retreat.category}
          </span>
          <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
            <Users className="w-3 h-3 text-[#FF5C23]" />
            <span>{retreat.spotsRemaining} spots left</span>
          </span>
        </div>

        {/* Bottom Image Overlay text */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <span className="text-xs text-[#C8F3FF] font-semibold block">{retreat.duration}</span>
          <h3 className="font-serif font-bold text-xl leading-snug drop-shadow-sm">
            {retreat.title}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex flex-col space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FF5C23]" />
              <span className="font-semibold text-slate-900">{retreat.dates}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FF5C23]" />
              <span>{retreat.location}</span>
            </div>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
            {retreat.description}
          </p>
        </div>

        {/* Card Footer with Price & Link */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block uppercase font-medium">Investment</span>
            <span className="text-base font-bold text-slate-900">{retreat.price}</span>
          </div>

          <Link
            href={`/retreats/${retreat.slug}`}
            className="inline-flex items-center gap-1.5 bg-[#C8F3FF] hover:bg-[#B5EBF9] text-[#092832] px-4 py-2 rounded-xl text-xs font-bold transition-colors group-hover:bg-[#FF5C23] group-hover:text-white"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
