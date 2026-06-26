import { useState, useEffect, useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Star } from 'lucide-react';
import api from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Seller {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface Filters {
  sort: string;
  type: string[];
  categoryId: string[];
  minPrice: string;
  maxPrice: string;
  includeBids: boolean;
  sellerName: string;
  minRating: number;
}

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClear: () => void;
}

export const defaultFilters: Filters = {
  sort: 'newest',
  type: [],
  categoryId: [],
  minPrice: '',
  maxPrice: '',
  includeBids: false,
  sellerName: '',
  minRating: 0,
};

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

const typeOptions = [
  { label: 'Physical', value: 'PHYSICAL' },
  { label: 'Digital', value: 'DIGITAL' },
  { label: 'Collectible', value: 'COLLECTIBLE' },
];

const ratingOptions = [
  { label: 'All Ratings', value: 0 },
  { label: '4+ Stars', value: 4 },
  { label: '3+ Stars', value: 3 },
  { label: '2+ Stars', value: 2 },
];

export default function FilterSidebar({ filters, onChange, onClear }: FilterSidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellerInput, setSellerInput] = useState('');
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/categories')
      .then((res) => setCategories(res.data.categories || res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (sellerInput.length < 2) {
      setSellers([]);
      return;
    }
    const timer = setTimeout(() => {
      api.get('/products', { params: { sellerName: sellerInput, limit: 20 } })
        .then((res) => {
          const uniqueSellers = new Map<string, Seller>();
          res.data.products?.forEach((p: { seller: Seller }) => {
            if (p.seller && !uniqueSellers.has(p.seller.id)) {
              uniqueSellers.set(p.seller.id, p.seller);
            }
          });
          setSellers(Array.from(uniqueSellers.values()));
          setShowSuggestions(true);
        })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [sellerInput]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleType = (value: string) => {
    const next = filters.type.includes(value)
      ? filters.type.filter((t) => t !== value)
      : [...filters.type, value];
    onChange({ ...filters, type: next });
  };

  const toggleCategory = (id: string) => {
    const next = filters.categoryId.includes(id)
      ? filters.categoryId.filter((c) => c !== id)
      : [...filters.categoryId, id];
    onChange({ ...filters, categoryId: next });
  };

  const hasActiveFilters =
    filters.type.length > 0 ||
    filters.categoryId.length > 0 ||
    filters.minPrice !== '' ||
    filters.maxPrice !== '' ||
    filters.sort !== 'newest' ||
    filters.includeBids ||
    filters.sellerName !== '' ||
    filters.minRating > 0;

  return (
    <aside className="w-60 shrink-0 h-full">
      <div className="sticky top-20 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>

        {/* Sort */}
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Sort By
          </label>
          <Select
            value={filters.sort}
            onValueChange={(val) => onChange({ ...filters, sort: val })}
          >
            <SelectTrigger className="h-9 rounded-none border-border text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none border-border">
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Product Type */}
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Product Type
          </label>
          <div className="space-y-2">
            {typeOptions.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 text-xs font-medium"
              >
                <Checkbox
                  checked={filters.type.includes(opt.value)}
                  onCheckedChange={() => toggleType(opt.value)}
                  className="border-border data-[state=checked]:bg-primary"
                />
                {opt.label}
              </label>
            ))}
            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
              <Checkbox
                checked={filters.includeBids}
                onCheckedChange={(checked) =>
                  onChange({ ...filters, includeBids: checked === true })
                }
                className="border-border data-[state=checked]:bg-primary"
              />
              Show Bids
            </label>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Categories
            </label>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex cursor-pointer items-center gap-2 text-xs font-medium"
                >
                  <Checkbox
                    checked={filters.categoryId.includes(cat.id)}
                    onCheckedChange={() => toggleCategory(cat.id)}
                    className="border-border data-[state=checked]:bg-primary"
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Price Range */}
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Price Range
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
              className="h-9 rounded-none border-border text-xs"
            />
            <span className="text-xs text-muted-foreground">—</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
              className="h-9 rounded-none border-border text-xs"
            />
          </div>
        </div>

        {/* Minimum Rating */}
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Minimum Rating
          </label>
          <Select
            value={String(filters.minRating)}
            onValueChange={(val) => onChange({ ...filters, minRating: Number(val) })}
          >
            <SelectTrigger className="h-9 rounded-none border-border text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none border-border">
              {ratingOptions.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)} className="text-xs">
                  <span className="flex items-center gap-1">
                    {opt.value > 0 && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                    {opt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Seller */}
        <div ref={wrapperRef}>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Seller
          </label>
          {filters.sellerName ? (
            <div className="flex items-center justify-between rounded-none border border-border px-2 py-1.5">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center bg-primary text-[8px] font-bold text-primary-foreground">
                  {filters.sellerName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium">{filters.sellerName}</span>
              </div>
              <button
                onClick={() => {
                  onChange({ ...filters, sellerName: '' });
                  setSellerInput('');
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Input
                type="text"
                placeholder="Type seller name..."
                value={sellerInput}
                onChange={(e) => setSellerInput(e.target.value)}
                onFocus={() => sellers.length > 0 && setShowSuggestions(true)}
                className="h-9 rounded-none border-border text-xs"
              />
              {showSuggestions && sellers.length > 0 && (
                <div className="absolute z-50 mt-1 w-full border border-border bg-background">
                  {sellers.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        onChange({ ...filters, sellerName: s.displayName });
                        setSellerInput('');
                        setSellers([]);
                        setShowSuggestions(false);
                      }}
                      className="flex w-full items-center gap-2 px-2 py-1.5 text-left hover:bg-muted"
                    >
                      {s.avatarUrl ? (
                        <img
                          src={`http://localhost:5000${s.avatarUrl}`}
                          alt=""
                          className="h-5 w-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center bg-primary text-[8px] font-bold text-primary-foreground">
                          {s.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-medium">{s.displayName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Clear All */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClear}
            className="w-full rounded-none border-border text-xs font-bold uppercase"
          >
            Clear All Filters
          </Button>
        )}
      </div>
    </aside>
  );
}
