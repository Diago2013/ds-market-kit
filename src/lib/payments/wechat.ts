/**
 * 微信支付集成模块
 * 
 * 使用微信支付 Native 模式 (扫码支付)
 * 文档: https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_4_1.shtml
 * 
 * 注意: 需要在微信支付商户平台注册并获得商户号
 * 测试环境可使用: https://pay.weixin.qq.com/wiki/doc/api/micropay.php
 */

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export interface WechatPayConfig {
  appId: string;
  mchId: string;
  apiKey: string;
  certPath: string;
}

export interface WechatPayResult {
  success: boolean;
  codeUrl?: string; // Native 支付二维码链接
  orderNumber?: string;
  prepayId?: string;
  error?: string;
}

function getConfig(): WechatPayConfig {
  return {
    appId: process.env.WECHAT_APP_ID || '',
    mchId: process.env.WECHAT_MCH_ID || '',
    apiKey: process.env.WECHAT_API_KEY || '',
    certPath: process.env.WECHAT_CERT_PATH || '',
  };
}

function generateNonceStr(): string {
  return crypto.randomBytes(16).toString('hex');
}

function generateSign(params: Record<string, string>, apiKey: string): string {
  const sortedKeys = Object.keys(params).sort();
  const sortedStr = sortedKeys.map((key) => `${key}=${params[key]}`).join('&') + `&key=${apiKey}`;
  return crypto.createHash('md5').update(sortedStr, 'utf8').digest('hex').toUpperCase();
}

function buildXml(params: Record<string, string>): string {
  let xml = '<xml>';
  for (const [key, value] of Object.entries(params)) {
    xml += `<${key}>${value}</${key}>`;
  }
  xml += '</xml>';
  return xml;
}

export async function createWechatNativeOrder(
  userId: string,
  productId: string
): Promise<WechatPayResult> {
  const config = getConfig();
  if (!config.appId || !config.mchId || !config.apiKey) {
    return {
      success: false,
      error: '微信支付未配置，请在 .env 中设置 WECHAT_APP_ID、WECHAT_MCH_ID 和 WECHAT_API_KEY',
    };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.published) {
    return { success: false, error: '商品未找到或已下架' };
  }

  const orderNumber = `WX-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const amount = Math.round(product.price / 100).toString(); // 微信支付金额单位: 分
  const nonceStr = generateNonceStr();

  const params: Record<string, string> = {
    appid: config.appId,
    mch_id: config.mchId,
    nonce_str: nonceStr,
    body: product.name,
    out_trade_no: orderNumber,
    total_fee: amount,
    spbill_create_ip: '127.0.0.1',
    notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/wechat`,
    trade_type: 'NATIVE',
    product_id: product.id,
  };

  const sign = generateSign(params, config.apiKey);
  params.sign = sign;

  const xmlBody = buildXml(params);

  try {
    const response = await fetch('https://api.mch.weixin.qq.com/pay/unifiedorder', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: xmlBody,
    });

    const xmlResponse = await response.text();

    // Parse XML response (simplified)
    const codeUrlMatch = xmlResponse.match(/<code_url>(.*?)<\/code_url>/);
    const prepayIdMatch = xmlResponse.match(/<prepay_id>(.*?)<\/prepay_id>/);
    const resultCodeMatch = xmlResponse.match(/<result_code>(.*?)<\/result_code>/);
    const errCodeMatch = xmlResponse.match(/<err_code_des>(.*?)<\/err_code_des>/);

    if (resultCodeMatch?.[1] !== 'SUCCESS') {
      return { success: false, error: errCodeMatch?.[1] || '微信支付下单失败' };
    }

    // Create pending order
    await prisma.order.create({
      data: {
        orderNumber,
        userId,
        productId: product.id,
        amount: product.price,
        currency: product.currency || 'cny',
        status: 'PENDING',
        paymentMethod: 'wechat',
        paymentId: prepayIdMatch?.[1] || orderNumber,
      },
    });

    return {
      success: true,
      codeUrl: codeUrlMatch?.[1] || '',
      orderNumber,
      prepayId: prepayIdMatch?.[1],
    };
  } catch (error: any) {
    console.error('WeChat pay error:', error);
    return { success: false, error: error.message || '微信支付请求失败' };
  }
}

export function verifyWechatNotification(xmlBody: string, apiKey: string): boolean {
  const signMatch = xmlBody.match(/<sign>(.*?)<\/sign>/);
  if (!signMatch) return false;

  const receivedSign = signMatch[1];
  const params: Record<string, string> = {};

  // Extract all params from XML
  const paramRegex = /<(\w+)>([^<]+)<\/\1>/g;
  let match;
  while ((match = paramRegex.exec(xmlBody)) !== null) {
    if (match[1] !== 'sign') {
      params[match[1]] = match[2];
    }
  }

  const calculatedSign = generateSign(params, apiKey);
  return calculatedSign === receivedSign;
}
