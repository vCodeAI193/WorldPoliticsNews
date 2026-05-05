import Stripe from 'stripe';
import { prisma } from '../lib/prisma';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-04-10',
});

export async function createCheckoutSession(userId: string, userEmail: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  let customerId = user?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { userId },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PLUS_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.WEB_URL}/konto?upgraded=true`,
    cancel_url: `${process.env.WEB_URL}/preise?cancelled=true`,
    allow_promotion_codes: true,
    metadata: { userId },
  });

  if (!session.url) throw new Error('Keine Checkout-URL erhalten');
  return session.url;
}

export async function createPortalSession(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user?.stripeCustomerId) {
    throw new Error('Kein Stripe-Kunde gefunden');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.WEB_URL}/konto`,
  });

  return session.url;
}

export async function handleStripeWebhook(rawBody: Buffer, signature: string): Promise<void> {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    throw new Error('Stripe-Webhook-Signatur ungültig');
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId) {
        await prisma.user.update({ where: { id: userId }, data: { subscriptionTier: 'plus' } });
      }
      break;
    }

    case 'customer.subscription.deleted':
    case 'invoice.payment_failed': {
      const obj = event.data.object as Stripe.Subscription | Stripe.Invoice;
      const customerId =
        typeof obj.customer === 'string' ? obj.customer : obj.customer?.id;
      if (customerId) {
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { subscriptionTier: 'free' },
        });
      }
      break;
    }
  }
}
