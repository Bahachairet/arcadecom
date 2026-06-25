import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useAuth } from "@/context/AuthContext";
import {
  fetchConversations,
  openChat,
  type Conversation,
} from "@/store/slices/messengerSlice";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

export function MessengerSheet() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { conversations, unreadCount, loading } = useAppSelector((s) => s.messenger);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchConversations());
    }
  }, [user, dispatch]);

  const getOtherUser = (conv: Conversation) => {
    if (!user) return conv.buyer;
    return conv.buyerId === user.id ? conv.seller : conv.buyer;
  };

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MessageSquare className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[360px] sm:w-[400px] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle className="font-display">Messages</SheetTitle>
        </SheetHeader>
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
              <MessageSquare className="h-12 w-12 mb-3 opacity-50" />
              <p>No messages yet</p>
              <p className="text-sm text-center">
                Start a conversation from a product page
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const other = getOtherUser(conv);
              const hasUnread =
                (conv.messages?.length ?? 0) > 0 &&
                conv.messages[0].senderId !== user.id;
              return (
                <button
                  key={conv.id}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                  onClick={() => {
                    setOpen(false);
                    dispatch(openChat(conv.id));
                  }}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={other.avatarUrl || undefined} />
                    <AvatarFallback>
                      {other.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm truncate ${
                          hasUnread ? "font-semibold" : "font-medium"
                        }`}
                      >
                        {other.displayName}
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
      </SheetContent>
    </Sheet>
  );
}
