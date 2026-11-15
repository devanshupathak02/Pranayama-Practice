import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Still Mountain Pranayama",
  description: "Privacy policy for Still Mountain Pranayama platform and breathing timer application.",
};

export default function PrivacyPage() {
  return (
    <div className="pt-28 sm:pt-36 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#82947A] hover:text-[#263F35] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 bg-[#FAF7F2] text-[#263F35] border border-[#D6C6A5] px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-[#82947A]" />
          <span>Privacy & Transparency</span>
        </div>
        <h1 className="font-serif font-bold text-4xl sm:text-5xl text-[#263F35]">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#82947A]">Last updated: October 2026</p>
      </div>

      <div className="bg-[#FAF7F2] border border-[#D6C6A5] rounded-3xl p-8 sm:p-10 space-y-6 text-[#355245] text-sm leading-relaxed">
        <h2 className="font-serif font-bold text-xl text-[#263F35]">
          1. Core Privacy Philosophy
        </h2>
        <p>
          Still Mountain Pranayama is designed to be a contemplative digital sanctuary. You can read our educational journal and use the online Pranayama Timer without creating an account or providing any personal identifying information.
        </p>

        <h2 className="font-serif font-bold text-xl text-[#263F35]">
          2. Local Browser Storage & Practice History
        </h2>
        <p>
          Your practice preferences (such as audio chime volume, active routine selections, and custom interval configurations) and practice history are stored strictly on your local device using standard browser storage mechanisms (localStorage and IndexedDB). This data remains on your physical device and is not transmitted to or stored on our servers.
        </p>

        <h2 className="font-serif font-bold text-xl text-[#263F35]">
          3. Hosting Infrastructure & Server Logs
        </h2>
        <p>
          This website is hosted on modern cloud edge infrastructure (Vercel). Like standard web servers, Vercel edge routers automatically log basic technical request metadata—such as IP address, browser user-agent, requested URL, and timestamp—solely for technical routing, edge caching, DDoS mitigation, and system health monitoring. These standard access logs are handled according to industry-standard retention policies.
        </p>

        <h2 className="font-serif font-bold text-xl text-[#263F35]">
          4. Third-Party Media & CDNs
        </h2>
        <p>
          To maintain visual quality and fast global page loads, certain high-resolution editorial photographs are served through content delivery networks (such as Unsplash CDN). When your browser retrieves these images, your IP address is visible to the CDN provider as part of standard HTTP content delivery. No tracking cookies are set by us through these media requests.
        </p>

        <h2 className="font-serif font-bold text-xl text-[#263F35]">
          5. Voluntary Newsletter & Dispatch
        </h2>
        <p>
          If you choose to submit your email address for the Still Mountain Dispatch, your email is gathered solely for communicating upcoming retreats, contemplative essays, and platform updates. We do not sell, rent, or trade email addresses to commercial third parties. You may unsubscribe at any time.
        </p>

        <h2 className="font-serif font-bold text-xl text-[#263F35]">
          6. Standalone PWA & Web Push Notifications
        </h2>
        <p>
          If you choose to install the progressive web application (PWA) and explicitly grant push notification permissions, a browser-generated push subscription token is used strictly to trigger local phase change bells and session reminders. We never use push channels for marketing or advertising.
        </p>

        <h2 className="font-serif font-bold text-xl text-[#263F35]">
          7. Analytics & Tracking
        </h2>
        <p>
          We do not deploy third-party advertising cookies, cross-site tracking pixels, or invasive behavioral profiling trackers. Any telemetry used is strictly privacy-preserving and aggregated to verify site stability and performance.
        </p>

        <h2 className="font-serif font-bold text-xl text-[#263F35]">
          8. Contact & Institutional Inquiries
        </h2>
        <p>
          Still Mountain Pranayama is operated under Still Mountain Wellness Retreat (SMWR). For institutional inquiries regarding data practices or our physical retreat sanctuary, visit{" "}
          <a href="https://smwr.org" className="text-[#263F35] underline font-medium" target="_blank" rel="noopener noreferrer">
            smwr.org
          </a>{" "}
          or contact us through our official retreat desk.
        </p>
      </div>
    </div>
  );
}
