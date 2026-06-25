import React from 'react';

interface FeatureBoxProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  highlight?: boolean;
}

export default function FeatureBox({ icon, title, desc, highlight }: FeatureBoxProps) {
  return (
    <div
      className={`rounded-xl bg-white p-4 text-foreground ${
        highlight ? 'translate-y-6 shadow-lg' : ''
      }`}
    >
      <div className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{desc}</p>
    </div>
  );
}
