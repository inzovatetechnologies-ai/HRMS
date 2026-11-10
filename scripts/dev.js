const { spawn, fork } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const nextBin = path.join(rootDir, 'node_modules', 'next', 'dist', 'bin', 'next');
const cronScript = path.join(rootDir, 'scripts', 'cron_worker.js');

console.log('Starting Inzovate HRMS Server (Continuous Auto-Restart Engine & Autonomous Cron Worker)...');

let isShuttingDown = false;
let cronWorker = null;

function startCronWorker() {
  if (isShuttingDown) return;
  try {
    cronWorker = fork(cronScript, [], { cwd: rootDir });
    cronWorker.on('exit', (code) => {
      if (!isShuttingDown) {
        console.log(`Cron worker exited with code ${code}. Restarting in 5s...`);
        setTimeout(startCronWorker, 5000);
      }
    });
  } catch (err) {
    console.error('Failed to start cron worker:', err);
  }
}

function startServer() {
  if (isShuttingDown) return;

  const child = spawn(process.execPath, [nextBin, 'dev', '--turbo', '-p', '3000'], {
    stdio: 'inherit',
    env: process.env,
    cwd: rootDir,
  });

  child.on('exit', (code) => {
    if (!isShuttingDown) {
      console.log(`Next.js process exited with code ${code}. Restarting in 500ms...`);
      setTimeout(startServer, 500);
    }
  });

  process.on('SIGINT', () => {
    isShuttingDown = true;
    if (cronWorker) cronWorker.kill();
    child.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    isShuttingDown = true;
    if (cronWorker) cronWorker.kill();
    child.kill('SIGTERM');
    process.exit(0);
  });
}

startServer();
startCronWorker();
