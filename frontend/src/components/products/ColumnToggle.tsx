import { LayoutGrid, Grip } from 'lucide-react';

interface ColumnToggleProps {
  columns: 4 | 5;
  onChange: (columns: 4 | 5) => void;
}

export default function ColumnToggle({ columns, onChange }: ColumnToggleProps) {
  return (
    <div className="flex items-center border border-border">
      <button
        onClick={() => onChange(4)}
        className={`flex h-8 w-8 items-center justify-center ${
          columns === 4 ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'
        }`}
        aria-label="4 columns"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange(5)}
        className={`flex h-8 w-8 items-center justify-center ${
          columns === 5 ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'
        }`}
        aria-label="5 columns"
      >
        <Grip className="h-4 w-4" />
      </button>
    </div>
  );
}
