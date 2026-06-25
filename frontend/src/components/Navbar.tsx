import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectItemCount, clearCartLocally } from '@/store/slices/cartSlice';
import { fetchUnreadCount, fetchConversations } from '@/store/slices/messengerSlice';
import api from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Menu,
  X,
  Store,
  Shield,
  LogOut,
  Clock,
  ShoppingCart,
  Package,
  MessageSquare,
} from 'lucide-react';
import { MessengerSheet } from '@/components/MessengerSheet';
import { ChatPopup } from '@/components/ChatPopup';
import loogo from '@/assets/glogo.png';

const navLinks = [
  { label: 'Products', href: '/products' },
  { label: 'Rare Items', href: '/products?type=AUCTION' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const itemCount = useAppSelector(selectItemCount);
  const { openChatId, conversations } = useAppSelector((s) => s.messenger);
  const navigate = useNavigate();
  const [sellerStatus, setSellerStatus] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [messengerOpen, setMessengerOpen] = useState(false);

  const openConversation = conversations.find((c) => c.id === openChatId);

  useEffect(() => {
    if (!user) return;
    dispatch(fetchUnreadCount());
    dispatch(fetchConversations());
  }, [user, dispatch]);

  useEffect(() => {
    if (user && user.role === 'buyer') {
      api
        .get('/sellers/me')
        .then((res) => {
          if (res.data.profile) {
            setSellerStatus(res.data.profile.status);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-4">
        {/* LEFT: Logo first */}
        <Link to="/" className="flex shrink-0 items-center">
          <img src={loogo} alt="VAULTX" className="h-12 w-auto" />
        </Link>

        {/* MIDDLE: Nav links (desktop) */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              className="text-xs font-bold uppercase tracking-wider text-foreground/70 hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT: Cart, User, Burger */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              <button
                onClick={() => navigate('/cart')}
                className="relative border border-border p-2 hover:bg-muted"
              >
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center bg-primary text-[10px] font-bold text-primary-foreground">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>
            </>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center border border-border bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition">
                  {getInitials(user.displayName)}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background border-border">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-bold">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setMessengerOpen(true)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </DropdownMenuItem>
                {user.role === 'buyer' && (
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                )}
                {user.role === 'buyer' && !sellerStatus && (
                  <DropdownMenuItem onClick={() => navigate('/become-seller')}>
                    <Store className="mr-2 h-4 w-4" />
                    Become a Seller
                  </DropdownMenuItem>
                )}
                {user.role === 'buyer' && sellerStatus === 'PENDING' && (
                  <DropdownMenuItem disabled>
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    Application Pending
                  </DropdownMenuItem>
                )}
                {user.role === 'buyer' && sellerStatus === 'REJECTED' && (
                  <DropdownMenuItem onClick={() => navigate('/become-seller')}>
                    <Store className="mr-2 h-4 w-4" />
                    Reapply as Seller
                  </DropdownMenuItem>
                )}
                {user.role === 'seller' && (
                  <DropdownMenuItem onClick={() => navigate('/seller/dashboard')}>
                    <Store className="mr-2 h-4 w-4" />
                    Seller Dashboard
                  </DropdownMenuItem>
                )}
                {user.role === 'admin' && (
                  <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    dispatch(clearCartLocally());
                    logout();
                    navigate('/');
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="border border-border px-4 py-2 text-xs font-bold uppercase hover:bg-muted"
              >
                Log in
              </button>
              <button
                onClick={() => navigate('/register')}
                className="border border-border bg-primary px-4 py-2 text-xs font-bold uppercase text-primary-foreground hover:opacity-90"
              >
                Sign up
              </button>
            </>
          )}

          {/* Mobile burger */}
          <button
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="border border-border p-2 hover:bg-muted lg:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <nav className="border-t border-border bg-background px-4 py-4 lg:hidden">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-xs font-bold uppercase tracking-wider text-foreground/70 hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}

      {openConversation && <ChatPopup conversation={openConversation} />}
      {user && <MessengerSheet open={messengerOpen} onOpenChange={setMessengerOpen} />}
    </header>
  );
}
