#!/usr/bin/env node

/**
 * Post-build patch for @opennextjs/cloudflare middleware handler.
 *
 * Problem: The middleware handler uses `fs.readFileSync` to load Next.js manifest
 * files at module init time. Cloudflare Workers don't support `fs.readFileSync`.
 *
 * Solution: Read the JSON manifest files and inline them directly into the
 * handler, replacing the fs-based load calls with static assignments.
 */

const fs = require('fs');
const path = require('path');

const MIDDLEWARE_DIR = path.join(__dirname, '..', '.open-next', 'middleware');
const HANDLER_FILE = path.join(MIDDLEWARE_DIR, 'handler.mjs');
const NEXT_DIR = path.join(MIDDLEWARE_DIR, '.next');

function readJsonSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function main() {
  if (!fs.existsSync(HANDLER_FILE)) {
    console.log('[patch-middleware] handler.mjs not found, skipping.');
    return;
  }

  let handler = fs.readFileSync(HANDLER_FILE, 'utf-8');

  // Read all the manifest files
  const requiredServerFiles = readJsonSafe(path.join(NEXT_DIR, 'required-server-files.json'));
  const buildId = readJsonSafe(path.join(NEXT_DIR, 'BUILD_ID'));
  const routesManifest = readJsonSafe(path.join(NEXT_DIR, 'routes-manifest.json'));
  const prerenderManifest = readJsonSafe(path.join(NEXT_DIR, 'prerender-manifest.json'));
  const appPathRoutesManifest = readJsonSafe(path.join(NEXT_DIR, 'app-path-routes-manifest.json'));

  // Read server directory manifests
  const pagesManifest = readJsonSafe(path.join(NEXT_DIR, 'server', 'pages-manifest.json'));
  const middlewareManifest = readJsonSafe(path.join(NEXT_DIR, 'server', 'middleware-manifest.json'));
  const functionsConfigManifest = readJsonSafe(path.join(NEXT_DIR, 'server', 'functions-config-manifest.json'));

  // Extract config from required-server-files.json
  let nextConfig = '{}';
  if (requiredServerFiles) {
    try {
      const parsed = JSON.parse(requiredServerFiles);
      nextConfig = JSON.stringify(parsed.config);
    } catch {
      console.error('[patch-middleware] Failed to parse required-server-files.json');
    }
  }

  const trimmedBuildId = buildId ? buildId.trim() : '';

  // Strategy: Replace the loadConfig/loadBuildId/etc function call results
  // with inlined JSON data.
  //
  // We replace the block:
  //   var NextConfig = /* @__PURE__ */ loadConfig(NEXT_DIR);
  //   var BuildId = /* @__PURE__ */ loadBuildId(NEXT_DIR);
  //   ...
  // with:
  //   var NextConfig = <inlined JSON>;
  //   var BuildId = <inlined string>;
  //   ...

  // Replace each loadXxx(NEXT_DIR) call with inlined data
  const replacements = [
    {
      pattern: /var NextConfig = \/\* @__PURE__ \*\/ loadConfig\(NEXT_DIR\);/,
      replacement: `var NextConfig = ${nextConfig};`,
    },
    {
      pattern: /var BuildId = \/\* @__PURE__ \*\/ loadBuildId\(NEXT_DIR\);/,
      replacement: `var BuildId = ${JSON.stringify(trimmedBuildId)};`,
    },
    {
      pattern: /var PagesManifest = \/\* @__PURE__ \*\/ loadPagesManifest\(NEXT_DIR\);/,
      replacement: `var PagesManifest = ${pagesManifest || '{}'};`,
    },
    {
      pattern: /var MiddlewareManifest = \/\* @__PURE__ \*\/ loadMiddlewareManifest\(NEXT_DIR\);/,
      replacement: `var MiddlewareManifest = ${middlewareManifest || '{}'};`,
    },
    {
      pattern: /var AppPathRoutesManifest = \/\* @__PURE__ \*\/ loadAppPathRoutesManifest\(NEXT_DIR\);/,
      replacement: `var AppPathRoutesManifest = ${appPathRoutesManifest || '{}'};`,
    },
    {
      pattern: /var FunctionsConfigManifest = \/\* @__PURE__ \*\/ loadFunctionsConfigManifest\(NEXT_DIR\);/,
      replacement: `var FunctionsConfigManifest = ${functionsConfigManifest || '{"functions":{},"version":1}'};`,
    },
  ];

  // Handle RoutesManifest specially — it has processing logic in loadRoutesManifest
  if (routesManifest) {
    try {
      const rm = JSON.parse(routesManifest);
      const _dataRoutes = rm.dataRoutes ?? [];
      const processedRoutesManifest = {
        basePath: rm.basePath,
        rewrites: Array.isArray(rm.rewrites)
          ? { beforeFiles: [], afterFiles: rm.rewrites, fallback: [] }
          : {
              beforeFiles: rm.rewrites?.beforeFiles ?? [],
              afterFiles: rm.rewrites?.afterFiles ?? [],
              fallback: rm.rewrites?.fallback ?? [],
            },
        redirects: rm.redirects ?? [],
        routes: {
          static: rm.staticRoutes ?? [],
          dynamic: rm.dynamicRoutes ?? [],
          data: {
            static: _dataRoutes.filter((r) => r.routeKeys === undefined),
            dynamic: _dataRoutes.filter((r) => r.routeKeys !== undefined),
          },
        },
        locales: rm.i18n?.locales ?? [],
      };
      replacements.push({
        pattern: /var RoutesManifest = \/\* @__PURE__ \*\/ loadRoutesManifest\(NEXT_DIR\);/,
        replacement: `var RoutesManifest = ${JSON.stringify(processedRoutesManifest)};`,
      });
    } catch {
      console.error('[patch-middleware] Failed to parse routes-manifest.json');
    }
  }

  // Handle ConfigHeaders
  if (routesManifest) {
    try {
      const rm = JSON.parse(routesManifest);
      replacements.push({
        pattern: /var ConfigHeaders = \/\* @__PURE__ \*\/ loadConfigHeaders\(NEXT_DIR\);/,
        replacement: `var ConfigHeaders = ${JSON.stringify(rm.headers ?? [])};`,
      });
    } catch {
      // Already logged above
    }
  }

  // Handle PrerenderManifest
  if (prerenderManifest) {
    replacements.push({
      pattern: /var PrerenderManifest = \/\* @__PURE__ \*\/ loadPrerenderManifest\(NEXT_DIR\);/,
      replacement: `var PrerenderManifest = ${prerenderManifest};`,
    });
  }

  let patchCount = 0;
  for (const { pattern, replacement } of replacements) {
    if (pattern.test(handler)) {
      handler = handler.replace(pattern, replacement);
      patchCount++;
    }
  }

  if (patchCount > 0) {
    fs.writeFileSync(HANDLER_FILE, handler, 'utf8');
    console.log(`[patch-middleware] Successfully inlined ${patchCount} manifest(s) into middleware handler.`);
  } else {
    console.log('[patch-middleware] No patterns matched — handler may already be patched or structure changed.');
  }
}

try {
  main();
} catch (err) {
  console.error('[patch-middleware] Error:', err.message);
  process.exit(1);
}
