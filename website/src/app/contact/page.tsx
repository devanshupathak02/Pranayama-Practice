import React from "react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { MapPin, Mail, Clock, ArrowUpRight, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact & Inquiries — Still Mountain Pranayama",
  description:
    "Get in touch for questions regarding our digital pranayama platform, breathing sequences, or connection with Still Mountain Wellness Retreat.",
};

const FAQS = [
  {
    q: "Is the Pranayama Timer completely free?",
    a: "Yes. The timer and educational resources are 100% free and open to all practitioners. There are no paywalls, hidden subscriptions, or advertisements."
  },
  {
    q: "How do I install the timer app on my phone?",
    a: "Open the practice page or PWA link in Safari (iOS) or Chrome (Android), tap Share or Menu, and choose 'Add to Home Screen'. It runs in full-screen standalone mode with offline support."
  },
  {
    q: "How does this platform connect with Still Mountain Wellness Retreat?",
    a: "This platform is the dedicated digital pranayama learning and timer application of Still Mountain Wellness Retreat (SMWR). In-person retreats and residential programs are hosted at smwr.org."
  },
  {
    q: "Can beginners practice the 35-minute sequence?",
    a: "Yes. The 35-minute set begins with grounding meditation, uses moderate timings, and includes a full 1-minute witness breath pause after every technique. Always practice without strain."
  }
];

export default function ContactPage() {
  return (
    <div className="pt-28 sm:pt-36 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 bg-[#FAF7F2] text-[#263F35] border border-[#D6C6A5] px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase">
          <Mail className="w-3.5 h-3.5 text-[#82947A]" />
          <span>Sanctuary Office</span>
        </div>
        <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-[#263F35] leading-tight">
          We Are Here to Support Your Practice.
        </h1>
        <p className="text-[#355245] text-lg sm:text-xl leading-relaxed font-normal">
          Reach out with questions about conscious breathing, practice guidelines, or inquiries for the retreat center.
        </p>
      </div>

      {/* Main Grid: Contact Info + FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Info Column */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-[#FAF7F2] p-8 rounded-3xl border border-[#D6C6A5] space-y-6">
            <h2 className="font-serif font-bold text-xl text-[#263F35]">
              Contact Details
            </h2>

            <div className="space-y-4 text-sm text-[#355245]">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#82947A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#263F35] block">Location</span>
                  <span>{siteConfig.contact.location}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#82947A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#263F35] block">Email</span>
                  <a href={`mailto:${siteConfig.contact.email}`} className="text-[#263F35] underline">
                    {siteConfig.contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#82947A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#263F35] block">Practice Hours</span>
                  <span>{siteConfig.contact.hours}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#D6C6A5]/50">
              <a
                href={siteConfig.orgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#263F35] hover:text-[#82947A] transition-colors"
              >
                <span>Visit Main Organization Website: smwr.org</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Frequently Answered Questions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#82947A]" />
            <h2 className="font-serif font-bold text-2xl text-[#263F35]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#D6C6A5] space-y-2"
              >
                <h3 className="font-serif font-bold text-lg text-[#263F35]">
                  {faq.q}
                </h3>
                <p className="text-sm text-[#355245] leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
