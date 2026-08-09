module.exports = { apps: [
  { name: 'terranova-web', script: 'node_modules/next/dist/bin/next', args: 'start -p 3100', cwd: require('path').join(__dirname, '../frontend'), autorestart: true, time: true, max_memory_restart: '400M', env: { NODE_ENV: 'production' } },
  { name: 'terranova-api', script: 'dist/main.js', cwd: __dirname, autorestart: true, time: true, max_memory_restart: '300M', env: { NODE_ENV: 'production' } },
  { name: 'terranova-worker', script: 'dist/worker.js', cwd: __dirname, instances: 1, autorestart: true, time: true, max_memory_restart: '250M', env: { NODE_ENV: 'production', WORKER_PROCESS: 'true' } }
] };
