import { Sparkles, Zap, Heart, ArrowRight } from 'lucide-react';

const worldCards = [
  {
    number: '01',
    title: 'One item.\nOne story.',
    blurb: 'Unique collectibles. One-of-one items with verified provenance.',
    cta: 'Explore Unique',
    bg: 'bg-tint-salmon',
    foot: 'bg-tint-periwinkle',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    number: '02',
    title: 'Limited\ndrops.',
    blurb: 'Limited quantities. Exclusive releases. Finite forever.',
    cta: 'Shop Drops',
    bg: 'bg-tint-peach',
    foot: 'bg-tint-olive',
    icon: <Zap className="h-5 w-5" />,
  },
  {
    number: '03',
    title: 'Digital\ncreations.',
    blurb: 'Digital art, music, 3D, and more from independent creators.',
    cta: 'Explore Art',
    bg: 'bg-tint-sky',
    foot: 'bg-tint-lime',
    titleAccent: true,
    icon: <Heart className="h-5 w-5" />,
  },
];

export default function ThreeWorldsSection() {
  return (
    <section className="mx-auto max-w-[1800px] px-6 py-20">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight">
            Three Worlds.
            <br />
            Endless Stories.
          </h2>
          <p className="mt-6 text-sm font-medium">What will you collect?</p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground font-serif">
            Discover rare collectibles, limited editions, and digital art from
            creators and collectors around the globe.
          </p>
        </div>
        {worldCards.map((c) => (
          <div key={c.number} className="overflow-hidden border border-border bg-card">
            <div className={`${c.bg} relative flex min-h-[280px] flex-col p-5`}>
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold">{c.number}</span>
                {c.icon}
              </div>
              <h3
                className={`mt-4 whitespace-pre-line font-display text-3xl font-bold leading-tight ${
                  c.titleAccent ? 'text-primary' : ''
                }`}
              >
                {c.title}
              </h3>
              <p className="mt-3 text-xs text-foreground/70 font-serif">{c.blurb}</p>
            </div>
            <div className={`${c.foot} px-5 py-3`}>
              <a
                href="#"
                className="flex items-center justify-between text-xs font-bold text-white"
              >
                {c.cta} <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
