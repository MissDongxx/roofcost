#!/usr/bin/env node

/**
 * Post-install patch for @opennextjs/cloudflare
 * 
 * 1. Bypasses the "Node.js middleware is not currently supported" error.
 * 2. Fixes "TypeError: createRequire(undefined)" by adding a fallback for import.meta.url.
 */

const fs = require('fs');
const path = require('path');

function patchNodeMiddlewareCheck() {
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

  if (!fs.existsSync(buildFile)) {
    console.log('[patch-opennext] @opennextjs/cloudflare build file not found, skipping Node.js middleware patch.');
    return;
  }

  let content = fs.readFileSync(buildFile, 'utf8');
  const target = 'if (useNodeMiddleware(options))';
  const replacement = 'if (false /* patched: skip Node.js middleware check */ && useNodeMiddleware(options))';

  if (content.includes(replacement)) {
    console.log('[patch-opennext] Node.js middleware check already patched.');
  } else if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(buildFile, content, 'utf8');
    console.log('[patch-opennext] Successfully patched @opennextjs/cloudflare to skip Node.js middleware check.');
  } else {
    console.log('[patch-opennext] Node.js middleware target string not found.');
  }
}

function patchImportMetaUrl() {
  const nodeModulesDir = path.join(__dirname, '..', 'node_modules');
  const openNextDirs = [
    path.join(nodeModulesDir, '@opennextjs'),
    // Also check .pnpm for direct patching to be sure
    path.join(nodeModulesDir, '.pnpm')
  ];

  console.log('[patch-opennext] Searching for import.meta.url issues in @opennextjs...');

  const filesToPatch = [];

  function findFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      let isDirectory = entry.isDirectory();
      let isFile = entry.isFile();
      
      if (entry.isSymbolicLink()) {
        try {
          const stat = fs.statSync(fullPath);
          isDirectory = stat.isDirectory();
          isFile = stat.isFile();
        } catch (err) {
          // Dead symlink
          continue;
        }
      }

      if (isDirectory) {
        // Recurse if it's node_modules, an @opennextjs scope, or a pnpm package starting with @opennextjs
        if (entry.name === 'node_modules' || 
            entry.name === '@opennextjs' || 
            entry.name.startsWith('@opennextjs+') ||
            dir.includes('@opennextjs')) {
          findFiles(fullPath);
        }
      } else if (isFile && (entry.name.endsWith('.js') || entry.name.endsWith('.mjs'))) {
        // Only check files in @opennextjs context
        if (fullPath.includes('@opennextjs')) {
          filesToPatch.push(fullPath);
        }
      }
    }
  }

  openNextDirs.forEach(findFiles);

  let patchCount = 0;
  for (const file of filesToPatch) {
    try {
      let content = fs.readFileSync(file, 'utf8');
      let changed = false;

      // Patch createRequire(import.meta.url) and topLevelCreateRequire(import.meta.url)
      if (content.includes('CreateRequire(import.meta.url)')) {
        content = content.split('CreateRequire(import.meta.url)').join("CreateRequire(import.meta.url || 'file:///_index.js')");
        changed = true;
      }
      
      // Also catch lowercase createRequire if it exists
      if (content.includes('createRequire(import.meta.url)') && !content.includes('CreateRequire(import.meta.url ||')) {
        content = content.split('createRequire(import.meta.url)').join("createRequire(import.meta.url || 'file:///_index.js')");
        changed = true;
      }

      // Patch new URL('.', import.meta.url)
      if (content.includes("URL('.', import.meta.url)")) {
        content = content.split("URL('.', import.meta.url)").join("URL('.', import.meta.url || 'file:///_index.js')");
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        patchCount++;
      }
    } catch (err) {
      // Ignore errors for individual files
    }
  }

  console.log(`[patch-opennext] Successfully patched ${patchCount} files to add import.meta.url fallbacks.`);
}

try {
  patchNodeMiddlewareCheck();
  patchImportMetaUrl();
} catch (err) {
  console.error('[patch-opennext] Error applying patches:', err.message);
}
