const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { handleSubscribe, handleSchedule, handleCancel, handleWebhook, handlePublicKey } = require('./routes.cjs');

const PORT = process.env.PORT || 8081;
const DIST_DIR = path.join(__dirname, '..', 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve(body);
      }
    });
    req.on('error', reject);
  });
}

function wrapResponse(res) {
  return {
    status(code) {
      res.statusCode = code;
      return this;
    },
    json(data) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    }
  };
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Add CORS headers for testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, upstash-signature');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  // --- API Routes ---
  if (pathname.startsWith('/api/push/')) {
    const wrappedRes = wrapResponse(res);
    req.body = await parseBody(req);

    if (pathname === '/api/push/public-key' && req.method === 'GET') {
      return handlePublicKey(req, wrappedRes);
    }
    if (pathname === '/api/push/subscribe' && req.method === 'POST') {
      return handleSubscribe(req, wrappedRes);
    }
    if (pathname === '/api/push/schedule' && req.method === 'POST') {
      return handleSchedule(req, wrappedRes);
    }
    if (pathname === '/api/push/cancel' && req.method === 'POST') {
      return handleCancel(req, wrappedRes);
    }
    if (pathname === '/api/push/webhook' && req.method === 'POST') {
      return handleWebhook(req, wrappedRes);
    }

    return wrappedRes.status(404).json({ error: 'Endpoint not found' });
  }

  // --- Static File Serving from dist/ ---
  let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);
  if (!fs.existsSync(filePath)) {
    // Single-page app fallback to index.html for navigation
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.statusCode = 500;
      return res.end(`Server Error: ${err.message}`);
    }
    res.setHeader('Content-Type', contentType);
    // Disable caching for sw.js and index.html to avoid stale code
    if (pathname === '/sw.js' || pathname === '/' || pathname === '/index.html') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log('========================================================');
  console.log(`[PWA Dev Server] Serving static dist/ and /api/push/* on http://localhost:${PORT}`);
  console.log('========================================================');
});
