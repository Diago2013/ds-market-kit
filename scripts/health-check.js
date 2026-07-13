#!/usr/bin/env node

/**
 * PremiumMarket 健康检查脚本
 * 
 * 用途: 定期检查网站运行状态
 * 运行方式: node scripts/health-check.js
 * 
 * 可集成到 cron / GitHub Actions / Vercel Cron
 */

const https = require('https');
const http = require('http');

const TARGET_URL = process.env.HEALTH_CHECK_URL || 'http://localhost:3000';
const TIMEOUT = 10000; // 10s
let exitCode = 0;

function check(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(endpoint, TARGET_URL);
    const client = url.protocol === 'https:' ? https : http;

    const req = client.get(url.href, { timeout: TIMEOUT }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const status = res.statusCode;
        let body = {};
        try { body = JSON.parse(data); } catch {}

        const result = {
          endpoint: url.pathname,
          status,
          ok: status >= 200 && status < 400,
          body: body.status || body.error || 'ok',
          timestamp: new Date().toISOString(),
        };

        if (result.ok) {
          console.log(`✅ ${url.pathname} → ${status} (${result.body})`);
        } else {
          console.error(`❌ ${url.pathname} → ${status} (${result.body})`);
          exitCode = 1;
        }

        resolve(result);
      });
    });

    req.on('error', (err) => {
      console.error(`❌ ${url.pathname} → ${err.message}`);
      exitCode = 1;
      resolve({ endpoint: url.pathname, ok: false, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      console.error(`❌ ${url.pathname} → TIMEOUT`);
      exitCode = 1;
      resolve({ endpoint: url.pathname, ok: false, error: 'timeout' });
    });
  });
}

async function run() {
  console.log(`\n🔍 PremiumMarket Health Check`);
  console.log(`   Target: ${TARGET_URL}`);
  console.log(`   Time:   ${new Date().toISOString()}\n`);

  // Check critical endpoints
  await check('/api/health');
  await check('/');
  await check('/products');
  await check('/robots.txt');
  await check('/sitemap.xml');

  console.log(`\n${exitCode === 0 ? '✅ All checks passed' : '❌ Some checks failed'}`);
  process.exit(exitCode);
}

run();
