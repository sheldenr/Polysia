# Polysia

Polysia is an adaptive Chinese learning web app. It helps learners study vocabulary and reading with spaced repetition and AI-assisted practice, focusing on words they actually want to learn.

This project is a full-stack TypeScript app with a React frontend and an Express backend.

## Stripe billing setup

Add these environment variables to enable Checkout from the pricing page:

```env
STRIPE_SECRET_KEY=sk_live_or_test_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_LIFETIME=price_...
# Optional overrides:
STRIPE_SUCCESS_URL=https://your-domain.com/pricing?checkout=success
STRIPE_CANCEL_URL=https://your-domain.com/pricing?checkout=cancelled
```
