import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    checks: {} as Record<string, string>,
  };

  try {
    // Database check
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = 'connected';
  } catch {
    health.checks.database = 'disconnected';
    health.status = 'degraded';
  }

  // Memory check
  const memoryUsage = process.memoryUsage();
  const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  health.checks.memory = `${memoryMB}MB used`;

  if (memoryMB > 500) {
    health.status = 'degraded';
  }

  health.checks.responseTime = `${Date.now() - startTime}ms`;

  const statusCode = health.status === 'healthy' ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
