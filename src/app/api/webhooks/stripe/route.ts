import { NextResponse } from 'next/server';
import { handleStripeWebhook } from '@/lib/payments/stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';
  const success = await handleStripeWebhook(body, signature);

  if (!success) {
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 });
  }

  return NextResponse.json({ received: true });
}
