import { NextRequest, NextResponse } from 'next/server';
import { redis, qstash, isQStashConfigured } from '@/lib/push/config';
import type { PracticeReminder, StoredSubscription } from '@/types/push';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 });
    }

    const reminderIdsKey = `reminders:${deviceId}`;
    const reminderIds = (await redis.get<string[]>(reminderIdsKey)) || [];

    const reminders: PracticeReminder[] = [];
    for (const id of reminderIds) {
      const rem = await redis.get<PracticeReminder>(`reminder:${deviceId}:${id}`);
      if (rem) {
        reminders.push(rem);
      }
    }

    return NextResponse.json({
      success: true,
      reminders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { deviceId, timeOfDay, timeZone, title, routineId, routineName } = body;

    if (!deviceId || typeof deviceId !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid deviceId' }, { status: 400 });
    }

    // Validate time format (HH:MM)
    if (!timeOfDay || !/^\d{2}:\d{2}$/.test(timeOfDay)) {
      return NextResponse.json({ error: 'timeOfDay must be in HH:MM format (24-hour)' }, { status: 400 });
    }

    // Verify subscription exists
    const subKey = `sub:${deviceId}`;
    const existingSub = await redis.get<StoredSubscription>(subKey);
    if (!existingSub) {
      return NextResponse.json(
        { error: 'No active push subscription found for this device. Please enable notifications first.' },
        { status: 404 }
      );
    }

    const reminderId = 'rem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const reminder: PracticeReminder = {
      id: reminderId,
      deviceId,
      title: title || 'Morning Pranayama Sadhana',
      timeOfDay,
      timeZone: timeZone || 'UTC',
      routineId: routineId || 'set-15',
      routineName: routineName || '15-Minute Morning Reset',
      enabled: true,
      createdAt: Date.now(),
    };

    // Calculate delay in seconds until next target time
    const [targetHour, targetMinute] = timeOfDay.split(':').map(Number);
    const now = new Date();
    const target = new Date(now);
    target.setHours(targetHour, targetMinute, 0, 0);

    // If target has already passed today, schedule for tomorrow
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }

    const delaySeconds = Math.max(10, Math.floor((target.getTime() - now.getTime()) / 1000));

    // Schedule via QStash if configured
    let qstashScheduleId: string | undefined;
    if (isQStashConfigured) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://app.pranayamatimes.org';
      const webhookUrl = `${baseUrl}/api/push/webhook`;

      const qstashResult = await qstash.publishJSON({
        url: webhookUrl,
        delay: delaySeconds,
        body: {
          type: 'DAILY_REMINDER',
          deviceId,
          reminderId,
          title: reminder.title,
          body: `Time for your ${reminder.routineName} practice. Find a comfortable seated posture.`,
          url: '/',
          timestamp: Date.now(),
        },
      });

      if (qstashResult && 'messageId' in qstashResult) {
        qstashScheduleId = qstashResult.messageId;
      }
    }

    reminder.qstashScheduleId = qstashScheduleId;

    // Save reminder in Redis
    await redis.set(`reminder:${deviceId}:${reminderId}`, reminder);

    // Append to reminder index for device
    const reminderIdsKey = `reminders:${deviceId}`;
    const existingIds = (await redis.get<string[]>(reminderIdsKey)) || [];
    if (!existingIds.includes(reminderId)) {
      existingIds.push(reminderId);
      await redis.set(reminderIdsKey, existingIds);
    }

    return NextResponse.json({
      success: true,
      reminder,
      scheduledDelaySeconds: delaySeconds,
      mode: isQStashConfigured ? 'LIVE_QSTASH' : 'MOCK_LOCAL',
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
    const reminderId = searchParams.get('reminderId') || (body && body.reminderId);

    if (!deviceId || !reminderId) {
      return NextResponse.json({ error: 'Missing deviceId or reminderId' }, { status: 400 });
    }

    // Remove specific reminder
    await redis.del(`reminder:${deviceId}:${reminderId}`);

    // Update reminder index
    const reminderIdsKey = `reminders:${deviceId}`;
    const existingIds = (await redis.get<string[]>(reminderIdsKey)) || [];
    const updatedIds = existingIds.filter((id) => id !== reminderId);
    await redis.set(reminderIdsKey, updatedIds);

    return NextResponse.json({
      success: true,
      message: 'Reminder cancelled successfully',
      reminderId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
