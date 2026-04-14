import { RequestHandler } from "express";
import Stripe from "stripe";
import { z } from "zod";
import type {
  BillingPlanId,
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
} from "@shared/api";

const checkoutRequestSchema = z.object({
  plan: z.enum(["pro_monthly", "lifetime"]),
  customerEmail: z.string().email().optional(),
});

const planPriceMap: Record<BillingPlanId, string | undefined> = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  lifetime: process.env.STRIPE_PRICE_LIFETIME,
};

function getBaseUrl(req: Parameters<RequestHandler>[0]) {
  const origin = req.headers.origin;
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

  const baseUrl = getBaseUrl(req);
  const successUrl =
    process.env.STRIPE_SUCCESS_URL ??
    `${baseUrl}/pricing?checkout=success&plan=${payload.plan}`;
  const cancelUrl =
    process.env.STRIPE_CANCEL_URL ??
    `${baseUrl}/pricing?checkout=cancelled&plan=${payload.plan}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: payload.plan === "pro_monthly" ? "subscription" : "payment",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: payload.customerEmail,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: {
        product_plan: payload.plan,
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
