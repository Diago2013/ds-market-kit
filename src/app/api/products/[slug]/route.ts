import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
    });

    if (!product || !product.published) {
      return NextResponse.json({ error: '商品未找到' }, { status: 404 });
    }

    return NextResponse.json({
      ...product,
      priceFormatted: formatPrice(product.price, product.currency),
    });
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json({ error: '获取商品详情失败' }, { status: 500 });
  }
}

function formatPrice(cents: number, currency: string): string {
  const amount = cents / 100;
  if (currency === 'cny') return `¥${amount.toFixed(2)}`;
  if (currency === 'usd') return `$${amount.toFixed(2)}`;
  return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
}
