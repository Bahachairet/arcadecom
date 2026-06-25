import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useAuth } from "@/context/AuthContext";
import {
  fetchMessages,
  sendMessage,
  closeChat,
  markAsRead,
  addMessage,
  type Conversation,
} from "@/store/slices/messengerSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Minus, Send, Package } from "lucide-react";
import { io, Socket } from "socket.io-client";

const API_BASE = "http://localhost:5000";

let socket: Socket | null = null;

const getSocket = (): Socket => {
  if (!socket) {
    socket = io("http://localhost:5000", { withCredentials: true });
  }
  return socket;
};

interface ChatPopupProps {
  conversation: Conversation;
}

export function ChatPopup({ conversation }: ChatPopupProps) {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { messages, messagesLoading } = useAppSelector((s) => s.messenger);
  const [input, setInput] = useState("");
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const otherUser = user?.id === conversation.buyerId ? conversation.seller : conversation.buyer;

  useEffect(() => {
    if (!minimized) {
      dispatch(fetchMessages(conversation.id));
      dispatch(markAsRead(conversation.id));
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [conversation.id, minimized, dispatch]);

  useEffect(() => {
    if (!minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, minimized]);

  useEffect(() => {
    const s = getSocket();
    const handler = (data: { message: any; conversationId: string }) => {
      if (data.conversationId === conversation.id && data.message.senderId !== user?.id) {
        dispatch(addMessage(data.message));
      }
    };
    s.on("newMessage", handler);
    return () => { s.off("newMessage", handler); };
  }, [conversation.id, user?.id, dispatch]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const content = input.trim();
    setInput("");
    await dispatch(sendMessage({ conversationId: conversation.id, content }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-0 right-20 z-50 w-[320px] bg-background border border-border rounded-t-lg shadow-lg flex flex-col"
      style={{ height: minimized ? "48px" : "400px" }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 border-b cursor-pointer hover:bg-muted/50 rounded-t-lg"
        onClick={() => setMinimized(!minimized)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="h-7 w-7 flex-shrink-0">
            <AvatarImage src={otherUser.avatarUrl || undefined} />
            <AvatarFallback className="text-xs">
              {otherUser.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium truncate">{otherUser.displayName}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => { e.stopPropagation(); setMinimized(!minimized); }}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => { e.stopPropagation(); dispatch(closeChat()); }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {!minimized && (
        <>
          <div className="px-3 py-1.5 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded overflow-hidden bg-muted flex-shrink-0">
                {conversation.product?.images?.[0] ? (
                  <img
                    src={`${API_BASE}${conversation.product.images[0].url}`}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : conversation.bidProduct?.images?.[0] ? (
                  <img
                    src={`${API_BASE}${conversation.bidProduct.images[0].url}`}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Package className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {conversation.product?.title || conversation.bidProduct?.title || "Conversation"}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messagesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-7 rounded-lg bg-muted animate-pulse ${
                      i % 2 === 0 ? "w-3/4 mr-auto" : "w-3/4 ml-auto"
                    }`}
                  />
                ))}
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-1.5 text-sm ${
                        isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-2 border-t">
            <div className="flex gap-1.5">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Aa"
                className="h-8 text-sm"
              />
              <Button
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={handleSend}
                disabled={!input.trim()}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
