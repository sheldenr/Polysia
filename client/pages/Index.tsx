import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import CharacterScroller from "@/components/CharacterScroller";
import WhyChooseSection from "@/components/WhyChooseSection";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";

export default function Index() {
  return (
    <Layout>
      <HeroSection />
      <CharacterScroller />
      <WhyChooseSection />
      <FeaturesSection />
      <PricingSection />
      <FAQSection />
    </Layout>
  );
}
