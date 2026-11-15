import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Practice — Still Mountain Pranayama",
  description: "Terms of practice and educational disclaimer for Still Mountain Pranayama platform.",
};

export default function TermsPage() {
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
          <span>Educational Disclaimer & Guidelines</span>
        </div>
        <h1 className="font-serif font-bold text-4xl sm:text-5xl text-[#263F35]">
          Terms of Practice
        </h1>
        <p className="text-xs text-[#82947A]">Last updated: October 2026</p>
      </div>

      <div className="bg-[#FAF7F2] border border-[#D6C6A5] rounded-3xl p-8 sm:p-10 space-y-6 text-[#355245] text-sm leading-relaxed">
        <h2 className="font-serif font-bold text-xl text-[#263F35]">
          1. Educational Nature of Content
        </h2>
        <p>
          All educational articles, technique descriptions, and breath guidance provided on this website and within the Pranayama Timer are intended strictly for educational, contemplative, and general wellness purposes. They do not constitute medical, psychological, or clinical diagnostic advice.
        </p>

        <h2 className="font-serif font-bold text-xl text-[#263F35]">
          2. Individual Bodily Limits & Precautions
        </h2>
        <p>
          Pranayama is a delicate, progressive practice. Practitioners must always honor their natural capacity without forcing breath retention (*kumbhaka*) or creating strain in the throat, chest, or head. If you experience dizziness, lightheadedness, or discomfort, immediately cease the technique and resume effortless nasal breathing.
        </p>

        <h2 className="font-serif font-bold text-xl text-[#263F35]">
          3. Medical Contraindications
        </h2>
        <p>
          Dynamic techniques such as Bhastrika and Kapalbhati, as well as breath retention (Bahya and Antar Kumbhaka), are strictly contraindicated for individuals with uncontrolled hypertension, cardiovascular conditions, epilepsy, hernia, glaucoma, detached retina, recent abdominal or eye surgery, or during pregnancy. Please consult with a licensed physician or qualified medical practitioner before initiating any intense breathwork protocol.
        </p>

        <h2 className="font-serif font-bold text-xl text-[#263F35]">
          4. Safe Practice Environment
        </h2>
        <p>
          Never practice pranayama or breath retention while driving a motor vehicle, operating machinery, standing, or submerged in water (bath, pool, or open water). Always practice seated securely on a cushion or chair in a safe, quiet room where accidental loss of balance cannot cause physical injury.
        </p>

        <h2 className="font-serif font-bold text-xl text-[#263F35]">
          5. Intellectual Property
        </h2>
        <p>
          All editorial essays, graphic identity marks, visual designs, and routine architectures are the intellectual property of Still Mountain Wellness Retreat and Still Mountain Pranayama.
        </p>
      </div>
    </div>
  );
}
