const { spawn } = require('child_process');

function startTunnel() {
  console.log('[Tunnel] Starting SSH tunnel to localhost.run...');
  const proc = spawn('ssh', [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'ServerAliveInterval=30',
    '-o', 'ServerAliveCountMax=3',
    '-R', '80:localhost:8081',
    'nokey@localhost.run'
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  proc.stdout.on('data', (data) => {
    const text = data.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9.-]+\.lhr\.life/);
    if (match) {
      console.log('========================================');
      console.log('PWA LIVE HTTPS URL: ' + match[0]);
      console.log('========================================');
    }
  });

  proc.stderr.on('data', (data) => {
    // ignore pseudo-terminal messages
  });

  proc.on('close', (code) => {
    console.log(`[Tunnel] Process exited (code ${code}). Reconnecting in 3s...`);
    setTimeout(startTunnel, 3000);
  });
}

startTunnel();
