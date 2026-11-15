import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PranayamaPractice } from "@/types";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface Props {
  practice: PranayamaPractice;
}

export const PracticeCard: React.FC<Props> = ({ practice }) => {
  return (
    <div className="group bg-[#FAF7F2] rounded-3xl p-7 sm:p-8 border border-[#D6C6A5] shadow-xs hover:border-[#82947A] hover:shadow-sm transition-all duration-300 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Top Header: Technique Mark + Difficulty Badge */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-[#EDE8DC] border border-[#D6C6A5] flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
            <Image
              src={practice.image}
              alt={practice.name}
              width={36}
              height={36}
              className="object-contain"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {practice.beginnerFriendly && (
              <span className="inline-flex items-center gap-1 bg-[#E2E8DF] text-[#263F35] border border-[#82947A]/30 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                <CheckCircle2 className="w-3 h-3 text-[#82947A]" />
                <span>Beginner Friendly</span>
              </span>
            )}
            <span className="text-xs text-[#82947A] font-medium">
              {practice.durationMinutes} min
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="font-serif font-bold text-2xl text-[#263F35]">
              {practice.name}
            </h3>
            <span className="text-xs font-serif italic text-[#82947A]">
              {practice.sanskritName}
            </span>
          </div>
          <span className="text-xs text-[#82947A] font-medium uppercase tracking-wider block">
            {practice.englishName}
          </span>
        </div>

        <p className="text-[#355245] text-sm leading-relaxed">
          {practice.shortDescription}
        </p>

        <div className="pt-1">
          <span className="text-[11px] font-medium text-[#263F35] bg-[#EDE8DC] px-2.5 py-1 rounded-md inline-block">
            Focus: {practice.focus}
          </span>
        </div>
      </div>

      <div className="pt-5 mt-5 border-t border-[#D6C6A5]/40 flex items-center justify-between">
        <Link
          href={`/learn#${practice.id}`}
          className="text-xs font-medium text-[#82947A] hover:text-[#263F35] transition-colors"
        >
          View instructions
        </Link>

        <Link
          href="/practice"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#263F35] group-hover:text-[#82947A] transition-colors"
        >
          <span>Practice now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
