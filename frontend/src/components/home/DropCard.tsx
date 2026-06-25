import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface DropCardProps {
  tag?: string;
  tagBg?: string;
  title: string;
  subtitle: string;
  label: string;
  price: string;
  timer: string;
  dark?: boolean;
  bg?: string;
  href?: string;
}

export default function DropCard({
  tag,
  tagBg,
  title,
  subtitle,
  label,
  price,
  timer,
  dark,
  bg,
  href,
}: DropCardProps) {
  const content = (
    <article
      className={`group overflow-hidden rounded-2xl border border-border ${
        dark ? 'bg-neutral-900 text-white' : bg ?? 'bg-card'
      }`}
    >
      <div className="p-5">
        {tag && (
          <span
            className={`inline-block rounded px-2 py-1 text-[10px] font-bold tracking-wider ${
              tagBg ?? ''
            }`}
          >
            {tag}
          </span>
        )}
        <h3 className="mt-3 whitespace-pre-line font-display text-2xl font-bold leading-tight">
          {title}
        </h3>
        <p className={`text-xs ${dark ? 'text-white/60' : 'text-muted-foreground'}`}>
          {subtitle}
        </p>

        <div className="mt-5 flex items-end gap-3">
          <div className="flex-1">
            <p
              className={`text-[10px] tracking-wider ${
                dark ? 'text-white/50' : 'text-muted-foreground'
              }`}
            >
              {label.toUpperCase()}
            </p>
            <p className="font-display text-xl font-bold">{price}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                dark ? 'bg-green-400' : 'bg-green-600'
              }`}
            />
            <span className={`text-[10px] ${dark ? 'text-white/60' : 'text-muted-foreground'}`}>
              {timer}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
          <span
            className={`flex items-center gap-1 text-xs font-semibold ${
              dark ? 'text-white/80' : 'text-foreground'
            }`}
          >
            View details <ArrowUpRight className="h-3 w-3" />
          </span>
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
              dark ? 'border-white/30' : 'border-border'
            }`}
          >
            Bid
          </span>
        </div>
      </div>
    </article>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }
  return content;
}
