import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import PricingSection from "@/components/PricingSection";

export default function Pricing() {
  const [searchParams] = useSearchParams();
  const checkoutState = searchParams.get("checkout");

  const notice = useMemo(() => {
    if (checkoutState === "success") {
      return {
        className:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        text: "Payment complete. Your account access will be updated shortly.",
      };
    }

    if (checkoutState === "cancelled") {
      return {
        className:
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        text: "Checkout was cancelled. You can try again at any time.",
      };
    }

    return null;
  }, [checkoutState]);

  return (
    <Layout>
      {notice ? (
        <section className="px-6 pt-8">
          <div className="mx-auto max-w-5xl">
            <div className={`rounded-2xl border px-4 py-3 text-sm ${notice.className}`}>
              {notice.text}
            </div>
          </div>
        </section>
      ) : null}
      <PricingSection />
    </Layout>
  );
}
