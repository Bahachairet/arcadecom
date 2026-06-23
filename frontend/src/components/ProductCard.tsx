import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface ProductImage {
  url: string;
  altText: string | null;
}

interface Product {
  id: string;
  title: string;
  price: string;
  type: string;
  stock: number;
  status: string;
  images: ProductImage[];
  category: { name: string; slug: string };
  seller: { displayName: string };
}

const typeLabels: Record<string, string> = {
  PHYSICAL: 'Physical',
  DIGITAL: 'Digital',
  COLLECTIBLE: 'Collectible',
};

const typeBadgeClass: Record<string, string> = {
  PHYSICAL: 'bg-[oklch(0.85_0.2_142)] text-black',
  DIGITAL: 'bg-[oklch(0.55_0.24_265)] text-white',
  COLLECTIBLE: 'bg-[oklch(0.88_0.18_92)] text-black',
};

export default function ProductCard({ product }: { product: Product }) {
  const img = product.images[0]?.url;
  const price = parseFloat(product.price);

  return (
    <Link
      to={`/products/${product.id}`}
      className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {img ? (
          <img
            src={`http://localhost:5000${img}`}
            alt={product.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
        <Badge
          className={`absolute left-3 top-3 text-[10px] font-bold tracking-wider ${typeBadgeClass[product.type] || ''}`}
          variant="outline"
        >
          {typeLabels[product.type] || product.type}
        </Badge>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm truncate">{product.title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {product.category.name}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <p className="font-display text-lg font-bold">
            ${price.toFixed(2)}
          </p>
          {product.type === 'COLLECTIBLE' && product.stock === 1 && (
            <Badge variant="outline" className="text-[10px]">1/1</Badge>
          )}
          {product.type === 'DIGITAL' && (
            <Badge variant="outline" className="text-[10px]">Instant</Badge>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          by {product.seller.displayName}
        </p>
      </div>
    </Link>
  );
}
