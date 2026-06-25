import { Plus, ExternalLink } from 'lucide-react';

interface SpotlightCardProps {
  handle: string;
  role: string;
  bg: string;
}

export default function SpotlightCard({ handle, role, bg }: SpotlightCardProps) {
  const initials = handle
    .replace('@', '')
    .split('.')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`overflow-hidden rounded-2xl ${bg} p-5`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-foreground/20 font-display text-sm font-bold">
            {initials}
          </span>
          <div>
            <p className="text-sm font-bold">{handle}</p>
            <p className="text-xs text-foreground/70">{role}</p>
          </div>
        </div>
        <button className="rounded-md bg-white/70 p-1.5">
          <Plus className="h-3 w-3" />
        </button>
      </div>

      <div className="mt-4 flex gap-1.5">
        {[
          'h-6 w-6 rounded',
          'h-4 w-4 rounded-full',
          'h-5 w-5 rounded-sm',
          'h-3 w-8 rounded',
          'h-4 w-4 rounded',
        ].map((cls, i) => (
          <span
            key={i}
            className={`inline-block ${cls} ${
              i % 2 === 0 ? 'bg-foreground/15' : 'bg-foreground/10'
            }`}
          />
        ))}
      </div>

      <button className="mt-4 flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1.5 text-[10px] font-semibold text-white">
        View Vault <ExternalLink className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}
