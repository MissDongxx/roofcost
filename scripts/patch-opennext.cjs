#!/usr/bin/env node

/**
 * Post-install patch for @opennextjs/cloudflare
 * 
 * Bypasses the "Node.js middleware is not currently supported" error.
 * Next.js 16 renames middleware.ts to proxy.ts and runs it on Node.js runtime only.
 * However, the proxy.ts code in this project uses only Web APIs (NextRequest,
 * NextResponse, cookies, URL) that are fully compatible with Cloudflare Workers.
 * 
 * This patch can be removed once @opennextjs/cloudflare adds Node.js middleware support.
 * See: https://github.com/opennextjs/opennextjs-cloudflare/issues/617
 */

const fs = require('fs');
const path = require('path');

const buildFile = path.join(
  __dirname,
  '..',
  'node_modules',
  '@opennextjs',
  'cloudflare',
  'dist',
  'cli',
  'build',
  'build.js'
);

try {
  if (!fs.existsSync(buildFile)) {
    console.log('[patch-opennext] @opennextjs/cloudflare not found, skipping patch.');
    process.exit(0);
  }

  let content = fs.readFileSync(buildFile, 'utf8');
  const target = 'if (useNodeMiddleware(options))';
  const replacement = 'if (false /* patched: skip Node.js middleware check */ && useNodeMiddleware(options))';

  if (content.includes(replacement)) {
    console.log('[patch-opennext] Patch already applied, skipping.');
    process.exit(0);
  }

  if (!content.includes(target)) {
    console.log('[patch-opennext] Target string not found. The build file may have changed.');
    process.exit(0);
  }

  content = content.replace(target, replacement);
  fs.writeFileSync(buildFile, content, 'utf8');
  console.log('[patch-opennext] Successfully patched @opennextjs/cloudflare to skip Node.js middleware check.');
} catch (err) {
  console.error('[patch-opennext] Error applying patch:', err.message);
  process.exit(0); // Don't fail the install
}
