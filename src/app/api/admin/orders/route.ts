import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/middleware';

export const GET = withAdmin(async (req, context) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status');

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: where as any,
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where: where as any }),
  ]);

  return NextResponse.json({
    orders: orders.map((o) => ({ ...o, amountFormatted: `¥${(o.amount / 100).toFixed(2)}` })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const PATCH = withAdmin(async (req, context) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const { status } = await req.json();

  if (!id) {
    return NextResponse.json({ error: '订单 ID 不能为空' }, { status: 400 });
  }

  const validStatuses = ['PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: '无效的订单状态' }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(order);
});
