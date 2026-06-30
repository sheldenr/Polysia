import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import CoreFeaturesSection from "@/components/CoreFeaturesSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";

export default function Index() {
  return (
    <Layout>
      <HeroSection />
      <CoreFeaturesSection />
      <PricingSection />
      <FAQSection />
    </Layout>
  );
}
