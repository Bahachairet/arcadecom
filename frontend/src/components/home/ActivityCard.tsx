import { TrendingUp } from 'lucide-react';

interface ActivityItem {
  name: string;
  action: string;
  value: string;
  time: string;
  image?: string;
}

export default function ActivityCard({ item }: { item: ActivityItem }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      {item.image && (
        <img src={item.image} alt="" className="h-10 w-10 rounded-md object-cover" />
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{item.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {item.action} {item.value}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">{item.time}</p>
      </div>
    </div>
  );
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="mt-10">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold">
        <TrendingUp className="h-3.5 w-3.5 text-accent-yellow" />
        <span className="tracking-wider text-muted-foreground">LIVE MARKET ACTIVITY</span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((item) => (
          <ActivityCard key={item.name} item={item} />
        ))}
      </div>
    </div>
  );
}
