import { PracticeFeature } from "@/types";

export const APP_FEATURES: PracticeFeature[] = [
  {
    id: "feature-1",
    title: "Classical Pranayama Sequences",
    tagline: "35m, 46m & 60m Master Sets",
    description:
      "Structured six-stage pranayama sequences (Bhastrika, Kapalbhati, Bahya, Ujjayi, Anulom Vilom, Bhramari) paired with exact 1-minute witness breath pauses for authentic physiological balance.",
    badge: "Core Practice",
    iconName: "Wind",
  },
  {
    id: "feature-2",
    title: "Immersive Yoga Nidra Tracks",
    tagline: "4 Guided Relaxation Journeys",
    description:
      "High-definition guided meditations and sleep wave tracks including Rejuvenation, Emotional Healing, and Deep Rest, designed for seamless daytime replenishment.",
    badge: "Restoration",
    iconName: "Moon",
  },
  {
    id: "feature-3",
    title: "Uncompromising Timer Accuracy",
    tagline: "Real-Time Timestamp Math (D2)",
    description:
      "Built with a dedicated pure-TypeScript state engine computing Date.now() deltas. Your session timing and bell transitions will never drift when your screen locks or the tab backgrounds.",
    badge: "Precision",
    iconName: "Timer",
  },
  {
    id: "feature-4",
    title: "Sacred Chimes & Voice Guidance",
    tagline: "Gentle Cues with Scoped Muting",
    description:
      "Singing bowls, temple gongs, and spoken Sanskrit technique names. Mute technique names once you have memorized the order while preserving vital witness bells.",
    badge: "Audio Cues",
    iconName: "Bell",
  },
  {
    id: "feature-5",
    title: "Custom Routine Creator",
    tagline: "Build Your Personal Sequence",
    description:
      "Design personalized practice routines with custom phase counts, bespoke durations, device photo backgrounds, and personal audio cues saved directly onto your device.",
    badge: "Flexibility",
    iconName: "Sliders",
  },
  {
    id: "feature-6",
    title: "Zero Accounts & 100% Offline",
    tagline: "Privacy by Design on IndexedDB",
    description:
      "No logins, no telemetry, no tracking. All routines, custom presets, and practice history are stored permanently on your device's browser and work completely offline.",
    badge: "Privacy First",
    iconName: "ShieldCheck",
  },
];
