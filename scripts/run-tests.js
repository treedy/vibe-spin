#!/usr/bin/env node
const { spawnSync } = require('child_process');

const order = process.env.TEST_ORDER || 'unit-first';

function run(cmd) {
  console.log(`\n> ${cmd}\n`);
  const res = spawnSync(cmd, { stdio: 'inherit', shell: true, env: process.env });
  if (res.status !== 0) process.exit(res.status);
}

if (order === 'e2e-first') {
  run('pnpm run test:e2e');
  run('pnpm run test:unit');
} else {
  run('pnpm run test:unit');
  run('pnpm run test:e2e');
}
