import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { StatCard } from '@/components/StatCard';
import { Plus, MoreHorizontal, Pencil, Trash2, DollarSign, ShoppingCart, Package, Star, TrendingUp } from 'lucide-react';
import SellerOrders from '@/pages/SellerOrders';
import SellerReviews from '@/pages/SellerReviews';
import SellerMessages from '@/pages/SellerMessages';
import SellerAuctions from '@/pages/SellerAuctions';

const API_BASE = 'http://localhost:5000';

interface Product {
  id: string;
  title: string;
  price: string;
  type: string;
  stock: number;
  status: string;
  createdAt: string;
  images: { url: string }[];
  category: { name: string };
}

interface SellerStats {
  totalRevenue: number;
  totalOrders: number;
  itemsSold: number;
  totalProducts: number;
  activeProducts: number;
  avgRating: number;
  reviewCount: number;
}

interface ChartData {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  product: {
    id: string;
    title: string;
    price: string;
    image: string | null;
    category: string | null;
  };
  unitsSold: number;
  revenue: number;
}

const typeLabels: Record<string, string> = { PHYSICAL: 'Physical', DIGITAL: 'Digital', COLLECTIBLE: 'Collectible' };
const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  ACTIVE: 'default',
  OUT_OF_STOCK: 'secondary',
  ARCHIVED: 'destructive',
};

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: '#1d72e9',
  },
  orders: {
    label: 'Orders',
    color: '#e6915d',
  },
} satisfies ChartConfig;

export default function SellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'sales' | 'reviews' | 'messages' | 'auctions'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [timeRange, setTimeRange] = useState('30d');
  const [chartLoading, setChartLoading] = useState(true);

  const fetchChartData = useCallback(async (period: string) => {
    setChartLoading(true);
    try {
      const periodMap: Record<string, string> = { '7d': 'daily', '30d': 'daily', '90d': 'weekly', 'all': 'monthly' };
      const [chartRes, topRes] = await Promise.all([
        api.get('/stats/seller/chart', { params: { period: periodMap[period] || 'daily' } }),
        api.get('/stats/seller/top-products'),
      ]);
      setChartData(chartRes.data);
      setTopProducts(topRes.data);
    } catch {
      // stats endpoint might not exist yet
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/');
      return;
    }
    Promise.all([
      api.get('/products/seller'),
      api.get('/stats/seller').catch(() => null),
    ])
      .then(([productsRes, statsRes]) => {
        setProducts(productsRes.data.products);
        if (statsRes) setStats(statsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchChartData(timeRange);
    }
  }, [activeTab, timeRange, fetchChartData]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Archive this product? It will no longer appear in the marketplace.')) return;
    try {
      const res = await api.patch(`/products/${id}/archive`);
      setProducts((prev) => prev.map((p) => (p.id === id ? res.data.product : p)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to archive product');
    }
  };

  if (!user || user.role !== 'seller') return null;

  return (
    <SidebarProvider>
      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <SidebarInset>
        <SiteHeader title={activeTab === 'products' ? 'My Products' : activeTab === 'sales' ? 'Sales' : activeTab === 'reviews' ? 'Reviews' : activeTab === 'messages' ? 'Messages' : 'Auctions'} />
        <div className="flex-1 p-6">
          {activeTab === 'products' ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl font-bold">My Products</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage your listings and inventory.
                  </p>
                </div>
                <Button asChild>
                  <Link to="/seller/products/new">
                    <Plus className="mr-2 h-4 w-4" />
                    New Product
                  </Link>
                </Button>
              </div>

              {/* KPI Cards */}
              {stats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} icon={<DollarSign className="h-5 w-5" />} />
                  <StatCard title="Total Orders" value={stats.totalOrders} icon={<ShoppingCart className="h-5 w-5" />} />
                  <StatCard title="Active Products" value={stats.activeProducts} icon={<Package className="h-5 w-5" />} />
                  <StatCard title="Items Sold" value={stats.itemsSold} icon={<TrendingUp className="h-5 w-5" />} />
                  <StatCard title="Avg Rating" value={stats.avgRating > 0 ? `${stats.avgRating} ★` : '—'} icon={<Star className="h-5 w-5" />} subtitle={`${stats.reviewCount} reviews`} />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Total Products</p>
                      <p className="font-display text-3xl font-bold">{products.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Active</p>
                      <p className="font-display text-3xl font-bold">
                        {products.filter((p) => p.status === 'ACTIVE').length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Out of Stock</p>
                      <p className="font-display text-3xl font-bold">
                        {products.filter((p) => p.status === 'OUT_OF_STOCK').length}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Charts + Top Products */}
              {stats && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {/* Revenue Chart */}
                  <Card className="lg:col-span-2">
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
                                  labelFormatter={(value) =>
                                    new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                  }
                                  indicator="dot"
                                />
                              }
                            />
                            <Area
                              dataKey="revenue"
                              type="natural"
                              fill="url(#fillRevenue)"
                              stroke="#1d72e9"
                            />
                          </AreaChart>
                        </ChartContainer>
                      )}
                    </CardContent>
                  </Card>

                  {/* Top Products */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Top Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {topProducts.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No sales data yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {topProducts.slice(0, 5).map((tp) => (
                            <div key={tp.product.id} className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                {tp.product.image ? (
                                  <img src={`${API_BASE}${tp.product.image}`} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-muted-foreground text-[10px]">N/A</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{tp.product.title}</p>
                                <p className="text-xs text-muted-foreground">{tp.unitsSold} sold</p>
                              </div>
                              <p className="font-display font-bold text-sm">${tp.revenue.toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Products Table */}
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-14 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">No products yet.</p>
                    <Button asChild>
                      <Link to="/seller/products/new">Create your first product</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Image</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted">
                              {p.images[0] ? (
                                <img
                                  src={`${API_BASE}${p.images[0].url}`}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-[10px]">
                                  N/A
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{p.title}</TableCell>
                          <TableCell className="text-muted-foreground">{p.category.name}</TableCell>
                          <TableCell>{typeLabels[p.type]}</TableCell>
                          <TableCell className="font-display font-bold">
                            ${parseFloat(p.price).toFixed(2)}
                          </TableCell>
                          <TableCell>{p.stock}</TableCell>
                          <TableCell>
                            <Badge variant={statusVariant[p.status] || 'secondary'}>
                              {p.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => navigate(`/seller/products/${p.id}/edit`)}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                {p.status !== 'ARCHIVED' && (
                                  <DropdownMenuItem
                                    onClick={() => handleArchive(p.id)}
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Archive
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(p.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </>
          ) : activeTab === 'sales' ? (
            <SellerOrders />
          ) : activeTab === 'reviews' ? (
            <SellerReviews />
          ) : activeTab === 'messages' ? (
            <SellerMessages />
          ) : (
            <SellerAuctions />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
