import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, path, referrer, metadata } = body;

    if (!event) {
      return NextResponse.json({ error: '事件类型不能为空' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || '';

    await prisma.analyticsEvent.create({
      data: {
        event,
        path: path || '/',
        referrer: referrer || '',
        metadata: metadata ? JSON.stringify(metadata) : null,
        ip: ip.substring(0, 45),
        userAgent: userAgent.substring(0, 500),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Analytics should never break the page
    console.error('Analytics error:', error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7');
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [pageViews, uniqueVisitors, eventsByType, topPages] = await Promise.all([
      prisma.analyticsEvent.count({
        where: { event: 'page_view', createdAt: { gte: since } },
      }),
      prisma.analyticsEvent.groupBy({
        by: ['ip'],
        where: { event: 'page_view', createdAt: { gte: since } },
        _count: true,
      }),
      prisma.analyticsEvent.groupBy({
        by: ['event'],
        where: { createdAt: { gte: since } },
        _count: true,
      }),
      prisma.analyticsEvent.groupBy({
        by: ['path'],
        where: { event: 'page_view', createdAt: { gte: since } },
        _count: true,
        orderBy: { _count: { path: 'desc' } },
        take: 20,
      }),
    ]);

    return NextResponse.json({
      pageViews,
      uniqueVisitors: uniqueVisitors.length,
      eventsByType: eventsByType.map((e) => ({ event: e.event, count: e._count })),
      topPages: topPages.map((p) => ({ path: p.path, views: p._count })),
      period: `${days}天`,
    });
  } catch {
    return NextResponse.json({ error: '获取分析数据失败' }, { status: 500 });
  }
}
