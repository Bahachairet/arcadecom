import {
  HeroSection,
  ThreeWorldsSection,
  FeaturedItemsSection,
  BuiltForCollectorsSection,
  HowItWorksSection,
  CTASection,
} from '@/components/home';

const stats = {
  products: '25K+',
  sellers: '8K+',
  collectors: '120K+',
  volume: '$45M+',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <HeroSection stats={stats} />
      <ThreeWorldsSection />
      <FeaturedItemsSection />
      <BuiltForCollectorsSection />
      <HowItWorksSection />
      <CTASection stats={stats} />
    </div>
  );
}
