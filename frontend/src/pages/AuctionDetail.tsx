import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { createConversation, openChat } from "@/store/slices/messengerSlice";
import { fetchAuction, fetchBidHistory, placeBid } from "@/store/slices/auctionsSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
        <button key={star} type="button" disabled={!interactive} className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`} onMouseEnter={() => interactive && setHover(star)} onMouseLeave={() => interactive && setHover(0)} onClick={() => interactive && onRate?.(star)}>
          <Star className={`h-4 w-4 ${star <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
        </button>
      ))}
    </div>
  );
}

export default function AuctionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { currentAuction, bidHistory, totalBids, uniqueBidders, loading, bidding, error } = useAppSelector((s) => s.auctions);
  const [bidAmount, setBidAmount] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState<AuctionReview[]>([]);
  const [summary, setSummary] = useState({ average: 0, count: 0 });
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [existingReview, setExistingReview] = useState<AuctionReview | null>(null);

  useEffect(() => { if (id) { dispatch(fetchAuction(id)); dispatch(fetchBidHistory(id)); } }, [id, dispatch]);
  useEffect(() => {
    if (!id) return;
    api.get(`/bidproduct-reviews/${id}`).then((res) => {
      setReviews(res.data.reviews); setSummary(res.data.summary);
      if (user) { const mine = res.data.reviews.find((r: AuctionReview) => r.user.id === user.id); if (mine) { setExistingReview(mine); setMyRating(mine.rating); setMyComment(mine.comment || ""); } }
    }).catch(() => {});
  }, [id, user]);

  const handleBid = async () => {
    if (!bidAmount || !id) return;
    try { await dispatch(placeBid({ bidProductId: id, amount: bidAmount })).unwrap(); setBidAmount(""); dispatch(fetchAuction(id)); dispatch(fetchBidHistory(id)); } catch {}
  };
  const handleMessageSeller = async () => {
    if (!currentAuction || !user) return;
    const res = await dispatch(createConversation({ sellerId: currentAuction.sellerId, bidProductId: currentAuction.id })).unwrap();
    dispatch(openChat(res.id));
  };
  const handleSubmitReview = async () => {
    if (!myRating || !id) return; setSubmittingReview(true);
    try {
      if (existingReview) { const res = await api.put(`/bidproduct-reviews/${existingReview.id}`, { rating: myRating, comment: myComment }); setReviews((prev) => prev.map((r) => (r.id === existingReview.id ? res.data.review : r))); setExistingReview(res.data.review); }
      else { const res = await api.post(`/bidproduct-reviews/${id}`, { rating: myRating, comment: myComment }); setReviews((prev) => [res.data.review, ...prev]); setExistingReview(res.data.review); setSummary((prev) => ({ average: (prev.average * prev.count + myRating) / (prev.count + 1), count: prev.count + 1 })); }
    } catch (err: any) { alert(err.response?.data?.message || "Failed to submit review"); } finally { setSubmittingReview(false); }
  };
  const handleDeleteReview = async () => {
    if (!existingReview || !confirm("Delete your review?")) return;
    try { await api.delete(`/bidproduct-reviews/${existingReview.id}`); setReviews((prev) => prev.filter((r) => r.id !== existingReview.id)); setExistingReview(null); setMyRating(0); setMyComment(""); setSummary((prev) => ({ average: prev.count > 1 ? (prev.average * prev.count - existingReview.rating) / (prev.count - 1) : 0, count: prev.count - 1 })); } catch (err: any) { alert(err.response?.data?.message || "Failed to delete review"); }
  };

  const timeLeft = useCountdown(currentAuction?.endTime || new Date().toISOString());

  if (loading || !currentAuction) {
    return (
      <div className="px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-32" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10">
            <div className="aspect-square bg-muted" />
            <div className="space-y-4"><div className="h-8 bg-muted rounded w-3/4" /><div className="h-12 bg-muted rounded w-1/3" /><div className="h-40 bg-muted rounded" /></div>
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
  const isActive = currentAuction.status === "ACTIVE" && timeLeft !== "Ended";
  const isEnded = currentAuction.status === "ENDED" || timeLeft === "Ended";

  return (
    <div className="px-6 py-8">
      <Link to="/bids" className="inline-flex items-center gap-1 text-sm text-link hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to auctions
      </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10">
        {/* Image — smaller */}
        <div>
          <div className="aspect-square overflow-hidden bg-canvas border-2 border-ink" style={{ filter: 'drop-shadow(4px 4px 0 #000)' }}>
            {currentAuction.images.length > 0 ? (
              <img src={`${API_BASE}${currentAuction.images[selectedImage]?.url || currentAuction.images[0].url}`} alt={currentAuction.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
            )}
          </div>
          {currentAuction.images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {currentAuction.images.map((img, i) => (
                <button key={img.id} onClick={() => setSelectedImage(i)} className={`h-14 w-14 overflow-hidden border-2 ${i === selectedImage ? "border-ink" : "border-border"}`}>
                  <img src={`${API_BASE}${img.url}`} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details — black & white */}
        <div>
          {/* Colored status badge */}
          <div className={`border-2 border-ink px-3 py-1.5 flex items-center gap-2 ${isActive ? 'bg-tint-salmon' : isEnded ? 'bg-tint-steel' : 'bg-tint-sky'}`}>
            <Gavel className="h-3 w-3" />
            <span className="text-xs font-bold uppercase tracking-wider">{isActive ? "Live Auction" : isEnded ? "Auction Ended" : "Auction"}</span>
          </div>

          {/* White body */}
          <div className="border-2 border-t-0 border-ink bg-canvas px-4 py-4">
            <h1 className="font-heading text-2xl font-bold uppercase mb-1">{currentAuction.title}</h1>
            <p className="text-sm text-muted-foreground mb-4">by {currentAuction.seller.displayName}</p>

            <div className="border-t-2 border-ink pt-3 space-y-2">
              <div className="flex justify-between text-sm"><span className="font-bold uppercase flex items-center gap-1.5"><Clock className="h-4 w-4" /> Time Left</span><span className={`font-bold ${isEnded ? "text-muted-foreground" : "font-heading"}`}>{timeLeft}</span></div>
              <div className="flex justify-between text-sm"><span className="font-bold uppercase flex items-center gap-1.5"><DollarSign className="h-4 w-4" /> Current Bid</span><span className="font-heading text-2xl font-bold">${price.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="font-bold uppercase">Starting Price</span><span>${startPrice.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="font-bold uppercase flex items-center gap-1.5"><Gavel className="h-4 w-4" /> Total Bids</span><span>{totalBids}</span></div>
              <div className="flex justify-between text-sm"><span className="font-bold uppercase flex items-center gap-1.5"><Users className="h-4 w-4" /> Bidders</span><span>{uniqueBidders}</span></div>
            </div>
          </div>

          {/* Action area */}
          <div className="border-2 border-t-0 border-ink bg-canvas p-4 space-y-3">
            {isActive && !isOwner ? (
              <>
                <div>
                  <p className="text-sm mb-2 font-bold uppercase">Minimum bid: ${minBid.toFixed(2)}</p>
                  <div className="flex gap-2">
                    <Input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} placeholder={minBid.toFixed(2)} min={minBid} step="0.01" className="flex-1 rounded-none border-2 border-ink" />
                    <Button onClick={handleBid} disabled={bidding || !bidAmount || parseFloat(bidAmount) < minBid} className="rounded-none border-2 border-ink bg-ink text-canvas font-bold uppercase">
                      {bidding ? "Bidding..." : "Place Bid"}
                    </Button>
                  </div>
                  {error && <p className="text-sm mt-1">{error}</p>}
                </div>
                {suggestedBids.length > 0 && (
                  <div className="flex gap-2">
                    {suggestedBids.map((s) => <Button key={s} variant="outline" size="sm" onClick={() => setBidAmount(s)} className="rounded-none border-2 border-ink bg-canvas text-ink font-bold">${s}</Button>)}
                  </div>
                )}
              </>
            ) : isEnded && currentAuction.winner ? (
              <div className="border-2 border-ink p-3"><p className="text-sm font-bold">Auction ended — Winner: {currentAuction.winner.displayName} (${price.toFixed(2)})</p></div>
            ) : (
              <div className="border-2 border-ink p-3"><p className="text-sm">{currentAuction.status === "CANCELLED" ? "This auction has been cancelled." : timeLeft === "Ended" ? "Auction ended — No bids received" : "Auction hasn't started yet"}</p></div>
            )}

            {user && !isOwner && (
              <Button variant="outline" className="w-full rounded-none border-2 border-ink bg-canvas text-ink font-bold uppercase" onClick={handleMessageSeller}>
                <MessageSquare className="mr-2 h-4 w-4" /> Message Seller
              </Button>
            )}
          </div>

          {/* Description */}
          {currentAuction.description && (
            <div className="mt-6">
              <div className="bg-canvas border-2 border-ink border-b-0 px-4 py-2"><span className="font-bold uppercase text-sm">Description</span></div>
              <div className="bg-canvas border-2 border-ink px-4 py-3"><p className="text-sm leading-relaxed whitespace-pre-line">{currentAuction.description}</p></div>
            </div>
          )}
        </div>
      </div>

      {/* Bid History */}
      <div className="mt-12">
        <div className="bg-canvas border-2 border-ink border-b-0 px-4 py-2"><span className="font-bold uppercase text-sm">Bid History ({totalBids})</span></div>
        <div className="bg-canvas border-2 border-ink px-4 py-4">
          <div className="space-y-2">
            {bidHistory.map((bid, index) => (
              <div key={bid.id || `bid-${index}`} className="flex items-center justify-between border-2 border-ink p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 rounded-none border-2 border-ink"><AvatarImage src={bid.bidder.avatarUrl || undefined} /><AvatarFallback className="text-xs">{bid.bidder.displayName.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                  <div><p className="text-sm font-bold">{bid.bidder.displayName}</p><p className="text-xs text-muted-foreground">{new Date(bid.createdAt).toLocaleString()}</p></div>
                </div>
                <p className="font-heading font-bold">${parseFloat(bid.amount).toFixed(2)}</p>
              </div>
            ))}
            {bidHistory.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No bids yet. Be the first to bid!</p>}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {isEnded && (
        <div className="mt-12">
          <div className="bg-canvas border-2 border-ink border-b-0 px-4 py-2"><span className="font-bold uppercase text-sm">Reviews{summary.count > 0 && ` (${summary.count})`}</span></div>
          <div className="bg-canvas border-2 border-ink px-4 py-4">
            {canReview && (
              <div className="mb-6 border-2 border-ink p-4">
                <h3 className="font-bold uppercase text-sm mb-3">Write a review</h3>
                <div className="flex items-center gap-3 mb-3"><StarRating rating={myRating} onRate={setMyRating} interactive /><span className="text-sm">{myRating}/5</span></div>
                <Textarea value={myComment} onChange={(e) => setMyComment(e.target.value)} placeholder="Share your experience..." className="mb-3 rounded-none border-2 border-ink" />
                <Button onClick={handleSubmitReview} disabled={!myRating || submittingReview} className="rounded-none border-2 border-ink bg-ink text-canvas font-bold uppercase">{submittingReview ? "Submitting..." : "Submit Review"}</Button>
              </div>
            )}
            {existingReview && (
              <div className="mb-6 border-2 border-ink p-4">
                <div className="flex items-center justify-between mb-2"><h3 className="font-bold uppercase text-sm">Your Review</h3><Button variant="ghost" size="sm" onClick={handleDeleteReview} className="text-destructive font-bold uppercase">Delete</Button></div>
                <StarRating rating={existingReview.rating} />
                {existingReview.comment && <p className="text-sm mt-2">{existingReview.comment}</p>}
              </div>
            )}
            <div className="space-y-2">
              {reviews.map((review) => (
                <div key={review.id} className="border-2 border-ink p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-8 w-8 rounded-none border-2 border-ink"><AvatarImage src={review.user.avatarUrl || undefined} /><AvatarFallback className="text-xs">{review.user.displayName.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                    <div><p className="text-sm font-bold">{review.user.displayName}</p><StarRating rating={review.rating} /></div>
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                </div>
              ))}
              {reviews.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No reviews yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
