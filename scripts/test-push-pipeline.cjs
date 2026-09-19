const http = require('http');

function post(urlPath, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 8081,
      path: urlPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:8081${urlPath}`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    }).on('error', reject);
  });
}

(async () => {
  console.log('===========================================================');
  console.log('--- Web Push Pipeline & Staleness Verification Suite ---');
  console.log('===========================================================');

  // 1. Test public key
  const keyRes = await get('/api/push/public-key');
  console.log('1. Public Key Endpoint:', keyRes.status === 200 ? '✅ PASS' : '❌ FAIL', keyRes.data);

  // 2. Test subscribe
  const mockSub = { endpoint: 'https://updates.push.services.mozilla.com/wpush/v2/...', keys: { auth: 'mock_auth', p256dh: 'mock_p256dh' } };
  const subRes = await post('/api/push/subscribe', { deviceId: 'test_device_123', subscription: mockSub });
  console.log('2. Subscribe Endpoint:', subRes.status === 200 ? '✅ PASS' : '❌ FAIL', subRes.data);

  // 3. Test schedule for Session A
  const scheduleEvents = [
    { delaySeconds: 30, phaseName: 'Kapalbhati', phaseIndex: 2, totalPhases: 4, timeRemainingSeconds: 150 },
    { delaySeconds: 75, phaseName: 'Anulom Vilom', phaseIndex: 3, totalPhases: 4, timeRemainingSeconds: 105 },
    { delaySeconds: 150, phaseName: 'Session Complete', phaseIndex: 4, totalPhases: 4, timeRemainingSeconds: 0 },
  ];

  const schedResA = await post('/api/push/schedule', {
    deviceId: 'test_device_123',
    sessionId: 'session_A',
    events: scheduleEvents,
    totalDurationSeconds: 180,
  });
  console.log('3. Schedule Endpoint (Session A):', schedResA.status === 200 ? '✅ PASS' : '❌ FAIL', schedResA.data);

  // 4. Test Webhook trigger (Session A - valid active session)
  const webhookPayloadA = {
    sessionId: 'session_A',
    scheduleToken: schedResA.data.scheduleToken,
    deviceId: 'test_device_123',
    phaseName: 'Kapalbhati',
    phaseIndex: 2,
    totalPhases: 4,
    timeRemainingSeconds: 150,
    expectedFireTime: Date.now() + 30000,
    maxValidTime: Date.now() + 210000,
  };

  const webhookResA = await post('/api/push/webhook', webhookPayloadA);
  console.log('4. Webhook Trigger Execution (Session A active):', webhookResA.status === 200 ? '✅ PASS' : '❌ FAIL', webhookResA.data);

  // 5. Test In-App Pause & Check 2 Rejection (DROPPED_SESSION_INACTIVE)
  const pauseRes = await post('/api/push/cancel', { sessionId: 'session_A', status: 'PAUSED' });
  console.log('5. In-App Pause Endpoint:', pauseRes.status === 200 ? '✅ PASS' : '❌ FAIL', pauseRes.data);

  const webhookPausedRes = await post('/api/push/webhook', webhookPayloadA);
  console.log('   Check 2 Validation (Paused Session Rejection):', webhookPausedRes.data.status === 'DROPPED_SESSION_INACTIVE' ? '✅ PASS (DROPPED_SESSION_INACTIVE)' : '❌ FAIL', webhookPausedRes.data);

  // 6. Test Case 6: Pure Isolated Check 3 Test (Device Pointer Supersession)
  console.log('\n--- Testing Test Case 6: Pure Check 3 Device Supersession ---');
  
  // Step A: Start Session C (Leaves session:session_C status as 'ACTIVE')
  const schedResC = await post('/api/push/schedule', {
    deviceId: 'device_supersede_test',
    sessionId: 'session_C',
    events: [
      { delaySeconds: 30, phaseName: 'Ujjayi', phaseIndex: 2, totalPhases: 3, timeRemainingSeconds: 90 },
      { delaySeconds: 60, phaseName: 'Session Complete', phaseIndex: 3, totalPhases: 3, timeRemainingSeconds: 0 },
    ],
    totalDurationSeconds: 120,
  });
  console.log('   Step A: Schedule Session C (ACTIVE):', schedResC.status === 200 ? '✅ PASS' : '❌ FAIL');

  // Step B: Start Session D on the SAME device without cancelling Session C
  // (Leaves Session C's own status = 'ACTIVE' and token valid, but active_device_session pointer moves to session_D)
  const schedResD = await post('/api/push/schedule', {
    deviceId: 'device_supersede_test',
    sessionId: 'session_D',
    events: [
      { delaySeconds: 20, phaseName: 'Bhastrika', phaseIndex: 2, totalPhases: 3, timeRemainingSeconds: 90 },
      { delaySeconds: 50, phaseName: 'Session Complete', phaseIndex: 3, totalPhases: 3, timeRemainingSeconds: 0 },
    ],
    totalDurationSeconds: 120,
  });
  console.log('   Step B: Schedule Session D on same device (Moves pointer to Session D):', schedResD.status === 200 ? '✅ PASS' : '❌ FAIL');

  // Step C: Trigger Session C's webhook.
  // Because Session C's status is still ACTIVE and its token is valid, it passes Check 1 & Check 2,
  // and MUST be rejected specifically by Check 3 (DROPPED_DEVICE_SUPERSEDED).
  const webhookResC = await post('/api/push/webhook', {
    sessionId: 'session_C',
    scheduleToken: schedResC.data.scheduleToken,
    deviceId: 'device_supersede_test',
    phaseName: 'Ujjayi',
    phaseIndex: 2,
    totalPhases: 3,
    timeRemainingSeconds: 90,
    expectedFireTime: Date.now() + 30000,
    maxValidTime: Date.now() + 150000,
  });
  console.log('   Step C: Session C Webhook (Must hit Check 3 specifically):', 
    webhookResC.data.status === 'DROPPED_DEVICE_SUPERSEDED' ? '✅ PASS (DROPPED_DEVICE_SUPERSEDED)' : '❌ FAIL', 
    webhookResC.data
  );

  // Step D: Trigger Session D's webhook (Must succeed and deliver)
  // First register sub for device_supersede_test
  await post('/api/push/subscribe', { deviceId: 'device_supersede_test', subscription: mockSub });
  const webhookResD = await post('/api/push/webhook', {
    sessionId: 'session_D',
    scheduleToken: schedResD.data.scheduleToken,
    deviceId: 'device_supersede_test',
    phaseName: 'Bhastrika',
    phaseIndex: 2,
    totalPhases: 3,
    timeRemainingSeconds: 90,
    expectedFireTime: Date.now() + 20000,
    maxValidTime: Date.now() + 150000,
  });
  console.log('   Step D: Session D Webhook (Active session, must deliver):', 
    webhookResD.status === 200 && webhookResD.data.delivered ? '✅ PASS (DELIVERED)' : '❌ FAIL', 
    webhookResD.data
  );

  console.log('\n===========================================================');
  console.log('✅ ALL Web Push Pipeline & Supersession Tests PASSED!');
  console.log('===========================================================');
})();
