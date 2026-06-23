import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, Package, BarChart3, MessageCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

type ProfileStatus = null | 'PENDING' | 'APPROVED' | 'REJECTED';

const benefits = [
  {
    icon: <Package className="h-5 w-5" />,
    title: 'List Your Products',
    desc: 'Sell physical items, digital creations, or rare collectibles.',
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: 'Track Your Sales',
    desc: 'Real-time dashboard with revenue tracking and order history.',
  },
  {
    icon: <MessageCircle className="h-5 w-5" />,
    title: 'Connect with Buyers',
    desc: 'Direct messaging with potential customers.',
  },
];

export default function BecomeASeller() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    api
      .get('/sellers/me')
      .then((res) => {
        if (res.data.profile) {
          setProfileStatus(res.data.profile.status);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [user, navigate]);

  if (!user || checking) return null;

  if (user.role !== 'buyer') {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/sellers/apply', { storeName, description });
      setProfileStatus('PENDING');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  if (profileStatus === 'PENDING') {
    return (
      <div className="min-h-[calc(100vh-150px)] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold">Application Under Review</h2>
            <p className="text-muted-foreground">
              Your seller application is pending admin approval. You'll be notified once a decision is made.
            </p>
            <Badge variant="outline" className="text-sm">Status: Pending</Badge>
            <div className="pt-2">
              <Button onClick={() => navigate('/')} className="w-full">
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileStatus === 'APPROVED') {
    return (
      <div className="min-h-[calc(100vh-150px)] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="font-display text-2xl font-bold">You're a Seller!</h2>
            <p className="text-muted-foreground">
              Your application has been approved. You can now start listing products.
            </p>
            <div className="pt-2">
              <Button onClick={() => navigate('/seller/dashboard')} className="w-full">
                Go to Seller Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileStatus === 'REJECTED') {
    return (
      <div className="min-h-[calc(100vh-150px)] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="font-display text-2xl font-bold">Application Not Approved</h2>
            <p className="text-muted-foreground">
              Unfortunately, your seller application was not approved at this time. You can reapply with updated information.
            </p>
            <Badge variant="destructive" className="text-sm">Status: Rejected</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-150px)] px-4 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Start Selling on <span className="text-primary">Vault-X</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            Join our community of creators and collectors. Turn your products into revenue and connect with buyers worldwide.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-xl border border-border bg-card p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {b.icon}
              </div>
              <p className="font-semibold text-sm">{b.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Application Form */}
        <Card className="max-w-xl mx-auto">
          <CardContent className="pt-8">
            <h2 className="font-display text-xl font-bold mb-1">Your Application</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Tell us about your store. This will be reviewed by our admin team.
            </p>

            {error && (
              <p className="text-sm mb-4 text-center bg-destructive/10 text-destructive p-2 rounded border border-destructive/20">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name *</Label>
                <Input
                  id="storeName"
                  type="text"
                  placeholder="e.g. Pixel Paradise, Retro Vault, Neo Collectibles"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  This will be displayed publicly as your seller identity.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">About Your Store (optional)</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="What kind of products do you sell?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  A short description to help buyers know what to expect.
                </p>
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>

            <p className="text-center text-muted-foreground text-sm mt-6">
              <Link to="/" className="text-primary hover:underline">Back to Home</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
