const path = require('path');
const fs = require('fs');
const webpush = require('web-push');
const { Redis } = require('@upstash/redis');
const { Client: QStashClient, Receiver: QStashReceiver } = require('@upstash/qstash');

// Load VAPID keys
const VAPID_PATH = path.join(__dirname, 'vapid.json');
let vapidKeys = { publicKey: '', privateKey: '' };
if (fs.existsSync(VAPID_PATH)) {
  vapidKeys = JSON.parse(fs.readFileSync(VAPID_PATH, 'utf8'));
}

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || vapidKeys.publicKey;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || vapidKeys.privateKey;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@smwr.org';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// Check if real Upstash credentials exist
const isUpstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  process.env.QSTASH_TOKEN
);

if (!isUpstashConfigured) {
  console.log('[PUSH CONFIG] ⚠️  UPSTASH CREDENTIALS NOT FOUND. RUNNING IN [MOCK MODE] FOR LOCAL DEV.');
  console.log('[PUSH CONFIG] Pushes and schedules will be logged locally with visible [MOCK MODE] markers.');
} else {
  console.log('[PUSH CONFIG] ✅ Real Upstash credentials loaded. Active live cloud push mode enabled.');
}

// In-Memory Mock Store for local dev fallback
const mockRedisStore = new Map();
const mockQStashStore = new Map();

const redis = isUpstashConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : {
      async get(key) {
        console.log(`[MOCK MODE REDIS] GET ${key}`);
        const val = mockRedisStore.get(key);
        return val ? JSON.parse(val) : null;
      },
      async set(key, val, options) {
        console.log(`[MOCK MODE REDIS] SET ${key} ->`, typeof val === 'object' ? JSON.stringify(val) : val);
        mockRedisStore.set(key, JSON.stringify(val));
        return 'OK';
      },
      async del(key) {
        console.log(`[MOCK MODE REDIS] DEL ${key}`);
        mockRedisStore.delete(key);
        return 1;
      },
    };

const qstash = isUpstashConfigured
  ? new QStashClient({ token: process.env.QSTASH_TOKEN })
  : {
      async publishJSON(options) {
        console.log(`[MOCK MODE QSTASH] SCHEDULE DELAYED MESSAGE (${options.delay}s) -> ${options.url}`, options.body);
        const msgId = 'mock_msg_' + Math.random().toString(36).substring(2, 9);
        mockQStashStore.set(msgId, options);
        return { messageId: msgId };
      },
    };

const qstashReceiver = isUpstashConfigured
  ? new QStashReceiver({
      currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
      nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
    })
  : {
      async verify(options) {
        console.log('[MOCK MODE QSTASH] Verifying webhook signature [MOCK PASS]');
        return true;
      },
    };

module.exports = {
  isUpstashConfigured,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
  VAPID_SUBJECT,
  redis,
  qstash,
  qstashReceiver,
  webpush,
};
