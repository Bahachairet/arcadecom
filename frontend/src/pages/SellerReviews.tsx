import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; displayName: string };
  product: { id: string; title: string; images: { url: string }[] };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${
            star <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
          }`}
        />
      ))}
    </div>
  );
}

export default function SellerReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'seller') return;
    setLoading(true);
    api
      .get('/products/seller')
      .then((res) => {
        const productIds = res.data.products.map((p: any) => p.id);
        if (productIds.length === 0) {
          setReviews([]);
          return;
        }
        return Promise.all(
          productIds.map((id: string) =>
            api.get(`/reviews/product/${id}`).then((r) =>
              r.data.reviews.map((review: any) => ({
                ...review,
                product: res.data.products.find((p: any) => p.id === id),
              }))
            )
          )
        );
      })
      .then((results) => {
        if (results) {
          const allReviews = results.flat().sort(
            (a: Review, b: Review) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setReviews(allReviews);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Reviews</p>
            <p className="font-display text-2xl font-bold">{reviews.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Average Rating</p>
            <p className="font-display text-2xl font-bold">
              {reviews.length > 0 ? avgRating.toFixed(1) : '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">5-Star Reviews</p>
            <p className="font-display text-2xl font-bold">
              {reviews.filter((r) => r.rating === 5).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">No reviews yet on your products.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {review.product.images[0] ? (
                      <img
                        src={`${API_BASE}${review.product.images[0].url}`}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground text-[10px]">
                        N/A
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{review.user.displayName}</span>
                      <span className="text-xs text-muted-foreground">on</span>
                      <span className="text-sm font-medium truncate">{review.product.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <StarRating rating={review.rating} />
                      <Badge variant="outline" className="text-[10px]">
                        {review.rating}/5
                      </Badge>
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
  );
}
