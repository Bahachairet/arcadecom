import { useState, useEffect, useCallback } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Area, AreaChart, Line, LineChart, Pie, PieChart, Cell, CartesianGrid, XAxis } from 'recharts';
import { StatCard } from '@/components/StatCard';
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
  DollarSign,
  ArrowLeft,
  Star,
  TrendingUp,
  Ban,
  ShieldCheck,
} from 'lucide-react';

const API_BASE = 'http://localhost:5000';

// ── Types ──

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

interface AdminStats {
  totalUsers: number;
  newUsersThisMonth: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  pendingSellers: number;
}

interface ChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
  users: number;
}

interface User {
  id: string;
  displayName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  avatarUrl: string | null;
  sellerProfile?: { storeName: string; status: string } | null;
}

interface SellerDetail {
  seller: {
    id: string;
    displayName: string;
    email: string;
    avatarUrl: string | null;
    createdAt: string;
    storeName: string | null;
    storeStatus: string | null;
    storeDescription: string | null;
  };
  stats: {
    totalRevenue: number;
    totalOrders: number;
    itemsSold: number;
    productCount: number;
    avgRating: number;
    reviewCount: number;
  };
  products: {
    id: string;
    title: string;
    price: string;
    type: string;
    stock: number;
    status: string;
    image: string | null;
    category: string | null;
    unitsSold: number;
    revenue: number;
    avgRating: number;
    reviewCount: number;
  }[];
  recentOrders: any[];
  chart: { date: string; revenue: number; orders: number }[];
}

interface ActivityOrder {
  id: string;
  total: string;
  status: string;
  createdAt: string;
  user: { displayName: string; email: string };
  items: { title: string; quantity: number; unitPrice: string }[];
}

interface ActivityUser {
  id: string;
  displayName: string;
  email: string;
  role: string;
  createdAt: string;
}

const headerTitles: Record<string, string> = {
  overview: 'Admin Overview',
  users: 'User Management',
  categories: 'Manage Categories',
  sellers: 'Seller Applications',
};

const chartConfig = {
  revenue: { label: 'Revenue', color: '#1d72e9' },
  users: { label: 'Users', color: '#e6915d' },
  orders: { label: 'Orders', color: '#8e8a25' },
} satisfies ChartConfig;

const PIE_COLORS = ['#1d72e9', '#e6915d', '#8e8a25', '#6a26a4', '#9ab6c8'];

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  suspended: 'secondary',
  banned: 'destructive',
};

const roleVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  seller: 'secondary',
  buyer: 'outline',
};

const orderStatusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  COMPLETED: 'default',
  PENDING: 'secondary',
  CANCELLED: 'destructive',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // ── Data States ──
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Overview States ──
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState('30d');
  const [chartLoading, setChartLoading] = useState(true);
  const [activity, setActivity] = useState<{ orders: ActivityOrder[]; users: ActivityUser[] } | null>(null);

  // ── Users States ──
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [selectedSeller, setSelectedSeller] = useState<SellerDetail | null>(null);
  const [sellerLoading, setSellerLoading] = useState(false);

  // ── Category States ──
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catError, setCatError] = useState('');
  const [catLoading, setCatLoading] = useState(false);

  // ── Initial Load ──

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
      const [appsRes, catsRes, statsRes] = await Promise.all([
        api.get('/sellers/applications'),
        api.get('/categories'),
        api.get('/stats/admin').catch(() => null),
      ]);
      setApplications(appsRes.data.applications);
      setCategories(catsRes.data.categories);
      if (statsRes) setStats(statsRes.data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  // ── Overview Data ──

  const fetchChartData = useCallback(async (range: string) => {
    setChartLoading(true);
    try {
      const periodMap: Record<string, string> = { '7d': 'daily', '30d': 'daily', '90d': 'weekly', 'all': 'monthly' };
      const [chartRes, activityRes] = await Promise.all([
        api.get('/stats/admin/chart', { params: { period: periodMap[range] || 'daily' } }),
        api.get('/stats/admin/recent-activity').catch(() => null),
      ]);
      setChartData(chartRes.data);
      if (activityRes) setActivity(activityRes.data);
    } catch {
      // stats might not exist
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchChartData(timeRange);
    }
  }, [activeTab, timeRange, fetchChartData]);

  // ── Users Data ──

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const params: Record<string, string> = {};
      if (userRoleFilter !== 'all') params.role = userRoleFilter;
      if (userStatusFilter !== 'all') params.status = userStatusFilter;
      if (userSearch) params.search = userSearch;
      const res = await api.get('/users', { params });
      setUsers(res.data);
    } catch {
      // users endpoint might not exist
    } finally {
      setUsersLoading(false);
    }
  }, [userRoleFilter, userStatusFilter, userSearch]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, fetchUsers]);

  // ── Seller Detail ──

  const fetchSellerDetail = async (userId: string) => {
    setSellerLoading(true);
    try {
      const res = await api.get(`/stats/admin/seller/${userId}`);
      setSelectedSeller(res.data);
    } catch {
      // handle error
    } finally {
      setSellerLoading(false);
    }
  };

  // ── User Actions ──

  const handleUserStatus = async (userId: string, newStatus: string) => {
    const label = newStatus === 'active' ? 'activate' : newStatus;
    if (!confirm(`Are you sure you want to ${label} this user?`)) return;
    try {
      await api.patch(`/users/${userId}/status`, { status: newStatus });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  // ── Seller Actions ──

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

  // ── Category Actions ──

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
      <AdminSidebar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setSelectedSeller(null); }} />
      <SidebarInset>
        <SiteHeader title={selectedSeller ? `Seller: ${selectedSeller.seller.storeName || selectedSeller.seller.displayName}` : headerTitles[activeTab] || 'Admin'} />
        <div className="flex-1 p-6">

          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          {/* OVERVIEW TAB                                                              */}
          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold">Dashboard Overview</h2>

              {stats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="h-5 w-5" />} subtitle={`+${stats.newUsersThisMonth} this month`} />
                  <StatCard title="Total Orders" value={stats.totalOrders} icon={<ShoppingCart className="h-5 w-5" />} subtitle={`${stats.pendingOrders} pending`} />
                  <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} icon={<DollarSign className="h-5 w-5" />} />
                  <StatCard title="Total Products" value={stats.totalProducts} icon={<Package className="h-5 w-5" />} subtitle={`${stats.activeProducts} active`} />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Users</p>
                          <p className="font-display text-3xl font-bold">{stats?.totalUsers || 0}</p>
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
                          <p className="font-display text-3xl font-bold">{stats?.totalProducts || 0}</p>
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
              )}

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Revenue & Orders</CardTitle>
                    <ToggleGroup
                      type="single"
                      value={timeRange}
                      onValueChange={(v) => v && setTimeRange(v)}
                      variant="outline"
                      size="sm"
                    >
                      <ToggleGroupItem value="7d">7d</ToggleGroupItem>
                      <ToggleGroupItem value="30d">30d</ToggleGroupItem>
                      <ToggleGroupItem value="90d">90d</ToggleGroupItem>
                      <ToggleGroupItem value="all">All</ToggleGroupItem>
                    </ToggleGroup>
                  </CardHeader>
                  <CardContent>
                    {chartLoading ? (
                      <div className="h-[250px] bg-muted rounded animate-pulse" />
                    ) : (
                      <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <AreaChart data={chartData}>
                            <defs>
                            <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1d72e9" stopOpacity={1.0} />
                              <stop offset="95%" stopColor="#1d72e9" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={
                              <ChartTooltipContent
                                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                indicator="dot"
                              />
                            }
                          />
                          <Area dataKey="revenue" type="natural" fill="url(#fillRevenue)" stroke="#1d72e9" />
                        </AreaChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">User Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {chartLoading ? (
                      <div className="h-[250px] bg-muted rounded animate-pulse" />
                    ) : (
                      <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <LineChart data={chartData}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                              const [year, month, day] = value.split('-').map(Number);
                              const date = new Date(year, month - 1, day);
                              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            }}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={
                              <ChartTooltipContent
                                labelFormatter={(value) => {
                                  const [year, month, day] = String(value).split('-').map(Number);
                                  const date = new Date(year, month - 1, day);
                                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                }}
                                indicator="dot"
                              />
                            }
                          />
                          <Line dataKey="users" type="natural" stroke="#e6915d" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Pie Charts */}
              {stats && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Orders by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Completed', value: stats.totalOrders - stats.pendingOrders, fill: PIE_COLORS[0] },
                              { name: 'Pending', value: stats.pendingOrders, fill: PIE_COLORS[1] },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                      <div className="flex justify-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[0] }} />
                          Completed
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[1] }} />
                          Pending
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Revenue Share</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Active Products', value: stats.activeProducts, fill: PIE_COLORS[0] },
                              { name: 'Other Products', value: stats.totalProducts - stats.activeProducts, fill: PIE_COLORS[2] },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                      <div className="flex justify-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[0] }} />
                          Active
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[2] }} />
                          Other
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Platform Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Users', value: stats.totalUsers, fill: PIE_COLORS[0] },
                              { name: 'Products', value: stats.totalProducts, fill: PIE_COLORS[1] },
                              { name: 'Orders', value: stats.totalOrders, fill: PIE_COLORS[2] },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                      <div className="flex justify-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[0] }} />
                          Users
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[1] }} />
                          Products
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[2] }} />
                          Orders
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Recent Activity */}
              {activity && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activity.orders.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No orders yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {activity.orders.slice(0, 5).map((order) => (
                            <div key={order.id} className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">{order.user.displayName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-display font-bold text-sm">${parseFloat(order.total).toFixed(2)}</p>
                                <Badge variant={orderStatusVariant[order.status] || 'secondary'} className="text-[10px]">
                                  {order.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">New Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activity.users.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No users yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {activity.users.slice(0, 5).map((u) => (
                            <div key={u.id} className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">{u.displayName}</p>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                              </div>
                              <div className="text-right">
                                <Badge variant={roleVariant[u.role] || 'outline'} className="text-[10px]">
                                  {u.role}
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {new Date(u.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-3">
                  <Button variant="outline" onClick={() => setActiveTab('users')}>
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
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

          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          {/* USERS TAB                                                                 */}
          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'users' && !selectedSeller && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold">User Management</h2>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-[250px]"
                />
                <Button variant="outline" onClick={fetchUsers}>
                  Search
                </Button>
              </div>

              {/* Users Table */}
              {usersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-14 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : users.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No users found.</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Store</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                {u.avatarUrl ? (
                                  <img src={`${API_BASE}${u.avatarUrl}`} alt="" className="h-full w-full rounded-full object-cover" />
                                ) : (
                                  u.displayName.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{u.displayName}</p>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={roleVariant[u.role] || 'outline'}>{u.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant[u.status] || 'secondary'}>{u.status}</Badge>
                          </TableCell>
                          <TableCell>
                            {u.sellerProfile ? (
                              <button
                                onClick={() => fetchSellerDetail(u.id)}
                                className="text-sm font-medium text-primary hover:underline cursor-pointer"
                              >
                                {u.sellerProfile.storeName}
                              </button>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {u.sellerProfile && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7"
                                  onClick={() => fetchSellerDetail(u.id)}
                                >
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Store
                                </Button>
                              )}
                              {u.status === 'active' ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-destructive"
                                  onClick={() => handleUserStatus(u.id, 'suspended')}
                                >
                                  <Ban className="h-3 w-3 mr-1" />
                                  Suspend
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-green-600"
                                  onClick={() => handleUserStatus(u.id, 'active')}
                                >
                                  <ShieldCheck className="h-3 w-3 mr-1" />
                                  Activate
                                </Button>
                              )}
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

          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          {/* SELLER DETAIL VIEW                                                        */}
          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'users' && selectedSeller && (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedSeller(null)}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Users
              </button>

              {/* Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold flex-shrink-0">
                      {selectedSeller.seller.avatarUrl ? (
                        <img src={`${API_BASE}${selectedSeller.seller.avatarUrl}`} alt="" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        selectedSeller.seller.displayName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="font-display text-2xl font-bold">{selectedSeller.seller.storeName || selectedSeller.seller.displayName}</h2>
                      <p className="text-sm text-muted-foreground">{selectedSeller.seller.email}</p>
                      {selectedSeller.seller.storeDescription && (
                        <p className="text-sm text-muted-foreground mt-1">{selectedSeller.seller.storeDescription}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant={statusVariant[selectedSeller.seller.storeStatus || ''] || 'secondary'}>
                          {selectedSeller.seller.storeStatus || 'No profile'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Joined {new Date(selectedSeller.seller.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Revenue" value={`$${selectedSeller.stats.totalRevenue.toFixed(2)}`} icon={<DollarSign className="h-5 w-5" />} />
                <StatCard title="Total Orders" value={selectedSeller.stats.totalOrders} icon={<ShoppingCart className="h-5 w-5" />} />
                <StatCard title="Products" value={selectedSeller.stats.productCount} icon={<Package className="h-5 w-5" />} />
                <StatCard title="Avg Rating" value={selectedSeller.stats.avgRating > 0 ? `${selectedSeller.stats.avgRating} ★` : '—'} icon={<Star className="h-5 w-5" />} subtitle={`${selectedSeller.stats.reviewCount} reviews`} />
              </div>

              {/* Chart */}
              {selectedSeller.chart.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Revenue Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                      <AreaChart data={selectedSeller.chart}>
                        <defs>
                          <linearGradient id="fillSellerRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1d72e9" stopOpacity={1.0} />
                            <stop offset="95%" stopColor="#1d72e9" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                              const [year, month, day] = value.split('-').map(Number);
                              const date = new Date(year, month - 1, day);
                              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            }}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={
                              <ChartTooltipContent
                                labelFormatter={(value) => {
                                  const [year, month, day] = String(value).split('-').map(Number);
                                  const date = new Date(year, month - 1, day);
                                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                }}
                                indicator="dot"
                              />
                          }
                        />
                        <Area dataKey="revenue" type="natural" fill="url(#fillSellerRevenue)" stroke="#1d72e9" />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}

              {/* Products Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Products ({selectedSeller.products.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedSeller.products.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No products.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Image</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Sold</TableHead>
                          <TableHead>Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSeller.products.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>
                              <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted">
                                {p.image ? (
                                  <img src={`${API_BASE}${p.image}`} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-muted-foreground text-[10px]">N/A</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{p.title}</TableCell>
                            <TableCell className="text-muted-foreground">{p.category || '—'}</TableCell>
                            <TableCell className="font-display font-bold">${parseFloat(p.price).toFixed(2)}</TableCell>
                            <TableCell>{p.stock}</TableCell>
                            <TableCell>
                              <Badge variant={p.status === 'ACTIVE' ? 'default' : p.status === 'OUT_OF_STOCK' ? 'secondary' : 'destructive'}>
                                {p.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{p.unitsSold}</TableCell>
                            <TableCell className="font-display font-bold">${p.revenue.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Recent Orders */}
              {selectedSeller.recentOrders.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Buyer</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSeller.recentOrders.map((order: any) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <p className="text-sm font-medium">{order.user?.displayName}</p>
                              <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                            </TableCell>
                            <TableCell>
                              {order.items.map((item: any, i: number) => (
                                <p key={i} className="text-xs">{item.product?.title || item.title} × {item.quantity}</p>
                              ))}
                            </TableCell>
                            <TableCell className="font-display font-bold">${parseFloat(order.total).toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={orderStatusVariant[order.status] || 'secondary'}>{order.status}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          {/* CATEGORIES TAB                                                            */}
          {/* ═══════════════════════════════════════════════════════════════════════════ */}
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

          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          {/* SELLER APPLICATIONS TAB                                                   */}
          {/* ═══════════════════════════════════════════════════════════════════════════ */}
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
