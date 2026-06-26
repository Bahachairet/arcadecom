const prisma = require("../../prisma/prisma");

const findAll = async (filters = {}) => {
  const where = { status: { in: ["ACTIVE", "OUT_OF_STOCK"] } };

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = parseFloat(filters.minPrice);
    if (filters.maxPrice) where.price.lte = parseFloat(filters.maxPrice);
  }

  if (filters.sellerId) {
    where.sellerId = filters.sellerId;
  }

  if (filters.sellerName) {
    where.seller = { displayName: { contains: filters.sellerName, mode: "insensitive" } };
  }

  if (filters.minRating) {
    where.reviews = { some: { rating: { gte: parseInt(filters.minRating, 10) } } };
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const orderBy = {};
  if (filters.sort === "newest") {
    orderBy.createdAt = "desc";
  } else if (filters.sort === "price_asc") {
    orderBy.price = "asc";
  } else if (filters.sort === "price_desc") {
    orderBy.price = "desc";
  } else if (filters.sort === "popular") {
    orderBy.createdAt = "desc";
  } else {
    orderBy.createdAt = "desc";
  }

  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 12;
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: true,
        category: { select: { id: true, name: true, slug: true } },
        seller: { select: { id: true, displayName: true, avatarUrl: true } },
        reviews: { select: { rating: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const productsWithRating = products.map((p) => {
    const avgRating = p.reviews.length > 0
      ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
      : 0;
    return { ...p, avgRating, reviewCount: p.reviews.length };
  });

  return {
    products: productsWithRating,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

const findAllSimple = async (filters = {}) => {
  const where = { status: { in: ["ACTIVE", "OUT_OF_STOCK"] } };

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const orderBy = {};
  if (filters.sort === "newest") {
    orderBy.createdAt = "desc";
  } else if (filters.sort === "price_asc") {
    orderBy.price = "asc";
  } else if (filters.sort === "price_desc") {
    orderBy.price = "desc";
  } else {
    orderBy.createdAt = "desc";
  }

  return prisma.product.findMany({
    where,
    include: {
      images: true,
      category: { select: { id: true, name: true, slug: true } },
      seller: { select: { id: true, displayName: true } },
    },
    orderBy,
    ...(filters.limit ? { take: parseInt(filters.limit, 10) } : {}),
  });
};

const findById = async (id) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      category: { select: { id: true, name: true, slug: true } },
      seller: { select: { id: true, displayName: true, avatarUrl: true } },
    },
  });
};

const findSellerProducts = async (sellerId) => {
  return prisma.product.findMany({
    where: { sellerId },
    include: {
      images: true,
      category: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const create = async (data) => {
  return prisma.product.create({
    data: {
      sellerId: data.sellerId,
      categoryId: data.categoryId,
      title: data.title,
      description: data.description,
      price: data.price,
      type: data.type,
      stock: data.stock,
      fileUrl: data.fileUrl || null,
    },
    include: { images: true },
  });
};

const addImages = async (productId, images) => {
  const data = images.map((img) => ({
    productId,
    url: `/uploads/products/${img.filename}`,
    altText: null,
  }));

  return prisma.productImage.createMany({ data });
};

const update = async (id, data) => {
  return prisma.product.update({
    where: { id },
    data,
    include: { images: true },
  });
};

const remove = async (id) => {
  return prisma.$transaction(async (tx) => {
    await tx.cartItem.deleteMany({ where: { productId: id } });
    await tx.review.deleteMany({ where: { productId: id } });
    await tx.orderItem.updateMany({ where: { productId: id }, data: { productId: null } });
    return tx.product.delete({ where: { id } });
  });
};

const findSellerProductById = async (id, sellerId) => {
  return prisma.product.findFirst({
    where: { id, sellerId },
    include: { images: true },
  });
};

module.exports = {
  findAll,
  findAllSimple,
  findById,
  findSellerProducts,
  create,
  addImages,
  update,
  remove,
  findSellerProductById,
};
