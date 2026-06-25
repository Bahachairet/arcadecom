import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';

interface TrendingItem {
  name: string;
  pct: string;
}

export default function TrendingStrip({ items }: { items: TrendingItem[] }) {
  return (
    <section className="bg-tint-lime">
      <div className="mx-auto flex max-w-[1800px] items-center gap-8 overflow-hidden px-6 py-3">
        <span className="text-xs font-bold tracking-wider">TRENDING</span>
        <div className="flex flex-1 items-center gap-8 overflow-hidden">
          {items.map((t) => (
            <div key={t.name} className="flex shrink-0 items-center gap-2 text-sm">
              <span className="font-medium">{t.name}</span>
              <span className="flex items-center gap-0.5 text-xs font-semibold">
                <ArrowUpRight className="h-3 w-3" /> {t.pct}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          <button className="rounded border border-black/20 p-1">
            <ChevronLeft className="h-3 w-3" />
          </button>
          <button className="rounded border border-black/20 p-1">
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </section>
  );
}
