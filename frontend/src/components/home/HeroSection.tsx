import { Link } from 'react-router-dom';
import heroCollage from '@/assets/hero-collage.jpg';

interface HeroSectionProps {
  stats: { products: string };
}

export default function HeroSection({ stats }: HeroSectionProps) {
  return (
    <section className="mx-auto max-w-[1800px] px-6 pb-8 pt-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-4">
        <div className="pt-6">
          <p className="mb-6 text-xs font-semibold tracking-[0.2em] text-muted-foreground">
            COLLECT · TRADE · OWN
          </p>
          <h1 className="glitch-container font-display text-6xl font-bold leading-[0.95] sm:text-7xl">
            <span className="glitch-text" data-text="One Item.">One Item.</span>
            <br />
            <span className="glitch-text text-primary" data-text="One Story.">One Story.</span>
          </h1>
          <p className="mt-6 max-w-md font-serif text-base text-muted-foreground leading-relaxed">
            VaultX is a next-generation marketplace for unique collectibles, limited drops,
            and digital creations. Every item is verified. Every story is real.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Link
              to="/products"
              className="rounded-md bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Explore Marketplace
            </Link>
            <Link
              to="/register"
              className="rounded-md border border-border bg-background px-6 py-3 text-sm font-bold hover:bg-muted transition-colors"
            >
              Start Collecting
            </Link>
          </div>
        </div>

        <div className="relative">
          <img
            src={heroCollage}
            alt="Collectibles collage"
            className="w-full object-contain"
            width={1280}
            height={1024}
          />
          <div className="pointer-events-none absolute -bottom-4 right-0 w-44 border border-border bg-card p-4">
            <p className="text-[10px] font-bold tracking-wider text-muted-foreground">
              TOTAL ITEMS
            </p>
            <p className="mt-1 font-display text-3xl font-bold">{stats.products}</p>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </div>
        </div>
      </div>
    </section>
  );
}
