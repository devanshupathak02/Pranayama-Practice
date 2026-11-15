import { NextRequest, NextResponse } from 'next/server';
import { redis, isUpstashConfigured } from '@/lib/push/config';
import type { ClientPushSubscription, StoredSubscription } from '@/types/push';

export const dynamic = 'force-dynamic';

function isValidSubscription(sub: unknown): sub is ClientPushSubscription {
  if (!sub || typeof sub !== 'object') return false;
  const s = sub as Record<string, unknown>;
  if (typeof s.endpoint !== 'string' || !s.endpoint.startsWith('https://')) return false;
  if (!s.keys || typeof s.keys !== 'object') return false;
  const k = s.keys as Record<string, unknown>;
  return typeof k.p256dh === 'string' && typeof k.auth === 'string';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { subscription, deviceId } = body;

    if (!deviceId || typeof deviceId !== 'string' || deviceId.trim().length === 0) {
      return NextResponse.json({ error: 'Missing or invalid deviceId' }, { status: 400 });
    }

    if (!isValidSubscription(subscription)) {
      return NextResponse.json(
        { error: 'Invalid PushSubscription: must contain valid HTTPS endpoint and keys (p256dh, auth)' },
        { status: 400 }
      );
    }

    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const now = Date.now();

    const stored: StoredSubscription = {
      deviceId,
      subscription,
      createdAt: now,
      updatedAt: now,
      userAgent,
    };

    const key = `sub:${deviceId}`;
    await redis.set(key, stored);

    return NextResponse.json({
      success: true,
      mode: isUpstashConfigured ? 'LIVE' : 'MOCK_MODE',
      deviceId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json().catch(() => null);
    const deviceId = searchParams.get('deviceId') || (body && body.deviceId);

    if (!deviceId || typeof deviceId !== 'string') {
      return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 });
    }

    const key = `sub:${deviceId}`;
    await redis.del(key);

    return NextResponse.json({
      success: true,
      deviceId,
      message: 'Subscription removed',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
