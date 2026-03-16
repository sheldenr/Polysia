import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import CharacterScroller from "@/components/CharacterScroller";
import WhyChooseSection from "@/components/WhyChooseSection";
import FeaturesSection from "@/components/FeaturesSection";

export default function Index() {
  return (
    <Layout>
      <HeroSection />
      <CharacterScroller />
      <WhyChooseSection />
      <FeaturesSection />
    </Layout>
  );
}
