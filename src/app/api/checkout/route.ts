import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { createStripeCheckoutSession } from '@/lib/payments/stripe';

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { productId } = await req.json();
    const result = await createStripeCheckoutSession(session.userId, session.email, productId);

    if (!result.success) {
      return NextResponse.json({ error: result.error || '创建订单失败' }, { status: 400 });
    }

    return NextResponse.json({ url: result.url, sessionId: result.sessionId });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: '创建订单异常' }, { status: 500 });
  }
}
