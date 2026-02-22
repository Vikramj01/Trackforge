// Supabase Edge Function — stripe-webhook
// Receives Stripe webhook events and syncs subscription status to profiles.
// Deploy: supabase functions deploy stripe-webhook
//
// Required env vars:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET   (from Stripe Dashboard → Webhooks → signing secret)
//
// Register this URL in Stripe Dashboard:
//   https://<project-ref>.supabase.co/functions/v1/stripe-webhook
//
// Events to listen for:
//   customer.subscription.created
//   customer.subscription.updated
//   customer.subscription.deleted

import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Map Stripe price IDs to plan names
function priceIdToPlan(priceId: string): 'free' | 'pro' | 'agency' {
  const proId = Deno.env.get('STRIPE_PRICE_PRO') ?? '';
  const agencyId = Deno.env.get('STRIPE_PRICE_AGENCY') ?? '';
  if (priceId === proId) return 'pro';
  if (priceId === agencyId) return 'agency';
  return 'free';
}

Deno.serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${(err as Error).message}`, {
      status: 400,
    });
  }

  // Deduplicate: skip already-processed events
  const { data: existing } = await supabase
    .from('stripe_events')
    .select('id')
    .eq('event_id', event.id)
    .maybeSingle();

  if (existing) {
    return new Response('Already processed', { status: 200 });
  }

  // Record this event
  await supabase.from('stripe_events').insert({ event_id: event.id, type: event.type });

  const subscription = event.data.object as Stripe.Subscription;

  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const customerId = subscription.customer as string;
    const status = subscription.status; // active | trialing | past_due | canceled | ...
    const priceId = subscription.items.data[0]?.price.id ?? '';
    const plan = event.type === 'customer.subscription.deleted' ? 'free' : priceIdToPlan(priceId);

    const planStatus =
      event.type === 'customer.subscription.deleted'
        ? 'canceled'
        : (['active', 'trialing', 'past_due', 'canceled'].includes(status)
            ? status
            : 'active') as 'active' | 'trialing' | 'past_due' | 'canceled';

    const { error } = await supabase
      .from('profiles')
      .update({ plan, plan_status: planStatus })
      .eq('stripe_customer_id', customerId);

    if (error) {
      console.error('Failed to update profile:', error);
      return new Response('DB update failed', { status: 500 });
    }
  }

  return new Response('OK', { status: 200 });
});
