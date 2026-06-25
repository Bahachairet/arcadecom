import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import ItemCard, { type ProductType } from './ItemCard';

interface Auction {
  id: string;
  title: string;
  currentPrice: string;
  endTime: string;
  images: { url: string }[];
  bids: { id: string }[];
}

interface Product {
  id: string;
  title: string;
  price: string;
  type: string;
  images: { url: string }[];
  category: { name: string };
  seller: { displayName: string };
}

const fallbackItems: Product[] = [
  { id: 'fallback-1', title: 'Golden Cartridge', price: '$199.00', type: 'COLLECTIBLE', images: [], category: { name: 'Collectible' }, seller: { displayName: 'retro.hunter' } },
  { id: 'fallback-2', title: 'Neon Dreams Art', price: '$650.00', type: 'DIGITAL', images: [], category: { name: 'Digital Art' }, seller: { displayName: 'pixel.nomad' } },
  { id: 'fallback-3', title: 'Bearbrick 400%', price: '$950.00', type: 'PHYSICAL', images: [], category: { name: 'Designer Toy' }, seller: { displayName: 'toy.archivist' } },
];

const fallbackAuction: Auction = {
  id: 'fallback-auction',
  title: 'Cyber Samurai Figure',
  currentPrice: '2850.00',
  endTime: new Date(Date.now() + 86400000 * 2).toISOString(),
  images: [],
  bids: Array.from({ length: 12 }),
};

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

export default function FeaturedItemsSection() {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);

    const fetchFeatured = async () => {
      try {
        const [physRes, digiRes, collRes, auctRes] = await Promise.allSettled([
          api.get('/products', { params: { type: 'PHYSICAL', limit: 1, sort: 'newest' } }),
          api.get('/products', { params: { type: 'DIGITAL', limit: 1, sort: 'newest' } }),
          api.get('/products', { params: { type: 'COLLECTIBLE', limit: 1, sort: 'newest' } }),
          api.get('/bidproducts/active', { params: { limit: 1 } }),
        ]);

        const items: Product[] = [];
        for (const res of [collRes, digiRes, physRes]) {
          if (res.status === 'fulfilled' && res.value.data.products?.length) {
            items.push(res.value.data.products[0]);
          }
        }
        if (items.length > 0) setProducts(items);

        if (auctRes.status === 'fulfilled' && auctRes.value.data.bidProducts?.length) {
          setAuction(auctRes.value.data.bidProducts[0]);
        }
      } catch {
        // keep fallbacks
      }
    };

    fetchFeatured();
    return () => window.clearInterval(timer);
  }, []);

  const getTimeLeft = (endTime: string) => {
    const diff = new Date(endTime).getTime() - now;
    if (diff <= 0) return 'Ended';
    return `${Math.ceil(diff / 86400000)}d left`;
  };

  const displayAuction = auction || fallbackAuction;
  const displayProducts = products.length > 0 ? products : fallbackItems;

  return (
    <section className="mx-auto max-w-[1800px] px-6 pb-20">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-4xl font-bold">Featured Items</h2>
          <p className="mt-2 text-sm text-muted-foreground font-serif">
            Fresh drops. Hot auctions. One-of-a-kind pieces.
          </p>
        </div>
        <Link to="/products" className="text-sm font-bold text-primary hover:underline">
          View all items
        </Link>
      </div>

      <div className="relative mt-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ItemCard
            id={displayAuction.id}
            type="auction"
            title={displayAuction.title}
            price={`$${parseFloat(displayAuction.currentPrice).toFixed(2)}`}
            bids={displayAuction.bids.length}
            timer={getTimeLeft(displayAuction.endTime)}
            imageUrl={displayAuction.images[0]?.url ? `http://localhost:5000${displayAuction.images[0].url}` : undefined}
            colorVariant="dark"
            showNew
          />
          {displayProducts.map((p) => (
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
      </div>
    </section>
  );
}
