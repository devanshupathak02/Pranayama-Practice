import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Compatibility endpoint: Timer phase transitions are now handled client-side.
 * This endpoint remains as a graceful compatibility layer.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const sessionId = body.sessionId || 'session_' + Date.now();
  const scheduleToken = 'token_' + Date.now();

  return NextResponse.json({
    success: true,
    message: 'Active timer transitions are managed purely client-side via TimerEngine. Web Push is reserved for daily practice reminders.',
    sessionId,
    scheduleToken,
    scheduledCount: (body.events && body.events.length) || 0,
  });
}
