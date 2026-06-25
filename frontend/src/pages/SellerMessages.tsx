import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useAuth } from "@/context/AuthContext";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  setActiveConversation,
  clearActiveConversation,
  addMessage,
  markAsRead,
} from "@/store/slices/messengerSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, ArrowLeft } from "lucide-react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const getSocket = (): Socket => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      withCredentials: true,
    });
  }
  return socket;
};

export default function SellerMessages() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { conversations, activeConversation, messages, loading, messagesLoading } =
    useAppSelector((s) => s.messenger);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchConversations());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (!user) return;

    const s = getSocket();
    s.on("newMessage", (data: { message: any; conversationId: string }) => {
      if (data.message.senderId !== user.id) {
        if (activeConversation?.id === data.conversationId) {
          dispatch(addMessage(data.message));
        }
      }
    });

    return () => {
      s.off("newMessage");
    };
  }, [user, activeConversation, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activeConversation) {
      dispatch(fetchMessages(activeConversation.id));
      dispatch(markAsRead(activeConversation.id));
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [activeConversation, dispatch]);

  const handleSend = async () => {
    if (!input.trim() || !activeConversation) return;
    const content = input.trim();
    setInput("");
    await dispatch(
      sendMessage({ conversationId: activeConversation.id, content })
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      <div className="lg:col-span-1 border rounded-lg overflow-hidden flex flex-col">
        <div className="p-3 border-b">
          <h3 className="font-semibold text-sm">Conversations</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-40 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
              <MessageSquare className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm text-center">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const buyer = conv.buyer;
              const hasUnread =
                (conv.messages?.length ?? 0) > 0 &&
                conv.messages[0].senderId !== user.id;
              return (
                <button
                  key={conv.id}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${
                    activeConversation?.id === conv.id ? "bg-muted" : ""
                  }`}
                  onClick={() => dispatch(setActiveConversation(conv))}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={buyer.avatarUrl || undefined} />
                    <AvatarFallback>
                      {buyer.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm truncate ${
                          hasUnread ? "font-semibold" : "font-medium"
                        }`}
                      >
                        {buyer.displayName}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.lastMessage || conv.product?.title || conv.bidProduct?.title || "Conversation"}
                    </p>
                  </div>
                  {hasUnread && (
                    <div className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="lg:col-span-2 border rounded-lg flex flex-col overflow-hidden">
        {activeConversation ? (
          <>
            <div className="px-4 py-3 border-b flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 lg:hidden"
                onClick={() => dispatch(clearActiveConversation())}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={activeConversation.buyer.avatarUrl || undefined} />
                <AvatarFallback>
                  {activeConversation.buyer.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {activeConversation.buyer.displayName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Re: {activeConversation.product?.title || activeConversation.bidProduct?.title || "Conversation"}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messagesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-8 rounded-lg bg-muted animate-pulse ${
                        i % 2 === 0 ? "w-2/3 mr-auto" : "w-2/3 ml-auto"
                      }`}
                    />
                  ))}
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.senderId === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-3 opacity-50" />
            <p>Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
