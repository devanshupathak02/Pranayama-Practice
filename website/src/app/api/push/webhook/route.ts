import { NextRequest, NextResponse } from 'next/server';
import { redis, qstashReceiver, webpush, isVapidConfigured, isUpstashConfigured, isQStashConfigured } from '@/lib/push/config';
import type { StoredSubscription, WebhookPushPayload } from '@/types/push';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // 1. Signature Verification with QStash when in production
    if (isQStashConfigured && process.env.QSTASH_CURRENT_SIGNING_KEY) {
      const signature = req.headers.get('upstash-signature') || '';
      const isValid = await qstashReceiver.verify({
        signature,
        body: rawBody,
      });

      if (!isValid) {
        console.warn('[Push Webhook] ⚠️ Invalid QStash signature. Dropping request.');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    let payload: WebhookPushPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const { deviceId, title, body, url } = payload;
    if (!deviceId) {
      return NextResponse.json({ error: 'Missing deviceId in webhook payload' }, { status: 400 });
    }

    // 2. Fetch active push subscription from Redis
    const subKey = `sub:${deviceId}`;
    const storedSub = await redis.get<StoredSubscription>(subKey);

    if (!storedSub || !storedSub.subscription) {
      console.warn(`[Push Webhook] ⚠️ No active subscription found for device ${deviceId}. Dropping push.`);
      return NextResponse.json({ status: 'DROPPED_NO_SUBSCRIPTION' }, { status: 200 });
    }

    // 3. Format Web Push Notification Payload
    const notificationData = {
      title: title || '🧘 Pranayama Sadhana Reminder',
      body: body || 'Time for your daily breathing practice. Find a calm space.',
      icon: '/icon-192.png',
      badge: '/favicon-32.png',
      tag: 'daily-reminder',
      renotify: true,
      data: {
        url: url || '/practice',
        timestamp: Date.now(),
      },
    };

    // 4. Dispatch Push Notification (Live when configured, Mock simulation when keys absent)
    if (!isVapidConfigured) {
      console.log(
        `[Push Webhook] 📢 [MOCK MODE] Push simulated for device ${deviceId}: "${notificationData.title}"`
      );
      return NextResponse.json({
        success: true,
        mode: 'MOCK_MODE',
        delivered: notificationData,
      });
    }

    try {
      await webpush.sendNotification(
        storedSub.subscription,
        JSON.stringify(notificationData)
      );

      console.log(
        `[Push Webhook] ✅ ${isUpstashConfigured ? '[LIVE]' : '[MOCK]'} Push delivered to device ${deviceId}: "${notificationData.title}"`
      );

      return NextResponse.json({
        success: true,
        mode: isUpstashConfigured ? 'LIVE' : 'MOCK_LOCAL',
        delivered: notificationData,
      });
    } catch (pushErr: unknown) {
      const err = pushErr as { statusCode?: number; message?: string };
      console.warn(`[Push Webhook] Web push error for device ${deviceId}:`, err.message);

      // Clean up dead/unsubscribed endpoints (HTTP 404 or 410 Gone)
      if (err.statusCode === 404 || err.statusCode === 410) {
        console.log(`[Push Webhook] Subscription expired (HTTP ${err.statusCode}). Removing sub:${deviceId}`);
        await redis.del(subKey);
      }

      return NextResponse.json(
        { error: 'Failed to deliver push notification', statusCode: err.statusCode },
        { status: 500 }
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Push Webhook] Uncaught error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
