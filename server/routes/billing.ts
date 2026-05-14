import { RequestHandler } from "express";
import Stripe from "stripe";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase-admin.js";
import type {
  BillingPlanId,
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
} from "../../shared/api";

const checkoutRequestSchema = z.object({
  plan: z.enum(["pro_monthly", "lifetime"]),
  customerEmail: z.string().email().optional(),
});

const planPriceMap: Record<BillingPlanId, string | undefined> = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  lifetime: process.env.STRIPE_PRICE_LIFETIME,
};

type RequestLike = {
  headers: Record<string, string | string[] | undefined>;
  get(name: string): string | undefined;
  protocol?: string;
};

function getBaseUrl(req: RequestLike) {
  const rawOrigin = req.headers.origin;
  const origin = Array.isArray(rawOrigin) ? rawOrigin[0] : rawOrigin;
  if (origin && /^https?:\/\//i.test(origin)) {
    return origin;
  }

  const host = req.get("host");
  const protocol = req.protocol || "https";
  return host ? `${protocol}://${host}` : "http://localhost:8080";
}

export const handleCreateCheckoutSession: RequestHandler = async (req, res) => {
  const parsed = checkoutRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.errors[0]?.message ?? "Invalid checkout payload.",
    });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({
      error: "Stripe is not configured. Add STRIPE_SECRET_KEY.",
    });
  }

  const stripe = new Stripe(secretKey);
  const payload = parsed.data as CreateCheckoutSessionRequest;
  const priceId = planPriceMap[payload.plan];

  if (!priceId) {
    return res.status(500).json({
      error:
        payload.plan === "pro_monthly"
          ? "Missing STRIPE_PRICE_PRO_MONTHLY."
          : "Missing STRIPE_PRICE_LIFETIME.",
    });
  }

  const baseUrl = getBaseUrl(req as unknown as RequestLike);
  const successUrl =
    process.env.STRIPE_SUCCESS_URL ??
    `${baseUrl}/onboarding?checkout=success&plan=${payload.plan}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl =
    process.env.STRIPE_CANCEL_URL ??
    `${baseUrl}/onboarding?checkout=cancelled&plan=${payload.plan}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: payload.plan === "pro_monthly" ? "subscription" : "payment",
      client_reference_id: req.userId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: payload.plan === "pro_monthly" ? {
        trial_period_days: 7,
      } : undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: payload.customerEmail,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: {
        product_plan: payload.plan,
        user_id: req.userId ?? "",
      },
    });

    if (!session.url) {
      return res.status(502).json({
        error: "Stripe did not return a checkout URL.",
      });
    }

    const response: CreateCheckoutSessionResponse = {
      checkoutUrl: session.url,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({
      error: "Unable to start checkout right now.",
    });
  }
};

export const handleStripeWebhook: RequestHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).send("Webhook Secret or Signature missing.");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id || session.metadata?.user_id;
    const plan = session.metadata?.product_plan;

    if (!userId) {
      console.error("[Stripe Webhook] No userId found in session.");
      return res.status(400).send("No userId found.");
    }

    if (!supabaseAdmin) {
      console.error("[Stripe Webhook] Supabase Admin client not initialized.");
      return res.status(500).send("Server configuration error.");
    }

    // Update profile in database
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        subscription_status: "active",
        subscription_plan: plan,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("[Stripe Webhook] Error updating profile:", error);
      return res.status(500).send("Database update failed.");
    }

    console.log(`[Stripe Webhook] Successfully updated subscription for user ${userId}`);
  }

  res.json({ received: true });
};

const verifySessionSchema = z.object({
  sessionId: z.string().min(1),
});

export const handleVerifyCheckoutSession: RequestHandler = async (req, res) => {
  const parsed = verifySessionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: "Stripe is not configured." });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Server is not configured for billing verification." });
  }

  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const stripe = new Stripe(secretKey);

  try {
    const session = await stripe.checkout.sessions.retrieve(parsed.data.sessionId);

    const sessionUserId = session.client_reference_id || session.metadata?.user_id;
    if (sessionUserId !== userId) {
      return res.status(403).json({ error: "Session does not belong to this user." });
    }

    const isPaid = session.payment_status === "paid" || session.status === "complete";
    if (!isPaid) {
      return res.status(200).json({ verified: false });
    }

    const plan = session.metadata?.product_plan;
    const subscriptionStatus =
      session.mode === "subscription" ? "trialing" : "active";

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        subscription_status: subscriptionStatus,
        subscription_plan: plan,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("[Verify Session] DB update failed:", error);
      return res.status(500).json({ error: "Failed to update profile." });
    }

    return res.status(200).json({ verified: true, subscriptionStatus });
  } catch (err) {
    console.error("[Verify Session] Error:", err);
    return res.status(500).json({ error: "Unable to verify session." });
  }
};
