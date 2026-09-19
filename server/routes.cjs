const { redis, qstash, qstashReceiver, webpush, isUpstashConfigured, VAPID_PUBLIC_KEY } = require('./config.cjs');

/**
 * Handle POST /api/push/subscribe
 */
async function handleSubscribe(req, res) {
  try {
    const { subscription, deviceId } = req.body;
    if (!subscription || !deviceId) {
      return res.status(400).json({ error: 'Missing subscription or deviceId' });
    }

    const key = `sub:${deviceId}`;
    await redis.set(key, subscription);

    console.log(`[API /api/push/subscribe] ${isUpstashConfigured ? '[LIVE]' : '[MOCK MODE]'} Stored subscription for device ${deviceId}`);
    return res.status(200).json({
      success: true,
      mode: isUpstashConfigured ? 'LIVE' : 'MOCK_MODE',
      deviceId,
    });
  } catch (err) {
    console.error('[API /api/push/subscribe] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Handle POST /api/push/schedule
 */
async function handleSchedule(req, res) {
  try {
    const { deviceId, sessionId, events, totalDurationSeconds, webhookBaseUrl } = req.body;
    if (!deviceId || !sessionId || !Array.isArray(events)) {
      return res.status(400).json({ error: 'Missing required schedule parameters' });
    }

    const scheduleToken = 'token_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const maxValidTime = Date.now() + (totalDurationSeconds || 300) * 1000 + 30000;

    // 1. Record active session in Redis
    const sessionKey = `session:${sessionId}`;
    const sessionData = {
      status: 'ACTIVE',
      scheduleToken,
      deviceId,
      maxValidTime,
    };

    await redis.set(sessionKey, sessionData, { ex: (totalDurationSeconds || 300) + 300 });
    await redis.set(`active_device_session:${deviceId}`, sessionId, { ex: (totalDurationSeconds || 300) + 300 });

    const port = process.env.PORT || 8081;
    const webhookUrl = `${webhookBaseUrl || `http://localhost:${port}`}/api/push/webhook`;
    const messageIds = [];

    for (const ev of events) {
      if (typeof ev.delaySeconds !== 'number' || ev.delaySeconds < 0) continue;

      const payload = {
        sessionId,
        scheduleToken,
        deviceId,
        phaseName: ev.phaseName,
        phaseIndex: ev.phaseIndex,
        totalPhases: ev.totalPhases,
        timeRemainingSeconds: ev.timeRemainingSeconds,
        expectedFireTime: Date.now() + ev.delaySeconds * 1000,
        maxValidTime,
      };

      const result = await qstash.publishJSON({
        url: webhookUrl,
        body: payload,
        delay: ev.delaySeconds,
      });

      if (result && result.messageId) {
        messageIds.push(result.messageId);
      }
    }

    console.log(`[API /api/push/schedule] ${isUpstashConfigured ? '[LIVE]' : '[MOCK MODE]'} Scheduled ${events.length} pushes for session ${sessionId} (token: ${scheduleToken})`);

    return res.status(200).json({
      success: true,
      mode: isUpstashConfigured ? 'LIVE' : 'MOCK_MODE',
      sessionId,
      scheduleToken,
      scheduledCount: events.length,
      messageIds,
    });
  } catch (err) {
    console.error('[API /api/push/schedule] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Handle POST /api/push/cancel
 */
async function handleCancel(req, res) {
  try {
    const { sessionId, status } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }

    const sessionKey = `session:${sessionId}`;
    const existing = await redis.get(sessionKey);

    if (existing) {
      const updated = {
        ...existing,
        status: status || 'CANCELLED',
      };
      await redis.set(sessionKey, updated);
    }

    console.log(`[API /api/push/cancel] ${isUpstashConfigured ? '[LIVE]' : '[MOCK MODE]'} Cancelled session ${sessionId} (Status: ${status || 'CANCELLED'})`);

    return res.status(200).json({
      success: true,
      mode: isUpstashConfigured ? 'LIVE' : 'MOCK_MODE',
      sessionId,
      status: status || 'CANCELLED',
    });
  } catch (err) {
    console.error('[API /api/push/cancel] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Handle POST /api/push/webhook (Triggered by QStash)
 */
async function handleWebhook(req, res) {
  try {
    // 1. Signature Verification
    if (isUpstashConfigured) {
      const signature = req.headers['upstash-signature'];
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const isValid = await qstashReceiver.verify({ signature, body: rawBody });
      if (!isValid) {
        console.warn('[API /api/push/webhook] ⚠️ Invalid QStash signature. Dropping.');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const payload = req.body;
    const { sessionId, scheduleToken, deviceId, phaseName, phaseIndex, totalPhases, timeRemainingSeconds, maxValidTime } = payload;

    console.log(`[API /api/push/webhook] Received push trigger for session ${sessionId}, phase: "${phaseName}"`);

    // 2. Staleness Check: Max Validity Window
    if (maxValidTime && Date.now() > maxValidTime) {
      console.log(`[API /api/push/webhook] ⏱️ Stale push dropped: Date.now() (${Date.now()}) > maxValidTime (${maxValidTime})`);
      return res.status(200).json({ status: 'DROPPED_STALE_MAX_TIME' });
    }

    // 3. Staleness Check: Redis Session Status & Schedule Token Match
    const sessionKey = `session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      console.log(`[API /api/push/webhook] 🛑 Session ${sessionId} not found in Redis. Dropping push.`);
      return res.status(200).json({ status: 'DROPPED_SESSION_NOT_FOUND' });
    }

    if (sessionData.status !== 'ACTIVE') {
      console.log(`[API /api/push/webhook] 🛑 Session ${sessionId} status is "${sessionData.status}" (not ACTIVE). Dropping push.`);
      return res.status(200).json({ status: 'DROPPED_SESSION_INACTIVE' });
    }

    if (sessionData.scheduleToken !== scheduleToken) {
      console.log(`[API /api/push/webhook] 🛑 Session ${sessionId} scheduleToken mismatch (active: ${sessionData.scheduleToken}, received: ${scheduleToken}). Dropping superseded push.`);
      return res.status(200).json({ status: 'DROPPED_SUPERSEDED_TOKEN' });
    }

    // 4. Device Supersession Check
    const activeDeviceSession = await redis.get(`active_device_session:${deviceId}`);
    if (activeDeviceSession && activeDeviceSession !== sessionId) {
      console.log(`[API /api/push/webhook] 🛑 Device ${deviceId} active session changed to ${activeDeviceSession} (this is ${sessionId}). Dropping stale session push.`);
      return res.status(200).json({ status: 'DROPPED_DEVICE_SUPERSEDED' });
    }

    // 5. Lookup PushSubscription
    const subKey = `sub:${deviceId}`;
    const subscription = await redis.get(subKey);

    if (!subscription) {
      console.warn(`[API /api/push/webhook] ⚠️ No subscription found for device ${deviceId}.`);
      return res.status(200).json({ status: 'DROPPED_NO_SUBSCRIPTION' });
    }

    // 6. Format Informational Push Payload
    const mins = Math.floor(timeRemainingSeconds / 60);
    const secs = timeRemainingSeconds % 60;
    const timeFormatted = mins > 0 ? `${mins}m ${secs > 0 ? `${secs}s` : ''}`.trim() : `${secs}s`;

    const pushPayload = {
      title: `🧘 ${phaseName}`,
      body: `Phase ${phaseIndex} of ${totalPhases} • ${timeFormatted} remaining in session`,
      tag: 'pranayama-session',
      renotify: true,
      data: { url: '/' },
    };

    if (isUpstashConfigured) {
      await webpush.sendNotification(subscription, JSON.stringify(pushPayload));
      console.log(`[API /api/push/webhook] ✅ [LIVE] Web Push sent successfully to device ${deviceId}: "${pushPayload.title}"`);
    } else {
      console.log(`[API /api/push/webhook] 📢 [MOCK MODE] Web Push simulated to device ${deviceId}:`, pushPayload);
    }

    return res.status(200).json({
      success: true,
      mode: isUpstashConfigured ? 'LIVE' : 'MOCK_MODE',
      delivered: pushPayload,
    });
  } catch (err) {
    console.error('[API /api/push/webhook] Error delivering push:', err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Handle GET /api/push/public-key
 */
function handlePublicKey(req, res) {
  return res.status(200).json({
    publicKey: VAPID_PUBLIC_KEY,
    mode: isUpstashConfigured ? 'LIVE' : 'MOCK_MODE',
  });
}

module.exports = {
  handleSubscribe,
  handleSchedule,
  handleCancel,
  handleWebhook,
  handlePublicKey,
};
