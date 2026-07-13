import { NextResponse } from 'next/server';
import { verifyAlipayNotification } from '@/lib/payments/alipay';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    const valid = await verifyAlipayNotification(params);
    if (!valid) {
      return new NextResponse('failure', { status: 200 });
    }

    const tradeStatus = params['trade_status'];
    const outTradeNo = params['out_trade_no'];

    if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
      await prisma.order.updateMany({
        where: { paymentId: outTradeNo },
        data: { status: 'PAID', paymentId: params['trade_no'] },
      });

      const order = await prisma.order.findFirst({ where: { paymentId: outTradeNo } });
      if (order) {
        await prisma.product.update({ where: { id: order.productId }, data: { stock: { decrement: 1 } } });
      }
    } else if (tradeStatus === 'TRADE_CLOSED') {
      await prisma.order.updateMany({
        where: { paymentId: outTradeNo },
        data: { status: 'CANCELLED' },
      });
    }

    return new NextResponse('success', { status: 200 });
  } catch (error) {
    console.error('Alipay webhook error:', error);
    return new NextResponse('failure', { status: 200 });
  }
}
