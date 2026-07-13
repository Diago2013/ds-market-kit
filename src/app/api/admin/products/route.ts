import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/middleware';
import { productSchema } from '@/lib/validations';

export const GET = withAdmin(async (req, context) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count(),
  ]);

  return NextResponse.json({ products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAdmin(async (req, context) => {
  try {
    const body = await req.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: '验证失败', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: validation.data,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Product create error:', error);
    return NextResponse.json({ error: '创建商品失败' }, { status: 500 });
  }
});
