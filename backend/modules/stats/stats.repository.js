const prisma = require("../../prisma/prisma");

// ── Seller Stats (scoped to authenticated seller) ──

const getSellerOverview = async (sellerId) => {
  const [revenueResult, orderCount, productCount, activeProducts, reviewResult] =
    await Promise.all([
      prisma.orderItem.aggregate({
        where: { sellerId, order: { status: "COMPLETED" } },
        _sum: { unitPrice: true, quantity: true },
      }),
      prisma.order.count({
        where: { items: { some: { sellerId } }, status: "COMPLETED" },
      }),
      prisma.product.count({ where: { sellerId } }),
      prisma.product.count({ where: { sellerId, status: "ACTIVE" } }),
      prisma.review.aggregate({
        where: { product: { sellerId } },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

  const totalRevenue = Number(revenueResult._sum.unitPrice || 0);
  const itemsSold = Number(revenueResult._sum.quantity || 0);

  return {
    totalRevenue,
    totalOrders: orderCount,
    itemsSold,
    totalProducts: productCount,
    activeProducts,
    avgRating: reviewResult._avg.rating
      ? Math.round(reviewResult._avg.rating * 10) / 10
      : 0,
    reviewCount: reviewResult._count.rating,
  };
};

const getSellerChart = async (sellerId, period = "daily") => {
  const now = new Date();
  let startDate;

  if (period === "daily") {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 30);
  } else if (period === "weekly") {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 90);
  } else {
    startDate = new Date(now);
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  const orderItems = await prisma.orderItem.findMany({
    where: {
      sellerId,
      order: { status: "COMPLETED", createdAt: { gte: startDate } },
    },
    include: { order: { select: { createdAt: true } } },
  });

  const grouped = {};
  for (const item of orderItems) {
    const date = item.order.createdAt;
    let key;

    if (period === "daily") {
      key = date.toISOString().split("T")[0];
    } else if (period === "weekly") {
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      key = weekStart.toISOString().split("T")[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    if (!grouped[key]) {
      grouped[key] = { date: key, revenue: 0, orders: new Set() };
    }
    grouped[key].revenue += Number(item.unitPrice) * item.quantity;
    grouped[key].orders.add(item.orderId);
  }

  return Object.values(grouped)
    .map((g) => ({ date: g.date, revenue: Math.round(g.revenue * 100) / 100, orders: g.orders.size }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

const getSellerTopProducts = async (sellerId, limit = 10) => {
  const items = await prisma.orderItem.findMany({
    where: { sellerId, order: { status: "COMPLETED" } },
    include: {
      product: {
        include: { images: true, category: { select: { name: true } } },
      },
    },
  });

  const productMap = {};
  for (const item of items) {
    if (!item.productId) continue;
    if (!productMap[item.productId]) {
      productMap[item.productId] = {
        product: item.product,
        unitsSold: 0,
        revenue: 0,
      };
    }
    productMap[item.productId].unitsSold += item.quantity;
    productMap[item.productId].revenue += Number(item.unitPrice) * item.quantity;
  }

  return Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map((p) => ({
      product: {
        id: p.product.id,
        title: p.product.title,
        price: p.product.price,
        image: p.product.images[0]?.url || null,
        category: p.product.category?.name || null,
      },
      unitsSold: p.unitsSold,
      revenue: Math.round(p.revenue * 100) / 100,
    }));
};

// ── Admin Stats (platform-wide) ──

const getAdminOverview = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalUsers, newUsersThisMonth, totalProducts, activeProducts, totalOrders, revenueResult, pendingOrders, pendingSellers] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.product.count(),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: "COMPLETED" },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.sellerProfile.count({ where: { status: "PENDING" } }),
    ]);

  return {
    totalUsers,
    newUsersThisMonth,
    totalProducts,
    activeProducts,
    totalOrders,
    totalRevenue: Number(revenueResult._sum.total || 0),
    pendingOrders,
    pendingSellers,
  };
};

const getAdminChart = async (period = "daily") => {
  const now = new Date();
  let startDate;

  if (period === "daily") {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 30);
  } else if (period === "weekly") {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 90);
  } else {
    startDate = new Date(now);
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  const [orders, users] = await Promise.all([
    prisma.order.findMany({
      where: { status: "COMPLETED", createdAt: { gte: startDate } },
      select: { id: true, total: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: startDate } },
      select: { id: true, createdAt: true },
    }),
  ]);

  const revenueGrouped = {};
  for (const order of orders) {
    const date = order.createdAt;
    let key;
    if (period === "daily") {
      key = date.toISOString().split("T")[0];
    } else if (period === "weekly") {
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      key = weekStart.toISOString().split("T")[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }
    if (!revenueGrouped[key]) {
      revenueGrouped[key] = { date: key, revenue: 0, orders: 0 };
    }
    revenueGrouped[key].revenue += Number(order.total);
    revenueGrouped[key].orders += 1;
  }

  const userGrouped = {};
  for (const user of users) {
    const date = user.createdAt;
    let key;
    if (period === "daily") {
      key = date.toISOString().split("T")[0];
    } else if (period === "weekly") {
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      key = weekStart.toISOString().split("T")[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }
    if (!userGrouped[key]) {
      userGrouped[key] = { date: key, users: 0 };
    }
    userGrouped[key].users += 1;
  }

  const allDates = new Set([
    ...Object.keys(revenueGrouped),
    ...Object.keys(userGrouped),
  ]);

  const chart = Array.from(allDates)
    .sort()
    .map((date) => ({
      date,
      revenue: Math.round((revenueGrouped[date]?.revenue || 0) * 100) / 100,
      orders: revenueGrouped[date]?.orders || 0,
      users: userGrouped[date]?.users || 0,
    }));

  return chart;
};

const getRecentActivity = async () => {
  const [recentOrders, recentUsers] = await Promise.all([
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, displayName: true, email: true } },
        items: { select: { title: true, quantity: true, unitPrice: true } },
      },
    }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        displayName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  return { orders: recentOrders, users: recentUsers };
};

// ── Admin: Seller Management ──

const getAllSellers = async () => {
  const sellers = await prisma.user.findMany({
    where: { role: "seller" },
    include: {
      sellerProfile: { select: { storeName: true, status: true } },
      products: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const sellerIds = sellers.map((s) => s.id);

  const revenueData = await prisma.orderItem.groupBy({
    by: ["sellerId"],
    where: {
      sellerId: { in: sellerIds },
      order: { status: "COMPLETED" },
    },
    _sum: { unitPrice: true, quantity: true },
    _count: { orderId: true },
  });

  const revenueMap = {};
  for (const r of revenueData) {
    revenueMap[r.sellerId] = {
      totalRevenue: Number(r._sum.unitPrice || 0),
      itemsSold: Number(r._sum.quantity || 0),
      totalOrders: r._count.orderId,
    };
  }

  return sellers.map((s) => ({
    user: {
      id: s.id,
      displayName: s.displayName,
      email: s.email,
      createdAt: s.createdAt,
      avatarUrl: s.avatarUrl,
    },
    storeName: s.sellerProfile?.storeName || null,
    storeStatus: s.sellerProfile?.status || null,
    productCount: s.products.length,
    totalRevenue: revenueMap[s.id]?.totalRevenue || 0,
    totalOrders: revenueMap[s.id]?.totalOrders || 0,
    itemsSold: revenueMap[s.id]?.itemsSold || 0,
  }));
};

const getSellerDetail = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      sellerProfile: { select: { storeName: true, status: true, description: true, createdAt: true } },
    },
  });

  if (!user) return null;

  const [products, revenueData, recentOrdersRaw, reviewResult] = await Promise.all([
    prisma.product.findMany({
      where: { sellerId: userId },
      include: {
        images: true,
        category: { select: { name: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.orderItem.findMany({
      where: { sellerId: userId, order: { status: "COMPLETED" } },
      include: {
        order: { select: { id: true, createdAt: true, total: true } },
        product: { select: { id: true, title: true, images: { select: { url: true } } } },
      },
    }),
    prisma.order.findMany({
      where: { items: { some: { sellerId: userId } } },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, displayName: true, email: true } },
        items: {
          where: { sellerId: userId },
          include: { product: { select: { title: true } } },
        },
      },
    }),
    prisma.review.aggregate({
      where: { product: { sellerId: userId } },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  let totalRevenue = 0;
  let itemsSold = 0;
  const orderIds = new Set();
  for (const item of revenueData) {
    totalRevenue += Number(item.unitPrice) * item.quantity;
    itemsSold += item.quantity;
    orderIds.add(item.orderId);
  }

  const productsWithStats = products.map((p) => {
    const pItems = revenueData.filter((ri) => ri.productId === p.id);
    const pUnits = pItems.reduce((sum, ri) => sum + ri.quantity, 0);
    const pRevenue = pItems.reduce((sum, ri) => sum + Number(ri.unitPrice) * ri.quantity, 0);
    const avgRating =
      p.reviews.length > 0
        ? Math.round((p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length) * 10) / 10
        : 0;
    return {
      id: p.id,
      title: p.title,
      price: p.price,
      type: p.type,
      stock: p.stock,
      status: p.status,
      image: p.images[0]?.url || null,
      category: p.category?.name || null,
      unitsSold: pUnits,
      revenue: Math.round(pRevenue * 100) / 100,
      avgRating,
      reviewCount: p.reviews.length,
    };
  });

  // Chart data
  const chartGrouped = {};
  for (const item of revenueData) {
    const date = item.order.createdAt;
    const key = date.toISOString().split("T")[0];
    if (!chartGrouped[key]) {
      chartGrouped[key] = { date: key, revenue: 0, orders: new Set() };
    }
    chartGrouped[key].revenue += Number(item.unitPrice) * item.quantity;
    chartGrouped[key].orders.add(item.orderId);
  }
  const chart = Object.values(chartGrouped)
    .map((g) => ({ date: g.date, revenue: Math.round(g.revenue * 100) / 100, orders: g.orders.size }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    seller: {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      storeName: user.sellerProfile?.storeName || null,
      storeStatus: user.sellerProfile?.status || null,
      storeDescription: user.sellerProfile?.description || null,
    },
    stats: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: orderIds.size,
      itemsSold,
      productCount: products.length,
      avgRating: reviewResult._avg.rating
        ? Math.round(reviewResult._avg.rating * 10) / 10
        : 0,
      reviewCount: reviewResult._count.rating,
    },
    products: productsWithStats,
    recentOrders: recentOrdersRaw,
    chart,
  };
};

module.exports = {
  getSellerOverview,
  getSellerChart,
  getSellerTopProducts,
  getAdminOverview,
  getAdminChart,
  getRecentActivity,
  getAllSellers,
  getSellerDetail,
};
