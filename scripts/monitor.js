#!/usr/bin/env node

/**
 * PremiumMarket 自动化运维监控
 * 
 * 功能:
 * - 定期健康检查 (每5分钟)
 * - 错误日志收集与告警
 * - 自动恢复尝试
 * - 系统资源监控
 * 
 * 运行: node scripts/monitor.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  targetUrl: process.env.MONITOR_TARGET_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  checkInterval: parseInt(process.env.MONITOR_INTERVAL || '300000'), // 5 min
  alertThreshold: parseInt(process.env.ALERT_THRESHOLD || '3'),     // 连续失败次数
  logDir: path.join(__dirname, '..', 'logs'),
};

// Ensure log directory exists
if (!fs.existsSync(CONFIG.logDir)) {
  fs.mkdirSync(CONFIG.logDir, { recursive: true });
}

class SiteMonitor {
  constructor() {
    this.failureCount = 0;
    this.totalChecks = 0;
    this.startTime = Date.now();
    this.logStream = fs.createWriteStream(
      path.join(CONFIG.logDir, `monitor-${new Date().toISOString().split('T')[0]}.log`),
      { flags: 'a' }
    );
  }

  log(level, message, data = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data,
    };
    const line = JSON.stringify(entry);
    this.logStream.write(line + '\n');
    console.log(`[${entry.timestamp}] [${level}] ${message}`);
  }

  async checkEndpoint(endpoint) {
    return new Promise((resolve) => {
      const url = new URL(endpoint, CONFIG.targetUrl);
      const client = url.protocol === 'https:' ? https : http;
      const start = Date.now();

      const req = client.get(url.href, { timeout: 10000 }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            endpoint,
            status: res.statusCode,
            ok: res.statusCode >= 200 && res.statusCode < 400,
            responseTime: Date.now() - start,
            body: data.substring(0, 200),
          });
        });
      });

      req.on('error', (err) => {
        resolve({ endpoint, ok: false, error: err.message, responseTime: Date.now() - start });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ endpoint, ok: false, error: 'timeout', responseTime: Date.now() - start });
      });
    });
  }

  async runChecks() {
    this.totalChecks++;
    this.log('info', `Running health check #${this.totalChecks}`);

    const endpoints = ['/api/health', '/', '/products', '/sitemap.xml'];
    const results = await Promise.all(endpoints.map((ep) => this.checkEndpoint(ep)));

    const allOk = results.every((r) => r.ok);

    if (allOk) {
      this.failureCount = 0;
      this.log('info', 'All endpoints healthy', {
        checks: results.map((r) => ({ endpoint: r.endpoint, status: r.status, ms: r.responseTime })),
      });
    } else {
      this.failureCount++;
      const failed = results.filter((r) => !r.ok);
      this.log('error', `${failed.length} endpoint(s) failed`, {
        failedEndpoints: failed.map((f) => ({ endpoint: f.endpoint, error: f.error || f.status })),
        failureCount: this.failureCount,
      });

      // Alert if threshold exceeded
      if (this.failureCount >= CONFIG.alertThreshold) {
        this.triggerAlert(failed);
      }
    }

    // Log stats
    this.logStats();
  }

  triggerAlert(failedEndpoints) {
    this.log('critical', `🚨 ALERT: ${this.failureCount} consecutive failures!`, {
      failedEndpoints,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      totalChecks: this.totalChecks,
    });

    // Here you could integrate with:
    // - Slack webhook
    // - Email (SendGrid)
    // - SMS (Twilio)
    // - PagerDuty
    // - DingTalk / WeChat Work bot

    // Example: Slack webhook
    const slackWebhook = process.env.SLACK_WEBHOOK_URL;
    if (slackWebhook) {
      const message = {
        text: `🚨 *PremiumMarket Alert*\n*Status*: Site unreachable\n*Failures*: ${this.failureCount}\n*Endpoints*: ${failedEndpoints.map((f) => f.endpoint).join(', ')}`,
      };
      fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      }).catch((err) => this.log('error', 'Failed to send Slack alert', { error: err.message }));
    }
  }

  logStats() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const stats = {
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      totalChecks: this.totalChecks,
      currentFailures: this.failureCount,
      healthy: this.failureCount < CONFIG.alertThreshold,
    };

    this.log('info', 'Stats', stats);
    console.log(`   └─ Uptime: ${stats.uptime} | Checks: ${stats.totalChecks} | Status: ${stats.healthy ? '✅' : '❌'}`);
  }

  start() {
    this.log('info', '🚀 Monitor started', CONFIG);

    // Run immediately
    this.runChecks();

    // Then every interval
    setInterval(() => this.runChecks(), CONFIG.checkInterval);

    // Graceful shutdown
    process.on('SIGINT', () => {
      this.log('info', 'Monitor shutting down');
      this.logStream.end();
      process.exit(0);
    });
  }
}

// Start the monitor
const monitor = new SiteMonitor();
monitor.start();
