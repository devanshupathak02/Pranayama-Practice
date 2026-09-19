const localtunnel = require('localtunnel');
const https = require('https');

function getBypassPassword() {
  return new Promise((resolve) => {
    https.get('https://loca.lt/mytunnelpassword', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data.trim()));
    }).on('error', () => resolve('Unable to fetch (use your public IP)'));
  });
}

(async () => {
  try {
    console.log('Starting localtunnel on port 8081...');
    const tunnel = await localtunnel({ port: 8081 });
    const password = await getBypassPassword();

    console.log('========================================');
    console.log('PWA TUNNEL READY FOR IPHONE TESTING');
    console.log('URL: ' + tunnel.url);
    console.log('Tunnel Password (if prompted): ' + password);
    console.log('========================================');

    tunnel.on('close', () => {
      console.log('Tunnel closed.');
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err);
    });

    // Keep alive
    process.on('SIGINT', () => {
      tunnel.close();
      process.exit();
    });
  } catch (err) {
    console.error('Failed to start localtunnel:', err);
    process.exit(1);
  }
})();
