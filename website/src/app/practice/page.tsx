import React from 'react';
import type { Metadata } from 'next';
import { TimerAppShell } from '@/components/timer-app/TimerAppShell';

export const metadata: Metadata = {
  title: 'Pranayama Timer — Dedicated Breathing & Yoga Nidra Application',
  description:
    'Distraction-free classical pranayama breathing timer and guided yoga nidra audio by Still Mountain.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PracticePage() {
  return <TimerAppShell />;
}
