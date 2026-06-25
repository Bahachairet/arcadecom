import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Clock, Gavel } from "lucide-react";
import { useEffect, useState } from "react";

interface AuctionImage {
  url: string;
  altText: string | null;
}

interface Auction {
  id: string;
  title: string;
  startingPrice: string;
  currentPrice: string;
  endTime: string;
  status: string;
  images: AuctionImage[];
  seller: { displayName: string };
  bids: { id: string }[];
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
      if (d > 0) return `${d}d ${h}h`;
      if (h > 0) return `${h}h ${m}m`;
      return `${m}m ${s}s`;
    };
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return timeLeft;
}

export default function AuctionCard({ auction }: { auction: Auction }) {
  const img = auction.images[0]?.url;
  const currentPrice = parseFloat(auction.currentPrice);
  const timeLeft = useCountdown(auction.endTime);
  const isActive = auction.status === "ACTIVE" && timeLeft !== "Ended";

  return (
    <Link
      to={`/auctions/${auction.id}`}
      className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {img ? (
          <img
            src={`http://localhost:5000${img}`}
            alt={auction.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
        <Badge className="absolute left-3 top-3 text-[10px] font-bold tracking-wider bg-amber-500 text-black">
          AUCTION
        </Badge>
        {isActive && (
          <div className="absolute right-3 top-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-medium">
            <Clock className="h-3 w-3" />
            {timeLeft}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm truncate">{auction.title}</h3>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Current Bid
            </p>
            <p className="font-display text-lg font-bold">
              ${currentPrice.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Gavel className="h-3.5 w-3.5" />
            <span className="text-xs">{auction.bids.length} bids</span>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          by {auction.seller.displayName}
        </p>
      </div>
    </Link>
  );
}
