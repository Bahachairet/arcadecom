import { ArrowUpRight } from 'lucide-react';

interface CultureCardProps {
  number: string;
  title: string;
  blurb: string;
  cta: string;
  bg: string;
  foot: string;
  titleAccent?: boolean;
}

export default function CultureCard({
  number,
  title,
  blurb,
  cta,
  bg,
  foot,
  titleAccent,
}: CultureCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className={`${bg} relative flex min-h-[280px] flex-col p-5`}>
        <div className="flex items-start justify-between text-xs font-semibold">
          <span>{number}</span>
          <ArrowUpRight className="h-4 w-4" />
        </div>
        <h3
          className={`mt-4 whitespace-pre-line font-display text-3xl font-bold leading-tight ${
            titleAccent ? 'text-primary' : ''
          }`}
        >
          {title}
        </h3>
        <p className="mt-3 whitespace-pre-line text-xs text-foreground/70">{blurb}</p>
        <div className="mt-auto flex items-end gap-2 pt-4">
          <span className="inline-block h-8 w-8 rounded-full border-2 border-foreground/20" />
          <span className="inline-block h-5 w-5 rounded-sm border-2 border-foreground/15" />
          <span className="inline-block h-3 w-12 border-2 border-foreground/10" />
        </div>
      </div>
      <div className={`${foot} px-5 py-3`}>
        <a href="#" className="flex items-center justify-between text-xs font-semibold text-white">
          {cta} <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
