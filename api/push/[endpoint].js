const { handleSubscribe, handleSchedule, handleCancel, handleWebhook, handlePublicKey } = require('../../server/routes.cjs');

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, upstash-signature');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { endpoint } = req.query;

  if (endpoint === 'public-key' && req.method === 'GET') {
    return handlePublicKey(req, res);
  }
  if (endpoint === 'subscribe' && req.method === 'POST') {
    return handleSubscribe(req, res);
  }
  if (endpoint === 'schedule' && req.method === 'POST') {
    return handleSchedule(req, res);
  }
  if (endpoint === 'cancel' && req.method === 'POST') {
    return handleCancel(req, res);
  }
  if (endpoint === 'webhook' && req.method === 'POST') {
    return handleWebhook(req, res);
  }

  return res.status(404).json({ error: `Endpoint /api/push/${endpoint} not found` });
};
