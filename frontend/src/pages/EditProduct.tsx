import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  type: string;
  stock: number;
  status: string;
  categoryId: string;
  images: { id: string; url: string }[];
}

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/');
      return;
    }
    Promise.all([
      api.get('/categories'),
      api.get(`/products/${id}`),
    ])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data.categories);
        const p: Product = prodRes.data.product;
        setTitle(p.title);
        setDescription(p.description);
        setPrice(p.price);
        setType(p.type);
        setCategoryId(p.categoryId);
        setStock(p.type === 'PHYSICAL' ? String(p.stock) : '');
      })
      .catch(() => navigate('/seller/dashboard'))
      .finally(() => setFetching(false));
  }, [user, navigate, id]);

  if (!user || user.role !== 'seller') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('type', type);
    formData.append('categoryId', categoryId);
    if (type === 'PHYSICAL' && stock) formData.append('stock', stock);
    if (files) {
      Array.from(files).forEach((f) => formData.append('images', f));
    }

    try {
      await api.patch(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/seller/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to update product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar activeTab="products" onTabChange={() => navigate('/seller/dashboard')} />
      <SidebarInset>
        <SiteHeader title="Edit Product" />
        <div className="flex-1 p-6">
          <Link
            to="/seller/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          {fetching ? (
            <div className="max-w-2xl space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle className="font-display text-xl">Edit Product</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <p className="text-sm mb-4 text-center bg-destructive/10 text-destructive p-2 rounded border border-destructive/20">
                    {error}
                  </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Product title"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your product..."
                      required
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Product Type *</Label>
                      <Select value={type} onValueChange={setType} disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PHYSICAL">Physical</SelectItem>
                          <SelectItem value="DIGITAL">Digital</SelectItem>
                          <SelectItem value="COLLECTIBLE">Collectible</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground">Type cannot be changed after creation.</p>
                    </div>

                    {type === 'PHYSICAL' && (
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock *</Label>
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          placeholder="Quantity"
                          required
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                        />
                      </div>
                    )}
                    {type === 'COLLECTIBLE' && (
                      <div className="space-y-2">
                        <Label>Stock</Label>
                        <Input disabled value="1 (Auto-set for collectibles)" />
                      </div>
                    )}
                    {type === 'DIGITAL' && (
                      <div className="space-y-2">
                        <Label>Stock</Label>
                        <Input disabled value="Unlimited (Digital)" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Current Images</Label>
                    <div className="flex gap-2">
                      {type === 'DIGITAL' ? (
                        <p className="text-sm text-muted-foreground">Digital product file (managed separately)</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Upload new images to add more (existing images are preserved)</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="images">Add More Images</Label>
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setFiles(e.target.files)}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Up to 5 images total. JPEG, PNG, GIF, WebP. Max 5MB each.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate('/seller/dashboard')}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
