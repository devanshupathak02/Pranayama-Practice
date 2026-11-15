import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Compatibility endpoint: Timer cancellation is handled client-side.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const sessionId = body.sessionId || 'session_' + Date.now();

  return NextResponse.json({
    success: true,
    message: 'Active timer is managed purely client-side.',
    sessionId,
    status: body.status || 'CANCELLED',
  });
}
