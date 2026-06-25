import { Link } from 'react-router-dom';

interface CTASectionProps {
  stats: {
    products: string;
    sellers: string;
    collectors: string;
    volume: string;
  };
}

export default function CTASection({ stats }: CTASectionProps) {
  return (
    <section className="mx-auto max-w-[1800px] px-6 pb-16">
      <div className="relative overflow-hidden border border-border bg-primary p-10 text-primary-foreground">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1.2fr_1fr]">
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight">
              Ready to
              <br />
              join the
              <br />
              vault?
            </h2>
          </div>
          <div>
            <p className="max-w-md text-sm text-white/80 font-serif">
              Create your profile, build your collection, and become part of
              the culture. Every item has a story. What's yours?
            </p>
            <div className="my-6 flex gap-3">
              <Link
                to="/register"
                className="bg-ink px-6 py-3 text-sm font-bold text-canvas"
              >
                Sign up now
              </Link>
              <Link
                to="/products"
                className="border-2 border-ink bg-canvas px-6 py-3 text-sm font-bold text-ink"
              >
                Explore Marketplace
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-tint-salmon p-4">
              <p className="font-display text-2xl font-bold text-ink">{stats.products}</p>
              <p className="text-[11px] font-bold text-ink/70">Items</p>
            </div>
            <div className="bg-tint-sky p-4">
              <p className="font-display text-2xl font-bold text-ink">{stats.sellers}</p>
              <p className="text-[11px] font-bold text-ink/70">Creators</p>
            </div>
            <div className="bg-tint-lime p-4">
              <p className="font-display text-2xl font-bold text-ink">{stats.collectors}</p>
              <p className="text-[11px] font-bold text-ink/70">Collectors</p>
            </div>
            <div className="bg-tint-periwinkle p-4">
              <p className="font-display text-2xl font-bold text-ink">{stats.volume}</p>
              <p className="text-[11px] font-bold text-ink/70">Volume Traded</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
