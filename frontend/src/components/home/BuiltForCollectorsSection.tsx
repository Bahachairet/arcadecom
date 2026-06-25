import { Link } from 'react-router-dom';
import { Users, Sparkles, Heart, ArrowRight } from 'lucide-react';

export default function BuiltForCollectorsSection() {
  return (
    <section className="mx-auto max-w-[1800px] px-6 pb-20">
      <div className="relative overflow-hidden border border-border bg-primary p-10 text-primary-foreground">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight">
              Built for
              <br />
              collectors.
            </h2>
            <p className="mt-5 max-w-sm text-sm text-white/80 font-serif">
              VaultX is more than a marketplace. It's a culture-powered
              ecosystem for collectors, creators, and dreamers.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-1 text-sm font-bold"
            >
              Learn how it works <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-center">
            <div className="border border-white/20 bg-white/10 p-4">
              <Users className="h-5 w-5 text-white/80" />
              <p className="mt-2 text-sm font-bold">Creators</p>
              <p className="text-xs text-white/60">Build and release</p>
            </div>
            <div className="border-2 border-white bg-white p-4 text-foreground">
              <Sparkles className="h-5 w-5" />
              <p className="mt-2 text-sm font-bold">VaultX</p>
              <p className="text-xs text-muted-foreground">The hub for culture and value</p>
            </div>
            <div className="border border-white/20 bg-white/10 p-4">
              <Heart className="h-5 w-5 text-white/80" />
              <p className="mt-2 text-sm font-bold">Community</p>
              <p className="text-xs text-white/60">Connect and grow</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
