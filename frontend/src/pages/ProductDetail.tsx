import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addItemToCart, selectCartLoading } from '@/store/slices/cartSlice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Download, Gem, CheckCircle } from 'lucide-react';

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  type: string;
  stock: number;
  fileUrl: string | null;
  status: string;
  createdAt: string;
  images: ProductImage[];
  category: { id: string; name: string; slug: string };
  seller: { id: string; displayName: string; avatarUrl: string | null };
}

const typeConfig: Record<string, { label: string; icon: React.ReactNode; badge: string }> = {
  PHYSICAL: { label: 'Physical Product', icon: <Package className="h-4 w-4" />, badge: 'bg-[oklch(0.85_0.2_142)] text-black' },
  DIGITAL: { label: 'Digital Product', icon: <Download className="h-4 w-4" />, badge: 'bg-[oklch(0.55_0.24_265)] text-white' },
  COLLECTIBLE: { label: 'Collectible', icon: <Gem className="h-4 w-4" />, badge: 'bg-[oklch(0.88_0.18_92)] text-black' },
};

const API_BASE = 'http://localhost:5000';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const cartLoading = useAppSelector(selectCartLoading);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data.product))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1800px] px-6 py-10">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-square bg-muted rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-12 bg-muted rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-[1800px] px-6 py-20 text-center">
        <p className="text-muted-foreground text-lg">Product not found.</p>
        <Link to="/products" className="text-primary hover:underline mt-4 inline-block">
          Back to products
        </Link>
      </div>
    );
  }

  const config = typeConfig[product.type] || typeConfig.PHYSICAL;
  const price = parseFloat(product.price);

  return (
    <div className="mx-auto max-w-[1800px] px-6 py-10">
      <Link
        to="/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted border border-border">
            {product.images.length > 0 ? (
              <img
                src={`${API_BASE}${product.images[selectedImage].url}`}
                alt={product.images[selectedImage].altText || product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-4">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`h-16 w-16 rounded-lg overflow-hidden border-2 ${
                    i === selectedImage ? 'border-primary' : 'border-border'
                  }`}
                >
                  <img
                    src={`${API_BASE}${img.url}`}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <Badge className={`text-[10px] font-bold tracking-wider mb-3 ${config.badge}`}>
            {config.label}
          </Badge>
          <h1 className="font-display text-3xl font-bold mb-1">{product.title}</h1>
          <p className="text-sm text-muted-foreground mb-4">
            {product.category.name} · by {product.seller.displayName}
          </p>

          <p className="font-display text-4xl font-bold mb-6">${price.toFixed(2)}</p>

          <div className="rounded-xl border border-border p-4 mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {product.status}
              </Badge>
            </div>
            {product.type === 'PHYSICAL' && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Stock</span>
                <span>{product.stock} available</span>
              </div>
            )}
            {product.type === 'DIGITAL' && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span>Instant download</span>
              </div>
            )}
            {product.type === 'COLLECTIBLE' && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Edition</span>
                <span>1 of 1 — Unique</span>
              </div>
            )}
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={cartLoading || added}
            onClick={async () => {
              if (!user) {
                navigate('/login');
                return;
              }
              await dispatch(addItemToCart({ productId: product.id }));
              setAdded(true);
              setTimeout(() => setAdded(false), 2000);
            }}
          >
            {added ? (
              <><CheckCircle className="mr-2 h-4 w-4" /> Added to Cart</>
            ) : cartLoading ? 'Adding...' : 'Add to Cart'}
          </Button>

          <div className="mt-8">
            <h3 className="font-semibold text-sm mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
