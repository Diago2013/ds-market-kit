import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/middleware';

export const GET = withAdmin(async (_req, context) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalOrders,
    totalRevenue,
    recentOrders,
    recentSignups,
    ordersByStatus,
    topProducts,
    dailyRevenue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: { in: ['PAID', 'COMPLETED'] } },
      _sum: { amount: true },
    }),
    prisma.order.findMany({
      include: { user: { select: { name: true, email: true } }, product: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.order.groupBy({
      by: ['productId'],
      where: { status: { in: ['PAID', 'COMPLETED'] } },
      _count: true,
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10,
    }),
    // Daily revenue for last 30 days
    prisma.$queryRawUnsafe<Array<{ date: string; revenue: number; orders: number }>>(`
      SELECT 
        date("createdAt") as date,
        SUM(amount) as revenue,
        COUNT(*) as orders
      FROM "Order"
      WHERE status IN ('PAID', 'COMPLETED')
        AND "createdAt" >= datetime('now', '-30 days')
      GROUP BY date("createdAt")
      ORDER BY date ASC
    `),
  ]);

  // Get product names for top products
  const productIds = topProducts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p.name]));

  return NextResponse.json({
    overview: {
      totalUsers,
      totalOrders,
      totalRevenue: (totalRevenue._sum.amount || 0) / 100,
      recentSignups,
      conversionRate: totalUsers > 0 ? ((totalOrders / totalUsers) * 100).toFixed(1) : '0',
    },
    ordersByStatus: ordersByStatus.map((s) => ({
      status: s.status,
      count: s._count,
    })),
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      user: o.user,
      product: o.product,
      amount: o.amount / 100,
      status: o.status,
      createdAt: o.createdAt,
    })),
    topProducts: topProducts.map((p) => ({
      id: p.productId,
      name: productMap.get(p.productId) || '未知商品',
      sales: p._count,
      revenue: (p._sum.amount || 0) / 100,
    })),
    dailyRevenue: dailyRevenue.map((d) => ({
      date: d.date,
      revenue: Number(d.revenue) / 100,
      orders: Number(d.orders),
    })),
  });
});
