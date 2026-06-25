const prisma = require("../../prisma/prisma");

const findAll = async (filters = {}) => {
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

  return prisma.product.findMany({
    where,
    include: {
      images: true,
      category: { select: { id: true, name: true, slug: true } },
      seller: { select: { id: true, displayName: true } },
    },
    orderBy: { createdAt: "desc" },
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
  findById,
  findSellerProducts,
  create,
  addImages,
  update,
  remove,
  findSellerProductById,
};
