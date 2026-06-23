import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Users,
  Package,
  ShoppingCart,
  Plus,
  Pencil,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface Application {
  id: string;
  storeName: string;
  description: string | null;
  status: string;
  createdAt: string;
  user: { id: string; email: string; displayName: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
}

const headerTitles: Record<string, string> = {
  overview: 'Admin Overview',
  categories: 'Manage Categories',
  sellers: 'Seller Applications',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalProducts: 0, totalOrders: 0 });
  const [applications, setApplications] = useState<Application[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Category form state
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catError, setCatError] = useState('');
  const [catLoading, setCatLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsRes, catsRes] = await Promise.all([
        api.get('/sellers/applications'),
        api.get('/categories'),
      ]);
      setApplications(appsRes.data.applications);
      setCategories(catsRes.data.categories);
      setStats({
        totalUsers: appsRes.data.applications.length + 1,
        totalProducts: 0,
        totalOrders: 0,
      });
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/sellers/approve/${id}`);
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: 'APPROVED' } : app))
      );
    } catch {
      // handle error
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.patch(`/sellers/reject/${id}`);
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: 'REJECTED' } : app))
      );
    } catch {
      // handle error
    }
  };

  const openCatDialog = (cat?: Category) => {
    if (cat) {
      setEditingCat(cat);
      setCatName(cat.name);
      setCatSlug(cat.slug);
    } else {
      setEditingCat(null);
      setCatName('');
      setCatSlug('');
    }
    setCatError('');
    setCatDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    setCatError('');
    if (!catName.trim() || !catSlug.trim()) {
      setCatError('Name and slug are required');
      return;
    }
    setCatLoading(true);
    try {
      if (editingCat) {
        await api.put(`/categories/${editingCat.id}`, { name: catName, slug: catSlug });
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCat.id ? { ...c, name: catName, slug: catSlug } : c))
        );
      } else {
        const res = await api.post('/categories', { name: catName, slug: catSlug });
        setCategories((prev) => [...prev, res.data.category]);
      }
      setCatDialogOpen(false);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setCatError(axiosErr.response?.data?.message || 'Failed to save category');
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // handle error
    }
  };

  if (!user || user.role !== 'admin') return null;

  const pendingCount = applications.filter((a) => a.status === 'PENDING').length;

  return (
    <SidebarProvider>
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <SidebarInset>
        <SiteHeader title={headerTitles[activeTab] || 'Admin'} />
        <div className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold">Dashboard Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Users</p>
                        <p className="font-display text-3xl font-bold">{stats.totalUsers}</p>
                      </div>
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Products</p>
                        <p className="font-display text-3xl font-bold">{stats.totalProducts}</p>
                      </div>
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Applications</p>
                        <p className="font-display text-3xl font-bold">{pendingCount}</p>
                      </div>
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-3">
                  <Button variant="outline" onClick={() => setActiveTab('sellers')}>
                    Review Sellers ({pendingCount})
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('categories')}>
                    Manage Categories
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold">Categories</h2>
                <Button onClick={() => openCatDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">No categories yet.</p>
                    <Button onClick={() => openCatDialog()}>Create your first category</Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((cat) => (
                        <TableRow key={cat.id}>
                          <TableCell className="font-medium">{cat.name}</TableCell>
                          <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openCatDialog(cat)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteCategory(cat.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'sellers' && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold">Seller Applications</h2>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : applications.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No applications yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Store Name</TableHead>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.storeName}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{app.user.displayName}</p>
                              <p className="text-xs text-muted-foreground">{app.user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-[200px] truncate">
                            {app.description || '—'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                app.status === 'PENDING'
                                  ? 'outline'
                                  : app.status === 'APPROVED'
                                  ? 'default'
                                  : 'destructive'
                              }
                            >
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {app.status === 'PENDING' ? (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  className="h-8"
                                  onClick={() => handleApprove(app.id)}
                                >
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-8"
                                  onClick={() => handleReject(app.id)}
                                >
                                  <XCircle className="mr-1 h-3 w-3" />
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {app.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </div>
          )}
        </div>
      </SidebarInset>

      {/* Category Dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingCat ? 'Edit Category' : 'New Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {catError && (
              <p className="text-sm text-center bg-destructive/10 text-destructive p-2 rounded border border-destructive/20">
                {catError}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="catName">Name</Label>
              <Input
                id="catName"
                placeholder="e.g. Pixel Art, Vintage Hardware"
                value={catName}
                onChange={(e) => {
                  setCatName(e.target.value);
                  if (!editingCat) {
                    setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catSlug">Slug</Label>
              <Input
                id="catSlug"
                placeholder="e.g. pixel-art, vintage-hardware"
                value={catSlug}
                onChange={(e) => setCatSlug(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory} disabled={catLoading}>
              {catLoading ? 'Saving...' : editingCat ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
