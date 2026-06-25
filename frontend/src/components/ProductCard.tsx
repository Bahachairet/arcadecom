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
  PHYSICAL: 'bg-tint-lime text-black',
  DIGITAL: 'bg-tint-periwinkle text-black',
  COLLECTIBLE: 'bg-tint-salmon text-black',
};

/**
 * Get thumbnail URL from original image path.
 * Falls back to original if thumbnail doesn't exist.
 */
function getThumbnailUrl(url: string): string {
  const ext = url.split('.').pop();
  const base = url.replace(/\.[^.]+$/, '');
  return `http://localhost:5000${base}_thumbnail.${ext}`;
}

export default function ProductCard({ product }: { product: Product }) {
  const img = product.images[0]?.url;
  const price = parseFloat(product.price);
  const isOutOfStock = product.stock === 0;

  return (
    <Link
      to={`/products/${product.id}`}
      className={`group overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lg ${isOutOfStock ? 'opacity-70' : ''}`}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {img ? (
          <img
            src={getThumbnailUrl(img)}
            alt={product.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              // Fallback to original if thumbnail fails
              (e.target as HTMLImageElement).src = `http://localhost:5000${img}`;
            }}
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
        {isOutOfStock && (
          <Badge
            className="absolute right-3 top-3 text-[10px] font-bold tracking-wider bg-destructive text-destructive-foreground"
            variant="destructive"
          >
            Out of Stock
          </Badge>
        )}
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
