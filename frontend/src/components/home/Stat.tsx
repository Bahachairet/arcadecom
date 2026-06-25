interface StatProps {
  value: string;
  label: string;
  span3?: boolean;
}

export default function Stat({ value, label, span3 }: StatProps) {
  return (
    <div className={span3 ? 'col-span-3' : ''}>
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  );
}
