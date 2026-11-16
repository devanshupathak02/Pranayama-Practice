const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const webpush = require('web-push');

const PORT = 3002;

// Generate ephemeral, matching VAPID keypair in memory for test session
const testVapid = webpush.generateVAPIDKeys();

function request(method, urlPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const reqHeaders = { ...headers };
    if (payload) {
      reqHeaders['Content-Type'] = reqHeaders['Content-Type'] || 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: urlPath,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed = data;
          try {
            parsed = JSON.parse(data);
          } catch {
            // Keep as raw string
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function waitForServer(maxAttempts = 15) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await request('GET', '/manifest.webmanifest');
      if (res.status === 200) return true;
      console.log(`Probe returned status ${res.status}`);
    } catch (err) {
      if (i % 5 === 0) console.log(`Waiting for server on 127.0.0.1:${PORT}: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('Server failed to start within timeout');
}

(async () => {
  console.log('===========================================================');
  console.log('--- Phase 5 Architecture Revision Verification Suite ---');
  console.log('--- Multi-Domain Isolation: Marketing vs Timer PWA ---');
  console.log('===========================================================');

  const websiteDir = path.resolve(__dirname, '..', 'website');
  console.log(`Starting next server on port ${PORT}...`);

  const server = spawn('npx', ['next', 'start', '-H', '127.0.0.1', '-p', String(PORT)], {
    cwd: websiteDir,
    shell: true,
    stdio: 'pipe',
    env: {
      ...process.env,
      NEXT_PUBLIC_SITE_URL: 'https://pranayamatimes.org',
      NEXT_PUBLIC_APP_URL: 'https://app.pranayamatimes.org',
      VAPID_PUBLIC_KEY: testVapid.publicKey,
      VAPID_PRIVATE_KEY: testVapid.privateKey,
      VAPID_SUBJECT: 'mailto:security-audit@smwr.org',
    },
  });

  server.stdout.on('data', (d) => {
    const msg = d.toString();
    if (msg.includes('Ready') || msg.includes('started')) {
      console.log(`[Next.js Server] ${msg.trim()}`);
    }
  });

  server.stderr.on('data', (d) => {
    console.error(`[Next.js Err] ${d.toString().trim()}`);
  });

  let testsPassed = 0;
  let testsFailed = 0;

  function assert(name, condition, extraInfo = '') {
    if (condition) {
      console.log(`✅ [PASS] ${name} ${extraInfo}`);
      testsPassed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${extraInfo}`);
      testsFailed++;
    }
  }

  try {
    await waitForServer();
    console.log('Server is responsive. Running assertions...\n');

    // =========================================================
    // 1. MANIFEST ISOLATION TESTS
    // =========================================================
    // A. Main Marketing Homepage must NOT contain <link rel="manifest"
    const homeHtml = await request('GET', '/', null, { Host: 'pranayamatimes.org' });
    assert(
      '1. Main Website Home: HTTP 200',
      homeHtml.status === 200
    );
    assert(
      '2. Manifest Isolation: Main Website DOES NOT advertise PWA manifest',
      typeof homeHtml.body === 'string' && !homeHtml.body.includes('rel="manifest"')
    );

    // B. App Timer page DOES serve the manifest route
    const manifestRes = await request('GET', '/manifest.webmanifest', null, { Host: 'app.pranayamatimes.org' });
    assert('3. Manifest Endpoint HTTP 200', manifestRes.status === 200);
    assert(
      '4. Manifest Name & Display',
      manifestRes.body &&
        manifestRes.body.name === 'Pranayama Times' &&
        manifestRes.body.display === 'standalone' &&
        manifestRes.body.start_url === '/'
    );

    // C. Verify /practice compatibility: never advertises rel="manifest" on the marketing domain
    const timerHtml = await request('GET', '/practice', null, { Host: 'pranayamatimes.org' });
    assert(
      '5. Manifest Isolation: /practice on marketing domain DOES NOT advertise PWA Manifest',
      typeof timerHtml.body === 'string' && !timerHtml.body.includes('rel="manifest"')
    );

    // =========================================================
    // 2. HOSTNAME-AWARE ROUTING TESTS
    // =========================================================
    // A. app.pranayamatimes.org/ rewrites to /practice (dedicated timer app)
    const appRootRes = await request('GET', '/', null, { Host: 'app.pranayamatimes.org' });
    assert('6. App Subdomain Root HTTP 200', appRootRes.status === 200);
    assert(
      '7. App Subdomain Root renders Timer App (not marketing home)',
      typeof appRootRes.body === 'string' &&
        (appRootRes.body.includes('Pranayama Timer') || appRootRes.body.includes('Classical Pranayama'))
    );

    // B. app.pranayamatimes.org/practice redirects to /
    const appPracticeRes = await request('GET', '/practice', null, { Host: 'app.pranayamatimes.org' });
    assert(
      '8. App Subdomain /practice redirects to /',
      appPracticeRes.status === 301 && appPracticeRes.headers.location === '/'
    );

    // C. app.pranayamatimes.org/learn redirects to main marketing domain
    const appLearnRes = await request('GET', '/learn', null, { Host: 'app.pranayamatimes.org' });
    assert(
      '9. App Subdomain /learn redirects to main website',
      appLearnRes.status === 302 &&
        appLearnRes.headers.location &&
        appLearnRes.headers.location.startsWith('https://pranayamatimes.org/learn')
    );

    // D. Main Website Homepage serves marketing editorial content
    assert(
      '10. Main Website Homepage renders Editorial Brand content',
      typeof homeHtml.body === 'string' && homeHtml.body.includes('Find Your Stillness')
    );

    // =========================================================
    // 3. SERVICE WORKER & ASSET ISOLATION
    // =========================================================
    const swRes = await request('GET', '/sw.js');
    assert('11. Service Worker HTTP 200', swRes.status === 200);
    assert(
      '12. Service Worker SKIP_WAITING controlled upgrade',
      typeof swRes.body === 'string' && swRes.body.includes('SKIP_WAITING')
    );
    assert(
      '13. Service Worker Complete 200 Audio Caching Guard',
      typeof swRes.body === 'string' && swRes.body.includes('networkAudio.status === 200')
    );

    // Core icons
    const icon192 = await request('GET', '/icon-192.png');
    assert('14. Icon 192px HTTP 200', icon192.status === 200);
    const icon512 = await request('GET', '/icon-512.png');
    assert('15. Icon 512px HTTP 200', icon512.status === 200);

    // Classical Bells & Spoken Cues
    const bellRes = await request('GET', '/audio/bell/Bell1.mp3');
    assert('16. Classical Bell Audio HTTP 200', bellRes.status === 200);
    const gongRes = await request('GET', '/audio/bell/Gong.mp3');
    assert('17. Classical Gong Audio HTTP 200', gongRes.status === 200);
    const voiceCueRes = await request('GET', '/audio/pranayama/anulom_vilom_name.mp3');
    assert('18. Spoken Technique Audio HTTP 200', voiceCueRes.status === 200);

    // All 4 Yoga Nidra Tracks
    const yn1 = await request('GET', encodeURI('/audio/yoga-nidra/Emotional healing wave.mp3.mpeg'));
    assert('19. Yoga Nidra 1 (Emotional Healing) HTTP 200', yn1.status === 200);
    const yn2 = await request('GET', '/audio/yoga-nidra/diabetes_herb.mpeg');
    assert('20. Yoga Nidra 2 (Diabetes) HTTP 200', yn2.status === 200);
    const yn3 = await request('GET', '/audio/yoga-nidra/rejuvenation.mpeg');
    assert('21. Yoga Nidra 3 (Rejuvenation) HTTP 200', yn3.status === 200);
    const yn4 = await request('GET', '/audio/yoga-nidra/sleep_wave.mpeg');
    assert('22. Yoga Nidra 4 (Sleep Wave) HTTP 200', yn4.status === 200);

    // =========================================================
    // 4. PUSH NOTIFICATION API ON APP ORIGIN
    // =========================================================
    const pubKeyRes = await request('GET', '/api/push/public-key', null, { Host: 'app.pranayamatimes.org' });
    assert('23. Public Key Endpoint HTTP 200', pubKeyRes.status === 200);
    assert(
      '24. Public Key Returned & Matches Config',
      pubKeyRes.body && pubKeyRes.body.publicKey === testVapid.publicKey
    );

    const mockDeviceId = 'device_app_sub_' + Date.now();
    const mockSub = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/mock_token_' + Date.now(),
      keys: {
        p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9t0AgtE_hn7Bi2-4bvIMN2Dg_qS10j-m8rZ4K85KPRx0q8',
        auth: 'tBHItJI5svbp50fJ2K1_Kg',
      },
    };

    const subRes = await request('POST', '/api/push/subscribe', {
      deviceId: mockDeviceId,
      subscription: mockSub,
    }, { Host: 'app.pranayamatimes.org' });
    assert('25. Push Subscribe HTTP 200 on App Origin', subRes.status === 200);

    const reminderRes = await request('POST', '/api/push/reminders', {
      deviceId: mockDeviceId,
      timeOfDay: '06:00',
      timeZone: 'Asia/Kolkata',
      title: 'Dawn Sadhana',
      routineId: 'set-15',
      routineName: '15-Minute Morning Reset',
    }, { Host: 'app.pranayamatimes.org' });
    assert('26. Create Reminder HTTP 200 on App Origin', reminderRes.status === 200);
    const reminderId = reminderRes.body && reminderRes.body.reminder && reminderRes.body.reminder.id;

    const listRes = await request('GET', `/api/push/reminders?deviceId=${mockDeviceId}`, null, { Host: 'app.pranayamatimes.org' });
    assert(
      '27. Retrieve Reminders on App Origin',
      listRes.status === 200 &&
        listRes.body.reminders &&
        listRes.body.reminders.some((r) => r.id === reminderId)
    );

    const delRemRes = await request('DELETE', `/api/push/reminders?deviceId=${mockDeviceId}&reminderId=${reminderId}`, null, { Host: 'app.pranayamatimes.org' });
    assert('28. Cancel Reminder HTTP 200', delRemRes.status === 200);

    const delSubRes = await request('DELETE', `/api/push/subscribe?deviceId=${mockDeviceId}`, null, { Host: 'app.pranayamatimes.org' });
    assert('29. Unsubscribe HTTP 200', delSubRes.status === 200);

    // =========================================================
    // 5. CANONICAL SITEMAP & ROBOTS VERIFICATION
    // =========================================================
    const sitemapRes = await request('GET', '/sitemap.xml', null, { Host: 'pranayamatimes.org' });
    assert('30. Sitemap HTTP 200', sitemapRes.status === 200);
    assert(
      '31. Sitemap uses canonical domain (https://pranayamatimes.org)',
      typeof sitemapRes.body === 'string' && sitemapRes.body.includes('https://pranayamatimes.org')
    );

    const robotsRes = await request('GET', '/robots.txt', null, { Host: 'pranayamatimes.org' });
    assert('32. Robots HTTP 200', robotsRes.status === 200);

    console.log('\n===========================================================');
    console.log(`Results: ${testsPassed} passed, ${testsFailed} failed`);
    console.log('===========================================================');
  } catch (err) {
    console.error('Test Suite Error:', err);
    testsFailed++;
  } finally {
    console.log('Stopping test server...');
    server.kill();
    try {
      spawn('taskkill', ['/pid', String(server.pid), '/f', '/t'], { shell: true });
    } catch {
      // ignore
    }
  }

  process.exit(testsFailed > 0 ? 1 : 0);
})();
