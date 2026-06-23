import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Grid3x3 } from 'lucide-react';
import loogo from '@/assets/glogo.png';

const navLinks = ["Explore", "Drops", "Collectibles", "Digital Art", "Creators", "How it Works"];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-6 py-5">
      <Link to="/" className="ml-16 flex items-center">
        <img src={loogo} alt="VAULT..X" className="h-10 w-auto" />
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
          <>
            <span className="text-sm text-muted-foreground hidden sm:block">Hi, {user.displayName}</span>
            <Button
              variant="outline"
              onClick={() => { logout(); navigate('/'); }}
            >
              Logout
            </Button>
          </>
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
