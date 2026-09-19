const fs = require('fs');
const path = require('path');
const webpush = require('web-push');

const SERVER_DIR = path.join(__dirname, '..', 'server');
const VAPID_FILE = path.join(SERVER_DIR, 'vapid.json');
const ENV_EXAMPLE_FILE = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(SERVER_DIR)) {
  fs.mkdirSync(SERVER_DIR, { recursive: true });
}

let vapidKeys;
if (fs.existsSync(VAPID_FILE)) {
  console.log('[VAPID] Loading existing VAPID keys from server/vapid.json');
  vapidKeys = JSON.parse(fs.readFileSync(VAPID_FILE, 'utf8'));
} else {
  console.log('[VAPID] Generating new VAPID keypair...');
  vapidKeys = webpush.generateVAPIDKeys();
  fs.writeFileSync(VAPID_FILE, JSON.stringify(vapidKeys, null, 2), 'utf8');
  console.log('[VAPID] VAPID keys saved to server/vapid.json');
}

console.log('==============================================');
console.log('VAPID PUBLIC KEY (Used by PWA client):');
console.log(vapidKeys.publicKey);
console.log('==============================================');

// Create or update .env.example
const envExampleContent = `# Upstash Redis (Single vendor storage for push subscriptions & session tokens)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Upstash QStash (Single vendor scheduler for delayed phase change webhooks)
QSTASH_TOKEN="..."
QSTASH_CURRENT_SIGNING_KEY="..."
QSTASH_NEXT_SIGNING_KEY="..."

# Web Push VAPID Credentials
VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"
VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"
VAPID_SUBJECT="mailto:admin@smwr.org"
`;

fs.writeFileSync(ENV_EXAMPLE_FILE, envExampleContent, 'utf8');
console.log('[VAPID] Updated .env.example with VAPID keys');
