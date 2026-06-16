import { RequestHandler } from "express";
import Stripe from "stripe";
import { supabaseAdmin } from "../lib/supabase-admin.js";

export const handleProfile: RequestHandler = async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    // 1. Get profile from database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return res.status(500).json({ success: false, message: "Error fetching profile" });
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    // 2. If we have a stripe_customer_id, sync with Stripe
    if (profile.stripe_customer_id) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      
      // List active subscriptions for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: "active",
        limit: 1,
      });

      const isStillActive = subscriptions.data.length > 0;
      const currentDbStatus = profile.subscription_status;
      const newStatus = isStillActive ? "active" : "inactive";

      // If status changed, update database
      if (currentDbStatus === "active" && !isStillActive) {
        await supabaseAdmin
          .from("profiles")
          .update({ subscription_status: "inactive" })
          .eq("id", userId);
        
        profile.subscription_status = "inactive";
        console.log(`[Stripe Sync] Deactivated subscription for user ${userId}`);
      } else if (currentDbStatus !== "active" && isStillActive) {
        await supabaseAdmin
          .from("profiles")
          .update({ subscription_status: "active" })
          .eq("id", userId);
        
        profile.subscription_status = "active";
        console.log(`[Stripe Sync] Reactivated subscription for user ${userId}`);
      }
    }

    return res.json({
      success: true,
      user: {
        id: userId,
        email: req.user?.email,
        createdAt: req.user?.created_at,
        metadata: req.user?.user_metadata,
      },
      profile: {
        streakDays: profile.streak_days,
        onboardingComplete: profile.onboarding_complete,
        subscriptionStatus: profile.subscription_status,
        subscriptionPlan: profile.subscription_plan,
        paymentBypassUntil: profile.payment_bypass_until,
      }
    });
  } catch (error) {
    console.error("Profile handler error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
