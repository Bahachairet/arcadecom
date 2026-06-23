import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Grid3x3, Store, Shield, LogOut, Clock } from 'lucide-react';
import loogo from '@/assets/glogo.png';

const navLinks = ["Explore", "Drops", "Collectibles", "Digital Art", "Creators", "How it Works"];

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
  const navigate = useNavigate();
  const [sellerStatus, setSellerStatus] = useState<string | null>(null);

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
    <header className="flex items-center justify-between px-6 py-5">
      <Link to="/" className="ml-0 flex items-center">
        <img src={loogo} alt="VAULT..X" className="h-15 w-auto" />
      </Link>
      <nav className="hidden items-center gap-8 lg:flex">
        {navLinks.map((l) => (
          <Link key={l} to="/" className="text-sm font-medium text-foreground/80 hover:text-foreground">
            {l}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">
                {getInitials(user.displayName)}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-background border-border">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.displayName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
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
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
            >
              Log in
            </Button>
            <Button
              onClick={() => navigate('/register')}
            >
              Sign up
            </Button>
          </>
        )}
        <button aria-label="menu" className="ml-1 rounded-md border border-border p-2 hover:bg-muted">
          <Grid3x3 className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
