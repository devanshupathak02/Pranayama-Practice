import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Retreat } from "@/types";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";

interface Props {
  retreat: Retreat;
}

export const RetreatCard: React.FC<Props> = ({ retreat }) => {
  return (
    <div className="group bg-[#FAF7F2] rounded-3xl overflow-hidden border border-[#D6C6A5] shadow-xs hover:border-[#82947A] transition-all duration-300 flex flex-col h-full">
      {/* Image Header with Badge */}
      <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-[#EDE8DC]">
        <Image
          src={retreat.featuredImage}
          alt={retreat.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover group-hover:scale-102 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span className="bg-[#FAF7F2]/90 backdrop-blur-xs text-[#263F35] border border-[#D6C6A5] px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
            {retreat.category}
          </span>
          <span className="bg-[#1A2D25]/80 backdrop-blur-xs text-[#FAF7F2] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
            <Users className="w-3 h-3 text-[#D6C6A5]" />
            <span>{retreat.spotsRemaining} spots left</span>
          </span>
        </div>

        {/* Bottom Image Overlay text */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <span className="text-xs text-[#D6C6A5] font-medium block">{retreat.duration}</span>
          <h3 className="font-serif font-bold text-xl leading-snug drop-shadow-xs">
            {retreat.title}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex flex-col space-y-1.5 text-xs text-[#355245]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#82947A]" />
              <span className="font-medium text-[#263F35]">{retreat.dates}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#82947A]" />
              <span>{retreat.location}</span>
            </div>
          </div>

          <p className="text-[#355245] text-sm leading-relaxed line-clamp-2">
            {retreat.description}
          </p>
        </div>

        {/* Card Footer with Price & Link */}
        <div className="pt-4 border-t border-[#D6C6A5]/50 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#82947A] block uppercase font-medium">Investment</span>
            <span className="text-base font-bold text-[#263F35]">{retreat.price}</span>
          </div>

          <Link
            href={`/retreats/${retreat.slug}`}
            className="inline-flex items-center gap-1.5 bg-[#EDE8DC] hover:bg-[#E2E8DF] text-[#263F35] px-4 py-2 rounded-xl text-xs font-medium transition-colors"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
