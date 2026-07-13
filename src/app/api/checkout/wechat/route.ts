import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { createWechatNativeOrder } from '@/lib/payments/wechat';

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { productId } = await req.json();
    const result = await createWechatNativeOrder(session.userId, productId);

    if (!result.success) {
      return NextResponse.json({ error: result.error || '创建微信支付订单失败' }, { status: 400 });
    }

    return NextResponse.json({
      codeUrl: result.codeUrl,
      orderNumber: result.orderNumber,
      prepayId: result.prepayId,
    });
  } catch (error) {
    console.error('WeChat checkout error:', error);
    return NextResponse.json({ error: '创建微信支付订单异常' }, { status: 500 });
  }
}
