import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getRetreats, getRetreatBySlug } from "@/lib/wordpress/retreats";
import { Calendar, MapPin, Users, Clock, CheckCircle2, ArrowLeft, Sparkles, Send } from "lucide-react";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const retreats = await getRetreats();
  return retreats.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const retreat = await getRetreatBySlug(slug);
  if (!retreat) return { title: "Retreat Not Found" };

  return {
    title: retreat.title,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Back Link */}
      <div>
        <Link
          href="/retreats"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#FF5C23] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Retreats</span>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[#C8F3FF] text-[#092832] border border-[#8EE0F7] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              {retreat.category} Intensive
            </span>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#FF5C23]" />
              <span>{retreat.spotsRemaining} Spots Available</span>
            </span>
          </div>

          <h1 className="font-serif font-extrabold text-3xl sm:text-5xl lg:text-6xl text-slate-950 leading-tight">
            {retreat.title}
          </h1>

          <p className="text-[#FF5C23] font-serif font-semibold text-lg sm:text-xl">
            {retreat.tagline}
          </p>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            {retreat.description}
          </p>

          {/* Key Facts Pill Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <Calendar className="w-5 h-5 text-[#FF5C23] mb-1" />
              <span className="text-[11px] text-slate-400 block font-semibold uppercase">Dates</span>
              <span className="text-sm font-bold text-slate-900">{retreat.dates}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <Clock className="w-5 h-5 text-[#FF5C23] mb-1" />
              <span className="text-[11px] text-slate-400 block font-semibold uppercase">Duration</span>
              <span className="text-sm font-bold text-slate-900">{retreat.duration}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <MapPin className="w-5 h-5 text-[#FF5C23] mb-1" />
              <span className="text-[11px] text-slate-400 block font-semibold uppercase">Sanctuary</span>
              <span className="text-sm font-bold text-slate-900">{retreat.location}</span>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="lg:col-span-5 relative h-80 sm:h-[450px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
          <img
            src={retreat.featuredImage}
            alt={retreat.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Main Content Grid: Highlights & Itinerary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Highlights & Itinerary */}
        <div className="lg:col-span-8 space-y-12">
          {/* Highlights */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-serif font-bold text-2xl text-slate-950">
              Retreat Highlights & Inclusions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {retreat.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#FF5C23] shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 leading-relaxed font-medium">
                    {highlight}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Schedule / Itinerary */}
          <div className="space-y-6">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-950">
              Daily Rhythm & Schedule
            </h2>

            <div className="space-y-6">
              {retreat.itinerary.map((dayItem, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-[#C8F3FF] text-[#092832] border border-[#8EE0F7] px-3 py-1 rounded-full text-xs font-bold uppercase">
                      {dayItem.day}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-slate-900">
                      {dayItem.title}
                    </h3>
                  </div>

                  <ul className="space-y-2.5 border-t border-slate-100 pt-4">
                    {dayItem.schedule.map((slot, sIdx) => (
                      <li key={sIdx} className="text-sm text-slate-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C23]" />
                        <span>{slot}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Reservation Sidebar & Instructor */}
        <div className="lg:col-span-4 space-y-8">
          {/* Reservation Card */}
          <div className="bg-gradient-to-b from-[#C8F3FF] via-white to-white rounded-3xl p-8 border border-[#8EE0F7] shadow-xl space-y-6 sticky top-28">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#092832]">
                All-Inclusive Investment
              </span>
              <div className="text-3xl font-serif font-extrabold text-slate-950">
                {retreat.price}
              </div>
              <span className="text-xs text-slate-500 block">
                Includes private cottage accommodation, organic sattvic meals & all sessions.
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <button className="w-full inline-flex items-center justify-center gap-2 bg-[#FF5C23] hover:bg-[#E04B14] text-white py-4 px-6 rounded-2xl font-bold text-base shadow-lg shadow-[#FF5C23]/30 hover:shadow-xl transition-all">
                <Send className="w-4 h-4" />
                <span>Reserve Your Spot</span>
              </button>

              <p className="text-[11px] text-center text-slate-500">
                Non-binding reservation inquiry. Our sanctuary team will connect within 24 hours.
              </p>
            </div>
          </div>

          {/* Faculty Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900 uppercase tracking-wider text-xs">
              Resident Facilitators
            </h3>
            <div className="flex items-center gap-3">
              <img
                src={retreat.instructor.avatar}
                alt={retreat.instructor.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
              />
              <div>
                <h4 className="font-serif font-bold text-sm text-slate-900">
                  {retreat.instructor.name}
                </h4>
                <span className="text-xs text-[#FF5C23] font-semibold block">
                  {retreat.instructor.role}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {retreat.instructor.bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
