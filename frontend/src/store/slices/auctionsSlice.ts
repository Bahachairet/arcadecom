import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

export interface BidProductImage {
  id: string;
  url: string;
  altText: string | null;
}

export interface BidProduct {
  id: string;
  sellerId: string;
  title: string;
  description: string | null;
  startingPrice: string;
  minIncrement: string;
  currentPrice: string;
  startTime: string;
  endTime: string;
  status: "UPCOMING" | "ACTIVE" | "ENDED" | "CANCELLED";
  winnerId: string | null;
  createdAt: string;
  images: BidProductImage[];
  seller: { id: string; displayName: string; avatarUrl: string | null };
  winner?: { id: string; displayName: string; avatarUrl: string | null } | null;
  bids?: Bid[];
}

export interface Bid {
  id: string;
  bidProductId: string;
  bidderId: string;
  amount: string;
  createdAt: string;
  bidder: { id: string; displayName: string; avatarUrl: string | null };
}

interface AuctionsState {
  auctions: BidProduct[];
  activeAuctions: BidProduct[];
  sellerAuctions: BidProduct[];
  currentAuction: BidProduct | null;
  bidHistory: Bid[];
  totalBids: number;
  uniqueBidders: number;
  loading: boolean;
  bidding: boolean;
  error: string | null;
}

const initialState: AuctionsState = {
  auctions: [],
  activeAuctions: [],
  sellerAuctions: [],
  currentAuction: null,
  bidHistory: [],
  totalBids: 0,
  uniqueBidders: 0,
  loading: false,
  bidding: false,
  error: null,
};

export const fetchActiveAuctions = createAsyncThunk(
  "auctions/fetchActive",
  async () => {
    const res = await api.get("/bidproducts/active");
    return res.data.bidProducts;
  }
);

export const fetchAuction = createAsyncThunk(
  "auctions/fetchOne",
  async (id: string) => {
    const res = await api.get(`/bidproducts/${id}`);
    return res.data.bidProduct;
  }
);

export const fetchSellerAuctions = createAsyncThunk(
  "auctions/fetchSeller",
  async () => {
    const res = await api.get("/bidproducts/seller");
    return res.data.bidProducts;
  }
);

export const createAuction = createAsyncThunk(
  "auctions/create",
  async (formData: FormData) => {
    const res = await api.post("/bidproducts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.bidProduct;
  }
);

export const cancelAuction = createAsyncThunk(
  "auctions/cancel",
  async (id: string) => {
    const res = await api.patch(`/bidproducts/${id}/cancel`);
    return res.data.bidProduct;
  }
);

export const endAuction = createAsyncThunk(
  "auctions/end",
  async ({ id, winnerId }: { id: string; winnerId?: string }) => {
    const res = await api.patch(`/bidproducts/${id}/end`, { winnerId });
    return res.data.bidProduct;
  }
);

export const placeBid = createAsyncThunk(
  "auctions/placeBid",
  async ({ bidProductId, amount }: { bidProductId: string; amount: string }) => {
    const res = await api.post(`/bids/${bidProductId}`, { amount });
    return res.data;
  }
);

export const fetchBidHistory = createAsyncThunk(
  "auctions/fetchBidHistory",
  async (bidProductId: string) => {
    const res = await api.get(`/bids/${bidProductId}`);
    return res.data;
  }
);

const auctionsSlice = createSlice({
  name: "auctions",
  initialState,
  reducers: {
    updateAuctionRealtime(state, action) {
      const { bidProductId, currentPrice, endTime } = action.payload;
      const auction = state.auctions.find((a) => a.id === bidProductId);
      if (auction) {
        auction.currentPrice = currentPrice;
        auction.endTime = endTime;
      }
      const active = state.activeAuctions.find((a) => a.id === bidProductId);
      if (active) {
        active.currentPrice = currentPrice;
        active.endTime = endTime;
      }
      if (state.currentAuction && state.currentAuction.id === bidProductId) {
        state.currentAuction.currentPrice = currentPrice;
        state.currentAuction.endTime = endTime;
      }
    },
    addBidToHistory(state, action) {
      const bid = action.payload;
      const exists = state.bidHistory.find((b) => b.id === bid.id);
      if (!exists) {
        state.bidHistory.unshift(bid);
      }
    },
    clearAuctionError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveAuctions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActiveAuctions.fulfilled, (state, action) => {
        state.loading = false;
        state.activeAuctions = action.payload;
      })
      .addCase(fetchActiveAuctions.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchAuction.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAuction.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAuction = action.payload;
        state.bidHistory = action.payload.bids || [];
        state.totalBids = action.payload.bids?.length || 0;
        const unique = new Set(
          (action.payload.bids || []).map((b: Bid) => b.bidderId)
        );
        state.uniqueBidders = unique.size;
      })
      .addCase(fetchAuction.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchSellerAuctions.fulfilled, (state, action) => {
        state.sellerAuctions = action.payload;
      })
      .addCase(createAuction.fulfilled, (state, action) => {
        state.sellerAuctions.unshift(action.payload);
      })
      .addCase(cancelAuction.fulfilled, (state, action) => {
        const updated = action.payload;
        state.sellerAuctions = state.sellerAuctions.map((a) =>
          a.id === updated.id ? updated : a
        );
      })
      .addCase(endAuction.fulfilled, (state, action) => {
        const updated = action.payload;
        state.sellerAuctions = state.sellerAuctions.map((a) =>
          a.id === updated.id ? updated : a
        );
        if (state.currentAuction?.id === updated.id) {
          state.currentAuction = updated;
        }
      })
      .addCase(placeBid.pending, (state) => {
        state.bidding = true;
        state.error = null;
      })
      .addCase(placeBid.fulfilled, (state, action) => {
        state.bidding = false;
        const { bid, currentPrice, newEndTime } = action.payload;
        const exists = state.bidHistory.find((b) => b.id === bid.id);
        if (!exists) {
          state.bidHistory.unshift(bid);
        }
        if (state.currentAuction && state.currentAuction.id === bid.bidProductId) {
          state.currentAuction.currentPrice = currentPrice;
          state.currentAuction.endTime = newEndTime;
        }
        state.totalBids += 1;
      })
      .addCase(placeBid.rejected, (state, action) => {
        state.bidding = false;
        state.error = (action.error as any)?.message || "Failed to place bid";
      })
      .addCase(fetchBidHistory.fulfilled, (state, action) => {
        state.bidHistory = action.payload.bids;
        state.totalBids = action.payload.totalBids;
        state.uniqueBidders = action.payload.uniqueBidders;
      });
  },
});

export const { updateAuctionRealtime, addBidToHistory, clearAuctionError } =
  auctionsSlice.actions;

export default auctionsSlice.reducer;
