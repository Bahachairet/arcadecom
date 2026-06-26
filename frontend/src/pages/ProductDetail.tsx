import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addItemToCart, selectCart, selectCartLoading } from '@/store/slices/cartSlice';
import { createConversation, openChat } from '@/store/slices/messengerSlice';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Package, Download, Gem, CheckCircle, Star, Trash2, MessageSquare } from 'lucide-react';

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

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; displayName: string; avatarUrl: string | null };
}

interface ReviewSummary {
  average: number;
  count: number;
}

const typeConfig: Record<string, { label: string; icon: React.ReactNode; badgeBg: string }> = {
  PHYSICAL: { label: 'Physical Product', icon: <Package className="h-3 w-3" />, badgeBg: 'bg-tint-lime' },
  DIGITAL: { label: 'Digital Product', icon: <Download className="h-3 w-3" />, badgeBg: 'bg-tint-sky' },
  COLLECTIBLE: { label: 'Collectible', icon: <Gem className="h-3 w-3" />, badgeBg: 'bg-tint-peach' },
};

const API_BASE = 'http://localhost:5000';

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(star)}
        >
          <Star
            className={`h-4 w-4 ${
              star <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCart);
  const cartLoading = useAppSelector(selectCartLoading);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({ average: 0, count: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/products/${id}`).then((res) => setProduct(res.data.product)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setReviewsLoading(true);
    api.get(`/reviews/product/${id}`).then((res) => {
      setReviews(res.data.reviews);
      setSummary(res.data.summary);
      if (user) {
        const mine = res.data.reviews.find((r: Review) => r.user.id === user.id);
        if (mine) { setExistingReview(mine); setMyRating(mine.rating); setMyComment(mine.comment || ''); }
      }
    }).catch(() => {}).finally(() => setReviewsLoading(false));
  }, [id, user]);

  useEffect(() => {
    if (!user || !id) return;
    api.get('/orders/my-orders').then((res) => {
      const purchased = res.data.orders.some((order: any) => order.status === 'COMPLETED' && order.items.some((item: any) => item.productId === id));
      setHasPurchased(purchased);
    }).catch(() => {});
  }, [user, id]);

  const handleSubmitReview = async () => {
    if (!user || !id || myRating === 0) return;
    setSubmitting(true);
    try {
      if (existingReview) {
        const res = await api.patch(`/reviews/${existingReview.id}`, { rating: myRating, comment: myComment || undefined });
        setReviews((prev) => prev.map((r) => (r.id === existingReview.id ? res.data.review : r)));
        setExistingReview(res.data.review);
      } else {
        const res = await api.post(`/reviews/product/${id}`, { rating: myRating, comment: myComment || undefined });
        setReviews((prev) => [res.data.review, ...prev]);
        setExistingReview(res.data.review);
        setSummary((prev) => ({ average: (prev.average * prev.count + myRating) / (prev.count + 1), count: prev.count + 1 }));
      }
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to submit review'); } finally { setSubmitting(false); }
  };

  const handleDeleteReview = async () => {
    if (!existingReview || !confirm('Delete your review?')) return;
    try {
      await api.delete(`/reviews/${existingReview.id}`);
      setReviews((prev) => prev.filter((r) => r.id !== existingReview.id));
      setExistingReview(null); setMyRating(0); setMyComment('');
      setSummary((prev) => ({ average: prev.count > 1 ? (prev.average * prev.count - existingReview.rating) / (prev.count - 1) : 0, count: prev.count - 1 }));
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to delete review'); }
  };

  if (loading) {
    return (
      <div className="px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-32" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10">
            <div className="aspect-square bg-muted" />
            <div className="space-y-4"><div className="h-8 bg-muted rounded w-3/4" /><div className="h-12 bg-muted rounded w-1/3" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="px-6 py-20 text-center">
        <p className="text-lg">Product not found.</p>
        <Link to="/products" className="text-link hover:underline mt-4 inline-block">Back to products</Link>
      </div>
    );
  }

  const config = typeConfig[product.type] || typeConfig.PHYSICAL;
  const price = parseFloat(product.price);
  const isInCart = cart?.items.some((item) => item.product.id === product.id) || false;

  return (
    <div className="px-6 py-8">
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-link hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10">
        {/* Image — smaller, bevel shadow */}
        <div>
          <div className="aspect-square overflow-hidden bg-canvas border-2 border-ink" style={{ filter: 'drop-shadow(4px 4px 0 #000)' }}>
            {product.images.length > 0 ? (
              <img src={`${API_BASE}${product.images[selectedImage].url}`} alt={product.images[selectedImage].altText || product.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.map((img, i) => (
                <button key={img.id} onClick={() => setSelectedImage(i)} className={`h-14 w-14 overflow-hidden border-2 ${i === selectedImage ? 'border-ink' : 'border-border'}`}>
                  <img src={`${API_BASE}${img.url}`} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details — black & white ribbon-card */}
        <div>
          {/* Colored type badge bar */}
          <div className={`${config.badgeBg} border-2 border-ink px-3 py-1.5 flex items-center gap-2`}>
            {config.icon}
            <span className="text-xs font-bold uppercase tracking-wider">{config.label}</span>
          </div>

          {/* White body */}
          <div className="border-2 border-t-0 border-ink bg-canvas px-4 py-4">
            <h1 className="font-heading text-2xl font-bold uppercase mb-1">{product.title}</h1>
            <p className="text-sm text-muted-foreground mb-4">{product.category.name} · by {product.seller.displayName}</p>

            <div className="flex items-center gap-4 mb-4">
              <span className="font-heading text-3xl font-bold">${price.toFixed(2)}</span>
              {summary.count > 0 && (
                <div className="flex items-center gap-1.5">
                  <StarRating rating={Math.round(summary.average)} />
                  <span className="text-sm text-muted-foreground">{summary.average.toFixed(1)} ({summary.count})</span>
                </div>
              )}
            </div>

            <div className="border-t-2 border-ink pt-3 space-y-2">
              <div className="flex justify-between text-sm"><span className="font-bold uppercase">Status</span><span className="font-bold">{product.status}</span></div>
              {product.type === 'PHYSICAL' && <div className="flex justify-between text-sm"><span className="font-bold uppercase">Stock</span><span>{product.stock === 1 ? '1 of 1 — Unique' : `${product.stock} available`}</span></div>}
              {product.type === 'DIGITAL' && <div className="flex justify-between text-sm"><span className="font-bold uppercase">Delivery</span><span>Instant download</span></div>}
              {product.type === 'COLLECTIBLE' && <div className="flex justify-between text-sm"><span className="font-bold uppercase">Edition</span><span>1 of 1 — Unique</span></div>}
            </div>
          </div>

          {/* Action buttons */}
          <div className="border-2 border-t-0 border-ink bg-canvas p-4 space-y-3">
            {product.stock === 0 ? (
              <Button className="w-full rounded-none border-2 border-ink bg-canvas text-ink font-bold uppercase" size="lg" disabled>Out of Stock</Button>
            ) : isInCart ? (
              <Button className="w-full rounded-none border-2 border-ink bg-canvas text-ink font-bold uppercase" size="lg" disabled>In Your Cart</Button>
            ) : (
              <Button
                className="w-full rounded-none border-2 border-ink bg-ink text-canvas font-bold uppercase"
                size="lg"
                disabled={cartLoading || added}
                onClick={async () => {
                  if (!user) { navigate('/login'); return; }
                  await dispatch(addItemToCart({ productId: product.id }));
                  setAdded(true); setTimeout(() => setAdded(false), 2000);
                }}
              >
                {added ? <><CheckCircle className="mr-2 h-4 w-4" /> Added to Cart</> : cartLoading ? 'Adding...' : 'Add to Cart'}
              </Button>
            )}

            {user && user.id !== product.seller.id && (
              <Button
                variant="outline"
                className="w-full rounded-none border-2 border-ink bg-canvas text-ink font-bold uppercase"
                size="lg"
                onClick={async () => {
                  const res = await dispatch(createConversation({ sellerId: product.seller.id, productId: product.id })).unwrap();
                  dispatch(openChat(res.id));
                }}
              >
                <MessageSquare className="mr-2 h-4 w-4" /> Message Seller
              </Button>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-6">
              <div className="bg-canvas border-2 border-ink border-b-0 px-4 py-2">
                <span className="font-bold uppercase text-sm">Description</span>
              </div>
              <div className="bg-canvas border-2 border-ink px-4 py-3">
                <p className="text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <div className="bg-canvas border-2 border-ink border-b-0 px-4 py-2">
          <span className="font-bold uppercase text-sm">Reviews{summary.count > 0 && ` (${summary.count})`}</span>
        </div>
        <div className="bg-canvas border-2 border-ink px-4 py-4">
          {user && hasPurchased && (
            <div className="mb-6 border-2 border-ink p-4">
              <h3 className="font-bold uppercase text-sm mb-3">{existingReview ? 'Edit your review' : 'Write a review'}</h3>
              <div className="flex items-center gap-3 mb-3"><span className="text-sm font-bold uppercase">Rating</span><StarRating rating={myRating} onRate={setMyRating} interactive /></div>
              <Textarea placeholder="Share your experience (optional)" value={myComment} onChange={(e) => setMyComment(e.target.value)} className="mb-3 rounded-none border-2 border-ink" />
              <div className="flex gap-2">
                <Button onClick={handleSubmitReview} disabled={myRating === 0 || submitting} className="rounded-none border-2 border-ink bg-ink text-canvas font-bold uppercase">
                  {submitting ? 'Submitting...' : existingReview ? 'Update' : 'Submit'}
                </Button>
                {existingReview && <Button variant="destructive" onClick={handleDeleteReview} className="rounded-none border-2 border-ink"><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>}
              </div>
            </div>
          )}
          {user && !hasPurchased && <p className="text-sm text-muted-foreground mb-6">Purchase this product to leave a review.</p>}
          {!user && <p className="text-sm text-muted-foreground mb-6"><button className="underline hover:text-foreground" onClick={() => navigate('/login')}>Log in</button> to leave a review.</p>}

          {reviewsLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse" />)}</div>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="border-2 border-ink p-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1"><span className="font-bold text-sm">{review.user.displayName}</span><StarRating rating={review.rating} /></div>
                      {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
