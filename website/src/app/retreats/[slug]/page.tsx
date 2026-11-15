import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Retreat } from "@/types";
import { getRetreats, getRetreatBySlug } from "@/lib/wordpress/retreats";
import { Calendar, MapPin, Users, CheckCircle2, ArrowLeft, ArrowUpRight } from "lucide-react";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const retreats = await getRetreats();
  return retreats.map((r: Retreat) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const retreat = await getRetreatBySlug(slug);
  if (!retreat) return { title: "Retreat Not Found | Still Mountain" };

  return {
    title: `${retreat.title} — Still Mountain Wellness Retreat`,
    description: retreat.tagline,
    openGraph: {
      title: retreat.title,
      description: retreat.tagline,
      images: [retreat.featuredImage],
    },
  };
}

export default async function RetreatDetailPage({ params }: Props) {
  const { slug } = await params;
  const retreat = await getRetreatBySlug(slug);

  if (!retreat) {
    notFound();
  }

  return (
    <div className="pt-28 sm:pt-36 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Back Link */}
      <div>
        <Link
          href="/retreats"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#82947A] hover:text-[#263F35] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Retreats</span>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[#FAF7F2] text-[#263F35] border border-[#D6C6A5] px-3.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
              {retreat.category}
            </span>
            <span className="text-xs text-[#82947A] flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5" />
              <span>{retreat.spotsRemaining} spots available</span>
            </span>
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-5xl lg:text-6xl text-[#263F35] leading-tight">
            {retreat.title}
          </h1>

          <p className="text-[#355245] text-lg sm:text-xl leading-relaxed italic font-serif">
            {retreat.tagline}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2 text-sm text-[#355245]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#82947A]" />
              <span className="font-medium text-[#263F35]">{retreat.dates}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#82947A]" />
              <span>{retreat.location}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative h-80 sm:h-96 rounded-3xl overflow-hidden bg-[#EDE8DC] border border-[#D6C6A5]">
          <Image
            src={retreat.featuredImage}
            alt={retreat.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Main Content Grid: Highlights & Itinerary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          {/* Highlights */}
          <div className="bg-[#FAF7F2] p-8 sm:p-10 rounded-3xl border border-[#D6C6A5] space-y-6">
            <h2 className="font-serif font-bold text-2xl text-[#263F35]">
              Retreat Highlights & Inclusions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {retreat.highlights.map((highlight: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#82947A] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#355245] leading-relaxed font-medium">
                    {highlight}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Schedule / Itinerary */}
          <div className="space-y-6">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#263F35]">
              Daily Rhythm & Schedule
            </h2>

            <div className="space-y-6">
              {retreat.itinerary.map((dayItem: { day: string; title: string; schedule: string[] }, index: number) => (
                <div
                  key={index}
                  className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#D6C6A5] space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-[#EDE8DC] text-[#263F35] border border-[#D6C6A5] px-3 py-1 rounded-full text-xs font-medium uppercase">
                      {dayItem.day}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-[#263F35]">
                      {dayItem.title}
                    </h3>
                  </div>

                  <ul className="space-y-2.5 border-t border-[#D6C6A5]/40 pt-4">
                    {dayItem.schedule.map((slot: string, sIdx: number) => (
                      <li key={sIdx} className="text-sm text-[#355245] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#82947A]" />
                        <span>{slot}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Teacher & External Registration at smwr.org */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#FAF7F2] rounded-3xl p-7 border border-[#D6C6A5] space-y-5">
            <div className="space-y-1">
              <span className="text-[11px] text-[#82947A] uppercase tracking-wider font-semibold">
                Investment & Booking
              </span>
              <div className="text-3xl font-serif font-bold text-[#263F35]">
                {retreat.price}
              </div>
              <span className="text-xs text-[#82947A] block">
                Includes accommodation, organic sattvic meals & daily guidance
              </span>
            </div>

            <a
              href="https://smwr.org"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#263F35] hover:bg-[#1A2D25] text-[#FAF7F2] px-6 py-3.5 rounded-xl font-medium text-sm transition-colors text-center"
            >
              <span>Book on smwr.org</span>
              <ArrowUpRight className="w-4 h-4 text-[#D6C6A5]" />
            </a>

            <p className="text-[11px] text-[#82947A] text-center">
              Registrations are administered through the main retreat office at smwr.org.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
