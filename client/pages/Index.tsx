import Layout from "@/components/Layout";
import NewHeroSection from "@/components/NewHeroSection";
import LandingFeaturesSection from "@/components/LandingFeaturesSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";

export default function Index() {
  return (
    <Layout>
      <NewHeroSection />
      <LandingFeaturesSection />
      <PricingSection />
      <FAQSection />
    </Layout>
  );
}
