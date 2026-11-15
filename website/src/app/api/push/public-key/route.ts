import { NextResponse } from 'next/server';
import { VAPID_PUBLIC_KEY, isVapidConfigured, isUpstashConfigured, isQStashConfigured } from '@/lib/push/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    publicKey: VAPID_PUBLIC_KEY,
    mode: isVapidConfigured && isUpstashConfigured && isQStashConfigured ? 'LIVE' : 'MOCK_MODE',
    vapidConfigured: isVapidConfigured,
    upstashConfigured: isUpstashConfigured,
    qstashConfigured: isQStashConfigured,
  });
}
