import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { createConversation, openChat } from "@/store/slices/messengerSlice";
import {
  fetchAuction,
  fetchBidHistory,
  placeBid,
} from "@/store/slices/auctionsSlice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Gavel, Clock, Users, DollarSign, MessageSquare, Star } from "lucide-react";

const API_BASE = "http://localhost:5000";

interface AuctionReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; displayName: string; avatarUrl: string | null };
}

function useCountdown(endTime: string) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) return "Ended";
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
      if (h > 0) return `${h}h ${m}m ${s}s`;
      return `${m}m ${s}s`;
    };
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return timeLeft;
}

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(star)}
        >
          <Star
            className={`h-4 w-4 ${
              star <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function AuctionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { currentAuction, bidHistory, totalBids, uniqueBidders, loading, bidding, error } =
    useAppSelector((s) => s.auctions);
  const [bidAmount, setBidAmount] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);

  const [reviews, setReviews] = useState<AuctionReview[]>([]);
  const [summary, setSummary] = useState({ average: 0, count: 0 });
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [existingReview, setExistingReview] = useState<AuctionReview | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchAuction(id));
      dispatch(fetchBidHistory(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (!id) return;
    api.get(`/bidproduct-reviews/${id}`).then((res) => {
      setReviews(res.data.reviews);
      setSummary(res.data.summary);
      if (user) {
        const mine = res.data.reviews.find((r: AuctionReview) => r.user.id === user.id);
        if (mine) {
          setExistingReview(mine);
          setMyRating(mine.rating);
          setMyComment(mine.comment || "");
        }
      }
    }).catch(() => {});
  }, [id, user]);

  const handleBid = async () => {
    if (!bidAmount || !id) return;
    try {
      await dispatch(placeBid({ bidProductId: id, amount: bidAmount })).unwrap();
      setBidAmount("");
      dispatch(fetchAuction(id));
      dispatch(fetchBidHistory(id));
    } catch {
      // error is in redux state
    }
  };

  const handleMessageSeller = async () => {
    if (!currentAuction || !user) return;
    const res = await dispatch(
      createConversation({
        sellerId: currentAuction.sellerId,
        bidProductId: currentAuction.id,
      })
    ).unwrap();
    dispatch(openChat(res.id));
  };

  const handleSubmitReview = async () => {
    if (!myRating || !id) return;
    setSubmittingReview(true);
    try {
      if (existingReview) {
        const res = await api.put(`/bidproduct-reviews/${existingReview.id}`, {
          rating: myRating,
          comment: myComment,
        });
        setReviews((prev) => prev.map((r) => (r.id === existingReview.id ? res.data.review : r)));
        setExistingReview(res.data.review);
      } else {
        const res = await api.post(`/bidproduct-reviews/${id}`, {
          rating: myRating,
          comment: myComment,
        });
        setReviews((prev) => [res.data.review, ...prev]);
        setExistingReview(res.data.review);
        setSummary((prev) => ({
          average: (prev.average * prev.count + myRating) / (prev.count + 1),
          count: prev.count + 1,
        }));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!existingReview) return;
    if (!confirm("Delete your review?")) return;
    try {
      await api.delete(`/bidproduct-reviews/${existingReview.id}`);
      setReviews((prev) => prev.filter((r) => r.id !== existingReview.id));
      setExistingReview(null);
      setMyRating(0);
      setMyComment("");
      setSummary((prev) => ({
        average: prev.count > 1 ? (prev.average * prev.count - existingReview.rating) / (prev.count - 1) : 0,
        count: prev.count - 1,
      }));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete review");
    }
  };

  const timeLeft = useCountdown(currentAuction?.endTime || new Date().toISOString());

  if (loading || !currentAuction) {
    return (
      <div className="mx-auto max-w-[1800px] px-6 py-10">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-square bg-muted rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-12 bg-muted rounded w-1/3" />
            <div className="h-40 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  const price = parseFloat(currentAuction.currentPrice) || 0;
  const minInc = parseFloat(currentAuction.minIncrement) || 0;
  const startPrice = parseFloat(currentAuction.startingPrice) || 0;
  const minBid = price + minInc;
  const suggestedBids = minInc > 0 ? [minBid.toFixed(2), (minBid + minInc).toFixed(2), (minBid + minInc * 4).toFixed(2)] : [];
  const isOwner = user?.id === currentAuction.sellerId;
  const isWinner = user?.id === currentAuction.winnerId;
  const canReview = isWinner && currentAuction.status === "ENDED" && !existingReview;

  return (
    <div className="mx-auto max-w-[1800px] px-6 py-10">
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted border border-border">
            {currentAuction.images.length > 0 ? (
              <img
                src={`${API_BASE}${currentAuction.images[selectedImage]?.url || currentAuction.images[0].url}`}
                alt={currentAuction.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
            )}
          </div>
          {currentAuction.images.length > 1 && (
            <div className="flex gap-2 mt-4">
              {currentAuction.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`h-16 w-16 rounded-lg overflow-hidden border-2 ${i === selectedImage ? "border-primary" : "border-border"}`}
                >
                  <img src={`${API_BASE}${img.url}`} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Badge className="text-[10px] font-bold tracking-wider mb-3 bg-amber-500 text-black">AUCTION</Badge>
          <h1 className="font-display text-3xl font-bold mb-1">{currentAuction.title}</h1>
          <p className="text-sm text-muted-foreground mb-4">by {currentAuction.seller.displayName}</p>

          <div className="rounded-xl border border-border p-4 mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="h-4 w-4" /> Time Left</span>
              <span className={`font-mono font-bold ${timeLeft === "Ended" ? "text-destructive" : "text-amber-600"}`}>{timeLeft}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><DollarSign className="h-4 w-4" /> Current Bid</span>
              <span className="font-display text-2xl font-bold">${price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Starting Price</span>
              <span>${startPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><Gavel className="h-4 w-4" /> Total Bids</span>
              <span>{totalBids}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><Users className="h-4 w-4" /> Bidders</span>
              <span>{uniqueBidders}</span>
            </div>
          </div>

          {currentAuction.status === "ACTIVE" && timeLeft !== "Ended" && !isOwner ? (
            <>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Minimum bid: ${minBid.toFixed(2)}</p>
                <div className="flex gap-2">
                  <Input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} placeholder={minBid.toFixed(2)} min={minBid} step="0.01" className="flex-1" />
                  <Button onClick={handleBid} disabled={bidding || !bidAmount || parseFloat(bidAmount) < minBid}>
                    {bidding ? "Bidding..." : "Place Bid"}
                  </Button>
                </div>
                {error && <p className="text-sm text-destructive mt-1">{error}</p>}
              </div>
              {suggestedBids.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {suggestedBids.map((s) => (
                    <Button key={s} variant="outline" size="sm" onClick={() => setBidAmount(s)}>${s}</Button>
                  ))}
                </div>
              )}
            </>
          ) : currentAuction.status === "ENDED" && currentAuction.winner ? (
            <div className="rounded-xl border border-amber-500 bg-amber-500/10 p-4 mb-4">
              <p className="text-sm font-medium text-amber-700">
                Auction ended — Winner: {currentAuction.winner.displayName} (${price.toFixed(2)})
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border p-4 mb-4">
              <p className="text-sm text-muted-foreground">
                {currentAuction.status === "CANCELLED" ? "This auction has been cancelled." : timeLeft === "Ended" ? "Auction ended — No bids received" : "Auction hasn't started yet"}
              </p>
            </div>
          )}

          {user && !isOwner && (
            <Button variant="outline" className="w-full mb-4" onClick={handleMessageSeller}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Message Seller
            </Button>
          )}

          {currentAuction.description && (
            <div className="mt-6">
              <h3 className="font-semibold text-sm mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{currentAuction.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bid History */}
      <div className="mt-16 border-t border-border pt-10">
        <h2 className="font-display text-2xl font-bold mb-6">Bid History ({totalBids})</h2>
        <div className="space-y-2">
          {bidHistory.map((bid, index) => (
            <div key={bid.id || `bid-${index}`} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={bid.bidder.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs">{bid.bidder.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{bid.bidder.displayName}</p>
                  <p className="text-xs text-muted-foreground">{new Date(bid.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <p className="font-display font-bold">${parseFloat(bid.amount).toFixed(2)}</p>
            </div>
          ))}
          {bidHistory.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No bids yet. Be the first to bid!</p>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      {currentAuction.status === "ENDED" && (
        <div className="mt-16 border-t border-border pt-10">
          <h2 className="font-display text-2xl font-bold mb-6">
            Reviews{summary.count > 0 && ` (${summary.count})`}
          </h2>

          {canReview && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Write a review</h3>
                <div className="flex items-center gap-3 mb-4">
                  <StarRating rating={myRating} onRate={setMyRating} interactive />
                  <span className="text-sm text-muted-foreground">{myRating}/5</span>
                </div>
                <Textarea
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="mb-4"
                />
                <Button onClick={handleSubmitReview} disabled={!myRating || submittingReview}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </CardContent>
            </Card>
          )}

          {existingReview && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Your Review</h3>
                  <Button variant="ghost" size="sm" onClick={handleDeleteReview} className="text-destructive">
                    Delete
                  </Button>
                </div>
                <StarRating rating={existingReview.rating} />
                {existingReview.comment && (
                  <p className="text-sm text-muted-foreground mt-2">{existingReview.comment}</p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={review.user.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs">{review.user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{review.user.displayName}</p>
                    <StarRating rating={review.rating} />
                  </div>
                </div>
                {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No reviews yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
