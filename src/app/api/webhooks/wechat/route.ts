import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const xmlBody = await req.text();

    // Parse XML to get params
    const getXmlValue = (xml: string, tag: string): string => {
      const match = xml.match(new RegExp(`<${tag}>([^<]+)</${tag}>`));
      return match ? match[1] : '';
    };

    const resultCode = getXmlValue(xmlBody, 'result_code');
    const outTradeNo = getXmlValue(xmlBody, 'out_trade_no');
    const transactionId = getXmlValue(xmlBody, 'transaction_id');

    if (resultCode === 'SUCCESS') {
      await prisma.order.updateMany({
        where: { paymentId: outTradeNo },
        data: { status: 'PAID', paymentId: transactionId },
      });

      const order = await prisma.order.findFirst({ where: { paymentId: outTradeNo } });
      if (order) {
        await prisma.product.update({ where: { id: order.productId }, data: { stock: { decrement: 1 } } });
      }
    }

    // Return success XML to WeChat
    const responseXml = `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`;
    return new NextResponse(responseXml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('WeChat webhook error:', error);
    const errorXml = `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[Error]]></return_msg></xml>`;
    return new NextResponse(errorXml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
