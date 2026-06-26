import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import { ItemCard } from '@/components/home';
import { Pagination } from '@/components/products';
import { ColumnToggle } from '@/components/products';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface BidItem {
  id: string;
  title: string;
  currentPrice: string;
  endTime: string;
  images: { url: string }[];
  seller: { id: string; displayName: string };
  bids: { id: string }[];
}

const perPage = 12;

export default function BidsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allBids, setAllBids] = useState<BidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [columns, setColumns] = useState<4 | 5>(() => {
    const saved = localStorage.getItem('bids-columns');
    return saved === '5' ? 5 : 4;
  });
  const [search, setSearch] = useState(searchParams.get('q') || '');

  const updateURL = useCallback((q: string, p: number) => {
    const params = new URLSearchParams();
    if (p > 1) params.set('page', String(p));
    if (q) params.set('q', q);
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  const handleColumnsChange = (c: 4 | 5) => {
    setColumns(c);
    localStorage.setItem('bids-columns', String(c));
  };

  const handleSearch = () => {
    setPage(1);
    updateURL(search, 1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    updateURL(search, p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setLoading(true);
    api.get('/bidproducts/active', { params: { limit: 200 } })
      .then((res) => setAllBids(res.data.bidProducts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const q = searchParams.get('q')?.toLowerCase() || '';
  const filtered = q
    ? allBids.filter((b) => b.title.toLowerCase().includes(q) || b.seller.displayName.toLowerCase().includes(q))
    : allBids;

  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const paginatedBids = filtered.slice((page - 1) * perPage, page * perPage);

  const gridCols = columns === 5
    ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';

  const getTimeLeft = (endTime: string) => {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    return `${Math.ceil(diff / 86400000)}d left`;
  };

  return (
    <div className="px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold">Rare Items</h1>
        <p className="mt-2 text-sm text-muted-foreground font-serif">
          Live auctions. Bid on exclusive collectibles and limited pieces.
        </p>
      </div>

      <div className="border-2 border-ink bg-canvas px-6 py-4">
        {/* Search + controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name or seller..."
                className="w-full border-2 border-ink bg-canvas pl-9 pr-3 py-2 text-sm outline-none"
              />
            </div>
            <Button onClick={handleSearch} className="rounded-none border-2 border-ink bg-ink text-canvas font-bold uppercase text-xs">
              Search
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <ColumnToggle columns={columns} onChange={handleColumnsChange} />
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="mb-4 text-xs text-muted-foreground">
            <span className="font-bold text-foreground">{total}</span> auctions found
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className={`grid ${gridCols} gap-4`}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border border-border bg-card animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-6 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : paginatedBids.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">No auctions found.</p>
            {q && (
              <Button variant="outline" onClick={() => { setSearch(''); updateURL('', 1); }} className="mt-4 rounded-none border-border text-xs font-bold uppercase">
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className={`grid ${gridCols} gap-4`}>
            {paginatedBids.map((b) => (
              <ItemCard
                key={b.id}
                id={b.id}
                type="bid"
                title={b.title}
                price={`$${parseFloat(b.currentPrice).toFixed(2)}`}
                bids={b.bids.length}
                timer={getTimeLeft(b.endTime)}
                imageUrl={b.images[0]?.url ? `http://localhost:5000${b.images[0].url}` : undefined}
                seller={b.seller.displayName}
                colorVariant="dark"
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    </div>
  );
}
