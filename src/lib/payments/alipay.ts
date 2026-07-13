/**
 * 支付宝支付集成模块
 * 
 * 使用支付宝电脑网站支付接口 (alipay.trade.page.pay)
 * 文档: https://opendocs.alipay.com/open/270/105899
 * 
 * 注意: 本模块需要在支付宝开放平台注册应用并获取密钥
 * 测试环境可使用沙箱: https://open.alipay.com/platform/developerIndex.htm
 */

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export interface AlipayConfig {
  appId: string;
  privateKey: string;
  alipayPublicKey: string;
  gateway: string;
}

export interface AlipayPaymentResult {
  success: boolean;
  payUrl?: string;
  orderNumber?: string;
  error?: string;
}

function getConfig(): AlipayConfig {
  return {
    appId: process.env.ALIPAY_APP_ID || '',
    privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
    alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || '',
    gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
  };
}

function generateSign(params: Record<string, string>, privateKey: string): string {
  const sortedKeys = Object.keys(params).sort();
  const sortedParams = sortedKeys.map((key) => `${key}=${params[key]}`).join('&');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(sortedParams, 'utf8');
  return sign.sign(privateKey, 'base64');
}

export async function createAlipayOrder(
  userId: string,
  productId: string
): Promise<AlipayPaymentResult> {
  const config = getConfig();
  if (!config.appId || !config.privateKey) {
    return { success: false, error: '支付宝未配置，请在 .env 中设置 ALIPAY_APP_ID 和 ALIPAY_PRIVATE_KEY' };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.published) {
    return { success: false, error: '商品未找到或已下架' };
  }

  const orderNumber = `ALI-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const amount = (product.price / 100).toFixed(2);

  const bizContent = {
    out_trade_no: orderNumber,
    product_code: 'FAST_INSTANT_TRADE_PAY',
    total_amount: amount,
    subject: product.name,
    body: product.description.substring(0, 128),
  };

  const params: Record<string, string> = {
    app_id: config.appId,
    method: 'alipay.trade.page.pay',
    format: 'JSON',
    charset: 'utf-8',
    sign_type: 'RSA2',
    timestamp: new Date().toISOString().replace(/\.\d{3}Z/, '+08:00').replace('T', ' '),
    version: '1.0',
    biz_content: JSON.stringify(bizContent),
    notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/alipay`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders`,
  };

  params.sign = generateSign(params, config.privateKey);

  // Build the redirect URL
  const queryString = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  const payUrl = `${config.gateway}?${queryString}`;

  // Create pending order
  await prisma.order.create({
    data: {
      orderNumber,
      userId,
      productId: product.id,
      amount: product.price,
      currency: product.currency || 'cny',
      status: 'PENDING',
      paymentMethod: 'alipay',
      paymentId: orderNumber,
    },
  });

  return { success: true, payUrl, orderNumber };
}

export async function verifyAlipayNotification(params: Record<string, string>): Promise<boolean> {
  const config = getConfig();
  const { sign, sign_type, ...rest } = params;

  if (!sign) return false;

  const sortedKeys = Object.keys(rest).sort();
  const sortedParams = sortedKeys.map((key) => `${key}=${rest[key]}`).join('&');

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(sortedParams, 'utf8');
  return verifier.verify(config.alipayPublicKey, sign, 'base64');
}
