import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

export const GET = withAuth(async (_req, context) => {
  const orders = await prisma.order.findMany({
    where: { userId: context.userId },
    include: {
      product: { select: { name: true, slug: true, imageUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const totalStats = await prisma.order.aggregate({
    where: { userId: context.userId, status: { in: ['PAID', 'COMPLETED'] } },
    _sum: { amount: true },
    _count: true,
  });

  return NextResponse.json({
    recentOrders: orders.map((o) => ({
      ...o,
      amountFormatted: formatPrice(o.amount, o.currency),
    })),
    stats: {
      totalOrders: totalStats._count,
      totalSpent: (totalStats._sum.amount || 0) / 100,
    },
  });
});

function formatPrice(cents: number, currency: string): string {
  const amount = cents / 100;
  if (currency === 'cny') return `¥${amount.toFixed(2)}`;
  if (currency === 'usd') return `$${amount.toFixed(2)}`;
  return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
}
