import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  Users,
  Sparkles,
  Heart,
  Plus,
} from 'lucide-react';
import heroCollage from '@/assets/hero-collage.jpg';
import cardSamurai from '@/assets/card-samurai.jpg';
import cardCartridge from '@/assets/card-cartridge.jpg';
import cardDigital from '@/assets/card-digital.jpg';
import dropSamurai from '@/assets/drop-samurai.jpg';
import dropCartridge from '@/assets/drop-cartridge.jpg';
import dropNeon from '@/assets/drop-neon.jpg';
import dropBearbrick from '@/assets/drop-bearbrick.jpg';
import spotPixel from '@/assets/spot-pixel.jpg';
import spotRetro from '@/assets/spot-retro.jpg';
import spotToy from '@/assets/spot-toy.jpg';
import thumbBear from '@/assets/thumb-bear.jpg';

const activity = [
  { name: "Neo Tokyo #231", action: "Sold for", value: "2.45 ETH", time: "30s ago" },
  { name: "Golden Cartridge", action: "New bid", value: "1.20 ETH", time: "1m ago" },
  { name: "Street Fighter II CE", action: "Sold for", value: "$850", time: "2m ago" },
  { name: "Cyber Bearbrick 400%", action: "New bid", value: "0.95 ETH", time: "2m ago" },
];

const trending = [
  { name: "Cyber Samurai Figure", pct: "24%" },
  { name: "Neo Tokyo Art Print", pct: "18%" },
  { name: "Golden Cartridge", pct: "31%" },
  { name: "Vintage Cards Lot", pct: "12%" },
];

const cultureCards = [
  {
    n: "01",
    title: "One item.\nOne story.",
    blurb: "Unique collectibles.\nOne-of-one items\nwith verified provenance.",
    cta: "Explore Unique",
    bg: "bg-[oklch(0.92_0.06_300)]",
    foot: "bg-[oklch(0.55_0.24_290)]",
    img: cardSamurai,
  },
  {
    n: "02",
    title: "Limited\ndrops.",
    blurb: "Limited quantities.\nExclusive releases.\nFinite forever.",
    cta: "Shop Drops",
    bg: "bg-[oklch(0.96_0.04_95)]",
    foot: "bg-[oklch(0.85_0.18_92)]",
    img: cardCartridge,
  },
  {
    n: "03",
    title: "Digital\ncreations.",
    blurb: "Digital art, music,\n3D, and more from\nindependent creators.",
    cta: "Explore Art",
    bg: "bg-[oklch(0.95_0.03_250)]",
    foot: "bg-[oklch(0.78_0.13_305)]",
    img: cardDigital,
    titleAccent: true,
  },
];

const drops = [
  {
    tag: "NEW DROP",
    tagBg: "bg-[oklch(0.55_0.24_265)] text-white",
    title: "Cyber\nSamurai",
    sub: "1/1",
    label: "Current bid",
    price: "2.85 ETH",
    timer: "1d 4h left",
    img: dropSamurai,
    dark: true,
  },
  {
    tag: "LIMITED EDITION",
    tagBg: "bg-black text-white",
    title: "Golden\nCartridge",
    sub: "1/100 editions",
    label: "Price",
    price: "$199.00",
    timer: "Only 12 left",
    img: dropCartridge,
    bg: "bg-[oklch(0.88_0.18_92)]",
  },
  {
    tag: "DIGITAL ART",
    tagBg: "bg-[oklch(0.55_0.24_265)] text-white",
    title: "Neon\nDreams",
    sub: "3/3",
    label: "Price",
    price: "0.65 ETH",
    timer: "2d 11h left",
    img: dropNeon,
    dark: true,
  },
  {
    tag: "",
    title: "Bearbrick\n400%",
    sub: "255+ versions",
    label: "Price",
    price: "$950.00",
    timer: "Only 32 left",
    img: dropBearbrick,
  },
];

const spotlight = [
  { handle: "@pixel.nomad", role: "Digital Artist", img: spotPixel, bg: "bg-[oklch(0.88_0.18_148)]" },
  { handle: "@retro.hunter", role: "Vintage Collector", img: spotRetro, bg: "bg-[oklch(0.88_0.08_300)]" },
  { handle: "@toy.archivist", role: "Designer Toy Collector", img: spotToy, bg: "bg-[oklch(0.92_0.14_92)]" },
];

function FeatureBox({
  icon,
  title,
  desc,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl bg-white p-4 text-foreground ${highlight ? "translate-y-6 shadow-lg" : ""}`}
    >
      <div className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{desc}</p>
    </div>
  );
}

function Stat({ n, l, big }: { n: string; l: string; big?: boolean }) {
  return (
    <div className={big ? "col-span-3" : ""}>
      <p className="font-display text-2xl font-bold">{n}</p>
      <p className="text-xs text-white/60">{l}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Hero */}
      <section className="mx-auto max-w-[1800px] px-6 pb-8 pt-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-4">
          <div className="pt-6">
            <p className="mb-6 text-xs font-semibold tracking-[0.2em] text-muted-foreground">
              COLLECT · TRADE · OWN
            </p>
            <h1 className="font-display text-6xl font-bold leading-[0.95] sm:text-7xl">
              Collect
              <br />
              <span className="text-primary">What</span>
              <br />
              Defines
              <br />
              <span className="text-primary">You.</span>
            </h1>
            <p className="mt-6 max-w-md text-sm text-muted-foreground">
              A next-generation marketplace for unique collectibles, limited drops, and digital creations
              from creators worldwide.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link
                to="/register"
                className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Explore Drops
              </Link>
              <Link
                to="/register"
                className="rounded-md border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:bg-muted"
              >
                Start Collecting
              </Link>
              <button className="rounded-md border border-border p-2.5 hover:bg-muted">
                <Sparkles className="h-4 w-4" />
              </button>
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
            <div className="pointer-events-none absolute -bottom-4 right-0 w-44 rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-[10px] font-medium tracking-wider text-muted-foreground">TOTAL ITEMS</p>
              <p className="mt-1 font-display text-3xl font-bold">25K+</p>
              <p className="text-xs text-muted-foreground">Across all categories</p>
              <div className="mt-3 flex -space-x-2">
                {["#a78bfa", "#fbbf24", "#34d399", "#60a5fa"].map((c) => (
                  <span
                    key={c}
                    className="h-5 w-5 rounded-full border-2 border-card"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live activity */}
        <div className="mt-10">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold">
            <TrendingUp className="h-3.5 w-3.5 text-[oklch(0.78_0.18_70)]" />
            <span className="tracking-wider text-muted-foreground">LIVE MARKET ACTIVITY</span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {activity.map((a) => (
              <div key={a.name} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <img src={thumbBear} alt="" className="h-10 w-10 rounded-md object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{a.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.action} {a.value}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending strip */}
      <section className="bg-[oklch(0.88_0.2_142)]">
        <div className="mx-auto flex max-w-[1800px] items-center gap-8 overflow-hidden px-6 py-3">
          <span className="text-xs font-bold tracking-wider">TRENDING</span>
          <div className="flex flex-1 items-center gap-8 overflow-hidden">
            {trending.map((t) => (
              <div key={t.name} className="flex shrink-0 items-center gap-2 text-sm">
                <span className="font-medium">{t.name}</span>
                <span className="flex items-center gap-0.5 text-xs font-semibold">
                  <ArrowUpRight className="h-3 w-3" /> {t.pct}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            <button className="rounded border border-black/20 p-1"><ChevronLeft className="h-3 w-3" /></button>
            <button className="rounded border border-black/20 p-1"><ChevronRight className="h-3 w-3" /></button>
          </div>
        </div>
      </section>

      {/* Explore the Culture */}
      <section className="mx-auto max-w-[1800px] px-6 py-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight">
              Explore the
              <br />
              Culture
            </h2>
            <p className="mt-6 text-sm font-medium">Three worlds. Endless stories.</p>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Discover rare collectibles, limited editions, and digital art from creators and collectors
              around the globe.
            </p>
          </div>
          {cultureCards.map((c) => (
            <div key={c.n} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className={`${c.bg} relative p-5`}>
                <div className="flex items-start justify-between text-xs font-semibold">
                  <span>{c.n}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
                <h3 className={`mt-4 whitespace-pre-line font-display text-3xl font-bold leading-tight ${c.titleAccent ? "text-primary" : ""}`}>
                  {c.title}
                </h3>
                <p className="mt-3 whitespace-pre-line text-xs text-foreground/70">{c.blurb}</p>
                <div className="mt-6 flex h-32 items-end justify-center">
                  <img src={c.img} alt="" className="max-h-32 object-contain" />
                </div>
              </div>
              <div className={`${c.foot} px-5 py-3`}>
                <a href="#" className="flex items-center justify-between text-xs font-semibold text-white">
                  {c.cta} <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Built for collectors */}
      <section className="mx-auto max-w-[1800px] px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-10 text-primary-foreground">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[1fr_2fr]">
            <div>
              <h2 className="font-display text-4xl font-bold leading-tight">
                Built for
                <br />
                collectors.
              </h2>
              <p className="mt-5 max-w-sm text-sm text-white/80">
                Vault-X is more than a marketplace. It's a culture-powered ecosystem for collectors,
                creators, and dreamers.
              </p>
              <Link to="/register" className="mt-8 inline-flex items-center gap-1 text-sm font-semibold">
                Learn how it works <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="relative grid grid-cols-3 items-center gap-4">
              <FeatureBox icon={<Users className="h-4 w-4" />} title="Creators" desc="Build and release" />
              <FeatureBox icon={<Sparkles className="h-4 w-4" />} title="Vault.." desc="The hub for culture and value" highlight />
              <FeatureBox icon={<Heart className="h-4 w-4" />} title="Community" desc="Connect and grow" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured drops */}
      <section className="mx-auto max-w-[1800px] px-6 pb-20">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-4xl font-bold">Featured Drops</h2>
            <p className="mt-2 text-sm text-muted-foreground">Hottest releases. Limited quantities.</p>
          </div>
          <Link to="/register" className="text-sm font-semibold text-primary">View all drops</Link>
        </div>
        <div className="relative mt-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {drops.map((d, i) => (
              <article
                key={i}
                className={`group overflow-hidden rounded-2xl border border-border ${d.dark ? "bg-neutral-900 text-white" : d.bg ?? "bg-card"}`}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img src={d.img} alt="" loading="lazy" className="h-full w-full object-cover" />
                  {d.tag && (
                    <span className={`absolute left-3 top-3 rounded px-2 py-1 text-[10px] font-bold tracking-wider ${d.tagBg ?? ""}`}>
                      {d.tag}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="whitespace-pre-line font-display text-xl font-bold leading-tight">
                    {d.title}
                  </h3>
                  <p className={`text-xs ${d.dark ? "text-white/60" : "text-muted-foreground"}`}>{d.sub}</p>
                  <p className={`mt-3 text-[10px] tracking-wider ${d.dark ? "text-white/50" : "text-muted-foreground"}`}>
                    {d.label.toUpperCase()}
                  </p>
                  <p className="font-display text-xl font-bold">{d.price}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-[10px] ${d.dark ? "text-white/60" : "text-muted-foreground"}`}>
                      {d.timer}
                    </span>
                    <button className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${d.dark ? "border-white/30" : "border-border"}`}>
                      Bid
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <button className="absolute -left-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-border bg-card p-2 shadow-sm lg:block">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="absolute -right-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-border bg-card p-2 shadow-sm lg:block">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Collector Spotlight */}
      <section className="mx-auto max-w-[1800px] px-6 pb-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div>
            <h2 className="font-display text-4xl font-bold">Collector Spotlight</h2>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Celebrating the passion behind the collections.
            </p>
            <Link to="/register" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold">
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {spotlight.map((s) => (
            <div key={s.handle} className={`overflow-hidden rounded-2xl ${s.bg} p-4`}>
              <div className="flex items-start justify-between text-sm">
                <div>
                  <p className="font-bold">{s.handle}</p>
                  <p className="text-xs text-foreground/70">{s.role}</p>
                </div>
                <button className="rounded-md bg-white/70 p-1.5"><Plus className="h-3 w-3" /></button>
              </div>
              <div className="mt-4 overflow-hidden rounded-xl">
                <img src={s.img} alt={s.handle} loading="lazy" className="aspect-square w-full object-cover" />
              </div>
              <button className="mt-3 rounded-full bg-black/80 px-3 py-1 text-[10px] font-semibold text-white">
                View Vault
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1800px] px-6 pb-16">
        <div className="rounded-3xl bg-neutral-900 p-10 text-white">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1.2fr_1fr]">
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
              <p className="max-w-md text-sm text-white/70">
                Create your profile, build your collection, and become part of the culture.
              </p>
              <div className="my-6 flex h-12 items-center justify-center opacity-70">
                <div className="grid grid-cols-5 gap-1">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <span key={i} className="h-1.5 w-1.5 rounded-sm bg-white/60" />
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <Stat n="25K+" l="Items" />
              <Stat n="8K+" l="Creators" />
              <Stat n="120K+" l="Collectors" />
              <Stat n="$45M+" l="Volume Traded" big />
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <Link to="/register" className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold">Sign up now</Link>
            <Link to="/register" className="rounded-md border border-white/30 px-5 py-2.5 text-sm font-semibold">
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
