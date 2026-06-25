import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addItemToCart, selectCartLoading } from '@/store/slices/cartSlice';
import { createConversation, openChat } from '@/store/slices/messengerSlice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

const typeConfig: Record<string, { label: string; icon: React.ReactNode; badge: string }> = {
  PHYSICAL: { label: 'Physical Product', icon: <Package className="h-4 w-4" />, badge: 'bg-[oklch(0.85_0.2_142)] text-black' },
  DIGITAL: { label: 'Digital Product', icon: <Download className="h-4 w-4" />, badge: 'bg-[oklch(0.55_0.24_265)] text-white' },
  COLLECTIBLE: { label: 'Collectible', icon: <Gem className="h-4 w-4" />, badge: 'bg-[oklch(0.88_0.18_92)] text-black' },
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
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data.product))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setReviewsLoading(true);
    api
      .get(`/reviews/product/${id}`)
      .then((res) => {
        setReviews(res.data.reviews);
        setSummary(res.data.summary);
        if (user) {
          const mine = res.data.reviews.find((r: Review) => r.user.id === user.id);
          if (mine) {
            setExistingReview(mine);
            setMyRating(mine.rating);
            setMyComment(mine.comment || '');
          }
        }
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [id, user]);

  useEffect(() => {
    if (!user || !id) return;
    api
      .get('/orders/my-orders')
      .then((res) => {
        const purchased = res.data.orders.some((order: any) =>
          order.status === 'COMPLETED' &&
          order.items.some((item: any) => item.productId === id)
        );
        setHasPurchased(purchased);
      })
      .catch(() => {});
  }, [user, id]);

  const handleSubmitReview = async () => {
    if (!user || !id || myRating === 0) return;
    setSubmitting(true);
    try {
      if (existingReview) {
        const res = await api.patch(`/reviews/${existingReview.id}`, {
          rating: myRating,
          comment: myComment || undefined,
        });
        setReviews((prev) => prev.map((r) => (r.id === existingReview.id ? res.data.review : r)));
        setExistingReview(res.data.review);
      } else {
        const res = await api.post(`/reviews/product/${id}`, {
          rating: myRating,
          comment: myComment || undefined,
        });
        setReviews((prev) => [res.data.review, ...prev]);
        setExistingReview(res.data.review);
        setSummary((prev) => ({
          average: (prev.average * prev.count + myRating) / (prev.count + 1),
          count: prev.count + 1,
        }));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!existingReview) return;
    if (!confirm('Delete your review?')) return;
    try {
      await api.delete(`/reviews/${existingReview.id}`);
      setReviews((prev) => prev.filter((r) => r.id !== existingReview.id));
      setExistingReview(null);
      setMyRating(0);
      setMyComment('');
      setSummary((prev) => ({
        average: prev.count > 1 ? (prev.average * prev.count - existingReview.rating) / (prev.count - 1) : 0,
        count: prev.count - 1,
      }));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete review');
    }
  };

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

          <div className="flex items-center gap-3 mb-6">
            <p className="font-display text-4xl font-bold">${price.toFixed(2)}</p>
            {summary.count > 0 && (
              <div className="flex items-center gap-1.5">
                <StarRating rating={Math.round(summary.average)} />
                <span className="text-sm text-muted-foreground">
                  {summary.average.toFixed(1)} ({summary.count})
                </span>
              </div>
            )}
          </div>

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

          {product.stock === 0 ? (
            <Button
              className="w-full"
              size="lg"
              disabled
              variant="outline"
            >
              Out of Stock
            </Button>
          ) : (
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
          )}

          {user && user.id !== product.seller.id && (
            <Button
              variant="outline"
              className="w-full mt-3"
              size="lg"
              onClick={async () => {
                const res = await dispatch(
                  createConversation({
                    sellerId: product.seller.id,
                    productId: product.id,
                  })
                ).unwrap();
                dispatch(openChat(res.id));
              }}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Message Seller
            </Button>
          )}

          <div className="mt-8">
            <h3 className="font-semibold text-sm mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 border-t border-border pt-10">
        <h2 className="font-display text-2xl font-bold mb-6">
          Reviews{summary.count > 0 && ` (${summary.count})`}
        </h2>

        {/* Review Form */}
        {user && hasPurchased && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">
                {existingReview ? 'Edit your review' : 'Write a review'}
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-muted-foreground">Rating</span>
                <StarRating rating={myRating} onRate={setMyRating} interactive />
              </div>
              <Textarea
                placeholder="Share your experience with this product (optional)"
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                className="mb-4"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReview}
                  disabled={myRating === 0 || submitting}
                >
                  {submitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                </Button>
                {existingReview && (
                  <Button variant="destructive" onClick={handleDeleteReview}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {user && !hasPurchased && (
          <p className="text-sm text-muted-foreground mb-8">
            Purchase this product to leave a review.
          </p>
        )}

        {!user && (
          <p className="text-sm text-muted-foreground mb-8">
            <button className="underline hover:text-foreground" onClick={() => navigate('/login')}>
              Log in
            </button>{' '}
            to leave a review.
          </p>
        )}

        {/* Reviews List */}
        {reviewsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet. Be the first to review this product.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{review.user.displayName}</span>
                        <StarRating rating={review.rating} />
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
