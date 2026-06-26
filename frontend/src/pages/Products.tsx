import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import { ItemCard } from '@/components/home';
import type { ProductType } from '@/components/home';
import FilterSidebar, { defaultFilters } from '@/components/products/FilterSidebar';
import type { Filters } from '@/components/products/FilterSidebar';
import { Pagination } from '@/components/products';
import { ColumnToggle } from '@/components/products';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: string;
  type: string;
  images: { url: string }[];
  category: { name: string };
  seller: { id: string; displayName: string };
  avgRating: number;
  reviewCount: number;
}

interface BidItem {
  id: string;
  title: string;
  currentPrice: string;
  endTime: string;
  images: { url: string }[];
  seller: { id: string; displayName: string };
  bids: { id: string }[];
}

const colorByType: Record<string, 'peach' | 'sky' | 'lime'> = {
  COLLECTIBLE: 'peach',
  DIGITAL: 'sky',
  PHYSICAL: 'lime',
};

const productTypeByApi: Record<string, ProductType> = {
  COLLECTIBLE: 'Collectible',
  DIGITAL: 'Digital',
  PHYSICAL: 'Physical',
};

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [bids, setBids] = useState<BidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [columns, setColumns] = useState<4 | 5>(() => {
    const saved = localStorage.getItem('products-columns');
    return saved === '5' ? 5 : 4;
  });
  const [filters, setFilters] = useState<Filters>(() => ({
    sort: searchParams.get('sort') || 'newest',
    type: searchParams.get('type') ? searchParams.get('type')!.split(',') : [],
    categoryId: searchParams.get('category') ? searchParams.get('category')!.split(',') : [],
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    includeBids: searchParams.get('includeBids') === 'true',
    sellerName: searchParams.get('sellerName') || '',
    minRating: Number(searchParams.get('minRating')) || 0,
  }));

  const updateURL = useCallback((f: Filters, p: number) => {
    const params = new URLSearchParams();
    if (p > 1) params.set('page', String(p));
    if (f.sort !== 'newest') params.set('sort', f.sort);
    if (f.type.length > 0) params.set('type', f.type.join(','));
    if (f.categoryId.length > 0) params.set('category', f.categoryId.join(','));
    if (f.minPrice) params.set('minPrice', f.minPrice);
    if (f.maxPrice) params.set('maxPrice', f.maxPrice);
    if (f.includeBids) params.set('includeBids', 'true');
    if (f.sellerName) params.set('sellerName', f.sellerName);
    if (f.minRating > 0) params.set('minRating', String(f.minRating));
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  const handleColumnsChange = (c: 4 | 5) => {
    setColumns(c);
    localStorage.setItem('products-columns', String(c));
  };

  const handleFiltersChange = (f: Filters) => {
    setFilters(f);
    setPage(1);
    updateURL(f, 1);
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
    updateURL(defaultFilters, 1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    updateURL(filters, p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setLoading(true);

    const productParams: Record<string, string> = {
      page: String(page),
      limit: '12',
      sort: filters.sort,
    };
    if (filters.type.length > 0) productParams.type = filters.type[0];
    if (filters.categoryId.length > 0) productParams.categoryId = filters.categoryId[0];
    if (filters.minPrice) productParams.minPrice = filters.minPrice;
    if (filters.maxPrice) productParams.maxPrice = filters.maxPrice;
    if (filters.sellerName) productParams.sellerName = filters.sellerName;
    if (filters.minRating > 0) productParams.minRating = String(filters.minRating);

    const requests = [
      api.get('/products', { params: productParams })
        .then((res) => {
          return { products: res.data.products || [], total: res.data.total || 0, totalPages: res.data.totalPages || 0 };
        }),
    ];

    if (filters.includeBids) {
      requests.push(
        api.get('/bidproducts/active', { params: { limit: 50 } })
          .then((res) => ({ bids: res.data.bidProducts || [] }))
          .catch(() => ({ bids: [] }))
      );
    }

    Promise.all(requests)
      .then((results) => {
        const productResult = results[0] as { products: Product[]; total: number; totalPages: number };
        setProducts(productResult.products);
        setTotal(productResult.total);
        setTotalPages(productResult.totalPages);

        if (filters.includeBids && results.length > 1) {
          setBids((results[1] as { bids: BidItem[] }).bids);
        } else {
          setBids([]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, filters]);

  const gridCols = columns === 5
    ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';

  const getTimeLeft = (endTime: string) => {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    return `${Math.ceil(diff / 86400000)}d left`;
  };

  return (
    <div className="mx-auto max-w-[1800px] px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold">Explore Products</h1>
          <p className="mt-2 text-sm text-muted-foreground font-serif">
            Browse unique collectibles, limited drops, and digital creations.
          </p>
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <ColumnToggle columns={columns} onChange={handleColumnsChange} />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block border-r border-border pr-8">
          <FilterSidebar
            filters={filters}
            onChange={handleFiltersChange}
            onClear={handleClearFilters}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile Filter Bar */}
          <div className="mb-4 flex items-center gap-3 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-none border-border text-xs font-bold uppercase">
                  <SlidersHorizontal className="mr-2 h-3 w-3" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-4">
                <FilterSidebar
                  filters={filters}
                  onChange={handleFiltersChange}
                  onClear={handleClearFilters}
                />
              </SheetContent>
            </Sheet>
            <ColumnToggle columns={columns} onChange={handleColumnsChange} />
          </div>

          {/* Results count */}
          {!loading && (
            <p className="mb-4 text-xs text-muted-foreground">
              <span className="font-bold text-foreground">{total}</span> products
              {bids.length > 0 && (
                <> + <span className="font-bold text-foreground">{bids.length}</span> bids</>
              )}
            </p>
          )}

          {/* Bids Section */}
          {!loading && bids.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 font-display text-2xl font-bold">Live Bids</h2>
              <div className={`grid ${gridCols} gap-4`}>
                {bids.map((b) => (
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
            </div>
          )}

          {/* Product Grid */}
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
          ) : products.length === 0 && bids.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-muted-foreground">No products found.</p>
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="mt-4 rounded-none border-border text-xs font-bold uppercase"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={`grid ${gridCols} gap-4`}>
              {products.map((p) => (
                <ItemCard
                  key={p.id}
                  id={p.id}
                  type="product"
                  title={p.title}
                  price={`$${parseFloat(p.price).toFixed(2)}`}
                  seller={p.seller.displayName}
                  category={p.category.name}
                  imageUrl={p.images[0]?.url ? `http://localhost:5000${p.images[0].url}` : undefined}
                  colorVariant={colorByType[p.type] || 'lime'}
                  productType={productTypeByApi[p.type] || 'Collectible'}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={12}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
