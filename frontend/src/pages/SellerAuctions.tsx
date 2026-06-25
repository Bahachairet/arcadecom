import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useAuth } from "@/context/AuthContext";
import { fetchSellerAuctions, cancelAuction, endAuction } from "@/store/slices/auctionsSlice";
import type { BidProduct, Bid } from "@/store/slices/auctionsSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Gavel, Clock, X, StopCircle } from "lucide-react";

const API_BASE = "http://localhost:5000";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  UPCOMING: "outline",
  ACTIVE: "default",
  ENDED: "secondary",
  CANCELLED: "destructive",
};

function useCountdown(endTime: string) {
  const [timeLeft, setTimeLeft] = React.useState("");

  React.useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) return "Ended";
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (d > 0) return `${d}d ${h}h`;
      return `${h}h ${m}m`;
    };
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 60000);
    return () => clearInterval(interval);
  }, [endTime]);

  return timeLeft;
}

function EndAuctionModal({
  auction,
  open,
  onClose,
}: {
  auction: BidProduct & { bids: Bid[] };
  open: boolean;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);

  const uniqueBidders = React.useMemo(() => {
    const map = new Map<string, Bid>();
    for (const bid of auction.bids) {
      const existing = map.get(bid.bidderId);
      if (!existing || parseFloat(bid.amount) > parseFloat(existing.amount)) {
        map.set(bid.bidderId, bid);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => parseFloat(b.amount) - parseFloat(a.amount)
    );
  }, [auction.bids]);

  const handleEnd = async () => {
    await dispatch(endAuction({ id: auction.id, winnerId: selectedWinner || undefined }));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>End Auction & Pick Winner</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {uniqueBidders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No bids placed. Auction will end with no winner.
            </p>
          ) : (
            uniqueBidders.map((bid) => (
              <button
                key={bid.bidderId}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition ${
                  selectedWinner === bid.bidderId
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                }`}
                onClick={() => setSelectedWinner(bid.bidderId)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={bid.bidder.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs">
                    {bid.bidder.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{bid.bidder.displayName}</p>
                </div>
                <p className="font-display font-bold">${parseFloat(bid.amount).toFixed(2)}</p>
              </button>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleEnd}>
            {selectedWinner ? "End & Confirm Winner" : "End Without Winner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AuctionRow({ auction }: { auction: BidProduct & { bids: Bid[] } }) {
  const dispatch = useAppDispatch();
  const timeLeft = useCountdown(auction.endTime);
  const [showEndModal, setShowEndModal] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Cancel this auction?")) return;
    dispatch(cancelAuction(auction.id));
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted">
            {auction.images[0] ? (
              <img
                src={`${API_BASE}${auction.images[0].url}`}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground text-[10px]">
                N/A
              </div>
            )}
          </div>
        </TableCell>
        <TableCell className="font-medium">{auction.title}</TableCell>
        <TableCell className="font-display font-bold">
          ${parseFloat(auction.startingPrice).toFixed(2)}
        </TableCell>
        <TableCell className="font-display font-bold">
          ${parseFloat(auction.currentPrice).toFixed(2)}
        </TableCell>
        <TableCell>{auction.bids?.length ?? 0}</TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm">
              {auction.status === "ACTIVE" ? timeLeft : auction.status}
            </span>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={statusVariant[auction.status] || "secondary"}>
            {auction.status}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex gap-1">
            {auction.status === "ACTIVE" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowEndModal(true)}
                title="End Auction"
              >
                <StopCircle className="h-4 w-4 text-amber-600" />
              </Button>
            )}
            {(auction.status === "UPCOMING" || auction.status === "ACTIVE") && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancel}>
                <X className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
      <EndAuctionModal
        auction={auction}
        open={showEndModal}
        onClose={() => setShowEndModal(false)}
      />
    </>
  );
}

export default function SellerAuctions() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { sellerAuctions } = useAppSelector((s) => s.auctions);

  useEffect(() => {
    if (!user || user.role !== "seller") {
      navigate("/");
      return;
    }
    dispatch(fetchSellerAuctions());
  }, [user, navigate, dispatch]);

  const totalRevenue = sellerAuctions
    .filter((a) => a.status === "ENDED" && a.winnerId)
    .reduce((sum, a) => sum + parseFloat(a.currentPrice), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold">My Auctions</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage your auctions.
          </p>
        </div>
        <Button asChild>
          <Link to="/seller/auctions/new">
            <Plus className="mr-2 h-4 w-4" />
            New Auction
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Auctions</p>
            <p className="font-display text-3xl font-bold">{sellerAuctions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="font-display text-3xl font-bold">
              {sellerAuctions.filter((a) => a.status === "ACTIVE").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Revenue</p>
            <p className="font-display text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {sellerAuctions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Gavel className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">No auctions yet.</p>
            <Button asChild>
              <Link to="/seller/auctions/new">Create your first auction</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Start Price</TableHead>
                <TableHead>Current Bid</TableHead>
                <TableHead>Bids</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellerAuctions.map((auction) => (
                <AuctionRow key={auction.id} auction={auction as BidProduct & { bids: Bid[] }} />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
