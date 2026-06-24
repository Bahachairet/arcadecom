import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

interface OrderProductImage {
  url: string;
}

interface OrderProduct {
  id: string;
  images: OrderProductImage[];
}

interface OrderItem {
  id: string;
  title: string;
  unitPrice: string;
  quantity: number;
  product: OrderProduct;
}

interface OrderUser {
  id: string;
  displayName: string;
  email: string;
}

interface Order {
  id: string;
  status: string;
  total: string;
  createdAt: string;
  user?: OrderUser;
  items: OrderItem[];
}

interface OrdersState {
  buyerOrders: Order[];
  buyerLoading: boolean;
  sellerOrders: Order[];
  sellerLoading: boolean;
  sellerPagination: {
    total: number;
    page: number;
    totalPages: number;
  };
  actionLoading: string | null;
  error: string | null;
}

const initialState: OrdersState = {
  buyerOrders: [],
  buyerLoading: false,
  sellerOrders: [],
  sellerLoading: false,
  sellerPagination: { total: 0, page: 1, totalPages: 1 },
  actionLoading: null,
  error: null,
};

export const fetchBuyerOrders = createAsyncThunk(
  'orders/fetchBuyer',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/orders/my-orders');
      return res.data.orders;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load orders');
    }
  }
);

export const fetchSellerOrders = createAsyncThunk(
  'orders/fetchSeller',
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/orders/seller-orders?page=${page}&limit=${limit}`);
      return {
        orders: res.data.orders,
        total: res.data.total,
        page: res.data.page,
        totalPages: res.data.totalPages,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load orders');
    }
  }
);

export const acceptOrder = createAsyncThunk(
  'orders/accept',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/orders/${orderId}/accept`);
      return res.data.order;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to accept order');
    }
  }
);

export const rejectOrder = createAsyncThunk(
  'orders/reject',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/orders/${orderId}/reject`);
      return res.data.order;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to reject order');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrdersError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Buyer orders
      .addCase(fetchBuyerOrders.pending, (state) => {
        state.buyerLoading = true;
        state.error = null;
      })
      .addCase(fetchBuyerOrders.fulfilled, (state, action) => {
        state.buyerOrders = action.payload;
        state.buyerLoading = false;
      })
      .addCase(fetchBuyerOrders.rejected, (state, action) => {
        state.buyerLoading = false;
        state.error = action.payload as string;
      })
      // Seller orders
      .addCase(fetchSellerOrders.pending, (state) => {
        state.sellerLoading = true;
        state.error = null;
      })
      .addCase(fetchSellerOrders.fulfilled, (state, action) => {
        state.sellerOrders = action.payload.orders;
        state.sellerPagination = {
          total: action.payload.total,
          page: action.payload.page,
          totalPages: action.payload.totalPages,
        };
        state.sellerLoading = false;
      })
      .addCase(fetchSellerOrders.rejected, (state, action) => {
        state.sellerLoading = false;
        state.error = action.payload as string;
      })
      // Accept order
      .addCase(acceptOrder.pending, (state, action) => {
        state.actionLoading = action.meta.arg;
        state.error = null;
      })
      .addCase(acceptOrder.fulfilled, (state, action) => {
        state.actionLoading = null;
        const updated = action.payload;
        state.sellerOrders = state.sellerOrders.map((o) => (o.id === updated.id ? updated : o));
        state.buyerOrders = state.buyerOrders.map((o) => (o.id === updated.id ? updated : o));
      })
      .addCase(acceptOrder.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload as string;
      })
      // Reject order
      .addCase(rejectOrder.pending, (state, action) => {
        state.actionLoading = action.meta.arg;
        state.error = null;
      })
      .addCase(rejectOrder.fulfilled, (state, action) => {
        state.actionLoading = null;
        const updated = action.payload;
        state.sellerOrders = state.sellerOrders.map((o) => (o.id === updated.id ? updated : o));
        state.buyerOrders = state.buyerOrders.map((o) => (o.id === updated.id ? updated : o));
      })
      .addCase(rejectOrder.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload as string;
      });
  },
});

export const { clearOrdersError } = ordersSlice.actions;

// Selectors
export const selectBuyerOrders = (state: { orders: OrdersState }) => state.orders.buyerOrders;
export const selectBuyerLoading = (state: { orders: OrdersState }) => state.orders.buyerLoading;
export const selectSellerOrders = (state: { orders: OrdersState }) => state.orders.sellerOrders;
export const selectSellerLoading = (state: { orders: OrdersState }) => state.orders.sellerLoading;
export const selectSellerPagination = (state: { orders: OrdersState }) => state.orders.sellerPagination;
export const selectOrderActionLoading = (state: { orders: OrdersState }) => state.orders.actionLoading;

export default ordersSlice.reducer;
