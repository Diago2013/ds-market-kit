import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

export const GET = withAuth(async (req, context) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const where = { userId: context.userId };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        product: {
          select: { name: true, slug: true, imageUrl: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    orders: orders.map((o) => ({
      ...o,
      amountFormatted: formatPrice(o.amount, o.currency),
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

function formatPrice(cents: number, currency: string): string {
  const amount = cents / 100;
  if (currency === 'cny') return `¥${amount.toFixed(2)}`;
  if (currency === 'usd') return `$${amount.toFixed(2)}`;
  return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
}
