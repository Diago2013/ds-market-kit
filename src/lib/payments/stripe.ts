import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10' as any,
});

export interface StripePaymentResult {
  success: boolean;
  sessionId: string;
  url: string | null;
  error?: string;
}

export async function createStripeCheckoutSession(
  userId: string,
  userEmail: string,
  productId: string
): Promise<StripePaymentResult> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.published) {
    return { success: false, sessionId: '', url: null, error: '商品未找到或已下架' };
  }

  if (product.stock <= 0) {
    return { success: false, sessionId: '', url: null, error: '商品库存不足' };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: product.currency === 'cny' ? 'cny' : 'usd',
            product_data: { name: product.name, description: product.description.substring(0, 250) },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}?cancelled=true`,
      metadata: { userId, productId: product.id } as any,
    } as any);

    // Create pending order
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    await prisma.order.create({
      data: {
        orderNumber,
        userId,
        productId: product.id,
        amount: product.price,
        currency: product.currency,
        status: 'PENDING',
        paymentMethod: 'stripe',
        paymentId: session.id,
      },
    });

    return { success: true, sessionId: session.id, url: session.url };
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return { success: false, sessionId: '', url: null, error: error.message || '创建支付失败' };
  }
}

export async function handleStripeWebhook(body: string, signature: string): Promise<boolean> {
  try {
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || '');

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await prisma.order.updateMany({
          where: { paymentId: session.id },
          data: { status: 'PAID' },
        });
        const order = await prisma.order.findFirst({ where: { paymentId: session.id } });
        if (order) {
          await prisma.product.update({ where: { id: order.productId }, data: { stock: { decrement: 1 } } });
          await prisma.analyticsEvent.create({
            data: { userId: order.userId, event: 'purchase', path: '/checkout', metadata: JSON.stringify({ sessionId: session.id, amount: session.amount_total }) },
          });
        }
        return true;
      }
      case 'checkout.session.expired': {
        const expired = event.data.object as Stripe.Checkout.Session;
        await prisma.order.updateMany({ where: { paymentId: expired.id }, data: { status: 'CANCELLED' } });
        return true;
      }
      default:
        return true;
    }
  } catch (err) {
    console.error('Stripe webhook error:', err);
    return false;
  }
}
