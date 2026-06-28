import Layout from "@/components/Layout";
import NewHeroSection from "@/components/NewHeroSection";
import CoreFeaturesSection from "@/components/CoreFeaturesSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";

export default function Index() {
  return (
    <Layout>
      <NewHeroSection />
      <CoreFeaturesSection />
      <PricingSection />
      <FAQSection />
    </Layout>
  );
}
