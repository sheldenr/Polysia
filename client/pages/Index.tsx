import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import CharacterScroller from "@/components/CharacterScroller";
import WhyChooseSection from "@/components/WhyChooseSection";
import FeaturesSection from "@/components/FeaturesSection";

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <HeroSection />

      {/* Character Scroller */}
      <CharacterScroller />

      {/* Why Choose Polysia Section */}
      <WhyChooseSection />

      {/* Features Section */}
      <FeaturesSection />
    </Layout>
  );
}
