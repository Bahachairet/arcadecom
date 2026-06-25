import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import ordersReducer from './slices/ordersSlice';
import messengerReducer from './slices/messengerSlice';
import auctionsReducer from './slices/auctionsSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    orders: ordersReducer,
    messenger: messengerReducer,
    auctions: auctionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
