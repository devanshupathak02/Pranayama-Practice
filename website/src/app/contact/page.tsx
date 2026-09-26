import React from "react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { MapPin, Mail, Clock, Send, Sparkles, ExternalLink, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Still Mountain Sanctuary",
  description:
    "Get in touch for retreat inquiries, custom intensive arrangements, and practice questions.",
};

const FAQS = [
  {
    q: "Is the Pranayama Timer app completely free?",
    a: "Yes. The PWA is 100% free and open to all practitioners. There are no paywalls, subscriptions, or advertisements."
  },
  {
    q: "How do I install the PWA on my phone?",
    a: "Open the app in Safari (iOS) or Chrome (Android), tap Share or Menu, and choose 'Add to Home Screen'. It runs in full-screen standalone mode."
  },
  {
    q: "Are the Himalayan retreats suitable for beginners?",
    a: "Yes. Our resident faculty provides gradual preparation sets and personal alignment checks so practitioners of all levels can enter noble silence safely."
  },
  {
    q: "Where is the parent organization website?",
    a: "You can visit smwr.org for general ashram information, holistic Ayurvedic packages, and facilities overview."
  }
];

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-20">
      {/* Header */}
      <div className="max-w-3xl space-y-5">
        <span className="bg-[#C8F3FF] text-[#092832] border border-[#8EE0F7] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          Connect With Sanctuary
        </span>
        <h1 className="font-serif font-extrabold text-4xl sm:text-6xl text-slate-950 leading-tight">
          We Are Here to Support Your Practice.
        </h1>
        <p className="text-slate-600 text-lg sm:text-xl leading-relaxed">
          Reach out with questions about upcoming silence retreats, breathwork sequences, or ashram residency arrangements.
        </p>
      </div>

      {/* Main Grid: Contact Info + Inquiry Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Info Column */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-serif font-bold text-xl text-slate-950">
              Sanctuary Office
            </h2>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#FF5C23] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Location</span>
                  <span className="text-slate-600">
                    Still Mountain Retreat Valley, Himalayan Foothills
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#FF5C23] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">General & Practice Inquiries</span>
                  <span className="text-slate-600">{siteConfig.contact.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#FF5C23] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Sanctuary Hours</span>
                  <span className="text-slate-600">{siteConfig.contact.hours}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <a
                href={siteConfig.orgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#FF5C23] font-bold hover:underline"
              >
                <span>Visit main foundation portal at smwr.org</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7">
          <div className="bg-gradient-to-br from-[#C8F3FF]/30 via-white to-white p-8 sm:p-10 rounded-3xl border border-[#8EE0F7] shadow-xl space-y-6">
            <h2 className="font-serif font-bold text-2xl text-slate-950">
              Send a Message
            </h2>
            <p className="text-xs text-slate-600">
              Fill out this form to inquire about retreats, group workshops, or practice guidance.
            </p>

            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Sharma"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5C23] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="maya@example.com"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5C23] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. October Silence & Prana Retreat Inquiry"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5C23] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Your Message *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details regarding your inquiry or practice background..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5C23] focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-[#FF5C23] hover:bg-[#E04B14] text-white px-8 py-4 rounded-xl font-bold text-sm shadow-md shadow-[#FF5C23]/25 hover:shadow-lg transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-8 pt-8">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#FF5C23]" />
          <h2 className="font-serif font-bold text-2xl text-slate-950">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-serif font-bold text-base text-slate-900">
                {faq.q}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
