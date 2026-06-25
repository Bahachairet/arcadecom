import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

export interface User {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface Product {
  id: string;
  title: string;
  price: string;
  images: { url: string }[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
  sender: User;
}

export interface Conversation {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  buyer: User;
  seller: User;
  product: Product;
  messages: Message[];
}

interface MessengerState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  unreadCount: number;
  openChatId: string | null;
  loading: boolean;
  messagesLoading: boolean;
  error: string | null;
}

const initialState: MessengerState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  unreadCount: 0,
  openChatId: null,
  loading: false,
  messagesLoading: false,
  error: null,
};

export const fetchConversations = createAsyncThunk(
  "messenger/fetchConversations",
  async () => {
    const res = await api.get("/conversations");
    return res.data.conversations;
  }
);

export const fetchMessages = createAsyncThunk(
  "messenger/fetchMessages",
  async (conversationId: string) => {
    const res = await api.get(`/messages/${conversationId}`);
    return res.data.messages;
  }
);

export const sendMessage = createAsyncThunk(
  "messenger/sendMessage",
  async ({
    conversationId,
    content,
  }: {
    conversationId: string;
    content: string;
  }) => {
    const res = await api.post(`/messages/${conversationId}`, { content });
    return res.data.message;
  }
);

export const createConversation = createAsyncThunk(
  "messenger/createConversation",
  async ({
    sellerId,
    productId,
    bidProductId,
  }: {
    sellerId: string;
    productId?: string;
    bidProductId?: string;
  }) => {
    const res = await api.post("/conversations", { sellerId, productId, bidProductId });
    return res.data.conversation;
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "messenger/fetchUnreadCount",
  async () => {
    const res = await api.get("/conversations/unread");
    return res.data.count;
  }
);

export const markAsRead = createAsyncThunk(
  "messenger/markAsRead",
  async (conversationId: string, { getState }) => {
    const state = getState() as { messenger: MessengerState };
    const conv = state.messenger.conversations.find((c) => c.id === conversationId);
    const unreadBefore = conv
      ? conv.messages.filter((m) => m.senderId !== state.messenger.openChatId && !m.readAt).length
      : 0;
    await api.patch(`/messages/${conversationId}/read`);
    return { conversationId, unreadCleared: unreadBefore };
  }
);

const messengerSlice = createSlice({
  name: "messenger",
  initialState,
  reducers: {
    setActiveConversation(state, action) {
      state.activeConversation = action.payload;
    },
    clearActiveConversation(state) {
      state.activeConversation = null;
      state.messages = [];
    },
    openChat(state, action) {
      state.openChatId = action.payload;
    },
    closeChat(state) {
      state.openChatId = null;
      state.activeConversation = null;
      state.messages = [];
    },
    addMessage(state, action) {
      const message = action.payload;
      const exists = state.messages.find((m) => m.id === message.id);
      if (!exists && state.openChatId === message.conversationId) {
        state.messages.push(message);
      }
      const conv = state.conversations.find(
        (c) => c.id === message.conversationId
      );
      if (conv) {
        conv.lastMessage = message.content;
        conv.lastMessageAt = message.createdAt;
        if (!exists && message.senderId !== state.openChatId) {
          state.unreadCount += 1;
        }
      }
    },
    decrementUnread(state, action) {
      const count = action.payload as number;
      state.unreadCount = Math.max(0, state.unreadCount - count);
    },
    clearMessengerError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load conversations";
      })
      .addCase(fetchMessages.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state) => {
        state.messagesLoading = false;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const message = action.payload;
        const exists = state.messages.find((m) => m.id === message.id);
        if (!exists) {
          state.messages.push(message);
        }
        const conv = state.conversations.find(
          (c) => c.id === message.conversationId
        );
        if (conv) {
          conv.lastMessage = message.content;
          conv.lastMessageAt = message.createdAt;
        }
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        const conversation = action.payload;
        const exists = state.conversations.find((c) => c.id === conversation.id);
        if (!exists) {
          state.conversations.unshift(conversation);
        }
        state.activeConversation = conversation;
        state.openChatId = conversation.id;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const { conversationId, unreadCleared } = action.payload;
        state.messages = state.messages.map((m) =>
          m.conversationId === conversationId && !m.readAt
            ? { ...m, readAt: new Date().toISOString() }
            : m
        );
        if (unreadCleared > 0) {
          state.unreadCount = Math.max(0, state.unreadCount - unreadCleared);
        }
        const conv = state.conversations.find((c) => c.id === conversationId);
        if (conv) {
          conv.messages = conv.messages.map((m) =>
            !m.readAt ? { ...m, readAt: new Date().toISOString() } : m
          );
        }
      });
  },
});

export const {
  setActiveConversation,
  clearActiveConversation,
  openChat,
  closeChat,
  addMessage,
  decrementUnread,
  clearMessengerError,
} = messengerSlice.actions;

export default messengerSlice.reducer;
