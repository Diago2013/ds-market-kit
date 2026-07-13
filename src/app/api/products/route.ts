import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = { published: true };

    if (category) where.category = category;
    if (featured === 'true') where.featured = true;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: where as any,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where: where as any }),
    ]);

    return NextResponse.json({
      products: products.map((p) => ({
        ...p,
        priceFormatted: formatPrice(p.price, p.currency),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ error: '获取商品列表失败' }, { status: 500 });
  }
}

function formatPrice(cents: number, currency: string): string {
  const amount = cents / 100;
  if (currency === 'cny') return `¥${amount.toFixed(2)}`;
  if (currency === 'usd') return `$${amount.toFixed(2)}`;
  return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
}
