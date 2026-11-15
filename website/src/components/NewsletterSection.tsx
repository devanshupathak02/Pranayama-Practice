"use client";

import React, { useState } from "react";
import { Check, Mail, Loader2, AlertCircle } from "lucide-react";

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setStatus("error");
      setFeedbackMessage("Please enter a valid email address (e.g., name@example.com).");
      return;
    }

    // Check duplicate in client localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("sm_newsletter_subscribers");
        const list: string[] = stored ? JSON.parse(stored) : [];
        if (list.includes(cleanEmail)) {
          setStatus("success");
          setFeedbackMessage(
            "You are already registered for early access with this email. We will notify you when the first dispatch releases."
          );
          setEmail("");
          return;
        }
      } catch {
        // Ignore localStorage parse error
      }
    }

    setStatus("loading");
    setFeedbackMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to complete subscription.");
      }

      // Store in client storage to prevent duplicate submissions
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("sm_newsletter_subscribers");
          const list: string[] = stored ? JSON.parse(stored) : [];
          if (!list.includes(cleanEmail)) {
            list.push(cleanEmail);
            localStorage.setItem("sm_newsletter_subscribers", JSON.stringify(list));
          }
        } catch {
          // Ignore storage error
        }
      }

      setStatus("success");
      setFeedbackMessage(
        "Thank you. Your email has been registered for the upcoming Still Mountain Dispatch preview. We will notify you when our quarterly publication launches."
      );
      setEmail("");
    } catch (err: unknown) {
      setStatus("error");
      const msg = err instanceof Error ? err.message : "Unable to subscribe right now. Please try again later.";
      setFeedbackMessage(msg);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-[#FAF7F2] border border-[#D6C6A5] rounded-3xl p-8 sm:p-12 lg:p-16 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 bg-[#EDE8DC] text-[#263F35] border border-[#D6C6A5] px-3.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5 text-[#82947A]" />
          <span>Still Mountain Dispatch</span>
        </div>

        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#263F35]">
            Receive Quiet Wisdom for Daily Practice.
          </h2>
          <p className="text-[#355245] text-base sm:text-lg leading-relaxed">
            Quarterly reflections on classical pranayama techniques, nervous system research, and seasonal retreat invitations from Still Mountain.
          </p>
        </div>

        {status === "success" ? (
          <div className="bg-[#E2E8DF] border border-[#82947A] p-5 rounded-2xl max-w-lg mx-auto text-[#263F35] flex items-start justify-center gap-3 text-xs sm:text-sm font-medium leading-relaxed">
            <Check className="w-5 h-5 text-[#82947A] shrink-0 mt-0.5" />
            <span className="text-left">{feedbackMessage}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="Enter your email address"
                required
                className="flex-1 px-4 py-3 bg-[#EDE8DC] border border-[#D6C6A5] focus:border-[#263F35] rounded-xl text-sm text-[#263F35] placeholder:text-[#82947A] focus:outline-none focus:ring-1 focus:ring-[#263F35] transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 bg-[#263F35] hover:bg-[#1A2D25] text-[#FAF7F2] px-6 py-3 rounded-xl font-medium text-sm transition-all shadow-xs disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35]"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <span>Join Dispatch</span>
                )}
              </button>
            </div>
            {status === "error" && (
              <div className="flex items-center gap-1.5 text-xs text-[#B97755] font-medium text-left">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{feedbackMessage}</span>
              </div>
            )}
            <p className="text-[11px] text-[#82947A]">
              No commercial ads. Unsubscribe anytime with a single click.
            </p>
          </form>
        )}
      </div>
    </section>
  );
};
