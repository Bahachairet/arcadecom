import { Search, Shield, Zap } from 'lucide-react';

const steps = [
  {
    icon: <Search className="h-5 w-5" />,
    title: 'Discover',
    desc: 'Browse unique collectibles, limited drops, and digital art from creators worldwide.',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Verify',
    desc: 'Every item is verified for authenticity. Provenance is guaranteed on-chain.',
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Collect',
    desc: 'Buy outright or bid in auctions. Build a collection that\'s uniquely yours.',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-[1800px] px-6 pb-20">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div>
          <h2 className="font-display text-4xl font-bold">How It Works</h2>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground font-serif">
            From discovery to delivery, every step is designed for collectors.
          </p>
        </div>
        {steps.map((step, i) => (
          <div key={i} className="border border-border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center border border-border bg-muted">
              {step.icon}
            </div>
            <h3 className="mt-4 font-sans text-sm font-bold uppercase">{step.title}</h3>
            <p className="mt-2 text-xs text-muted-foreground font-serif leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
