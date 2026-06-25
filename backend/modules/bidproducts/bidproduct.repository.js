const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const create = async (data, imageUrls) => {
  return prisma.$transaction(async (tx) => {
    const bidProduct = await tx.bidProduct.create({
      data: {
        sellerId: data.sellerId,
        title: data.title,
        description: data.description,
        startingPrice: data.startingPrice,
        minIncrement: data.minIncrement,
        currentPrice: data.startingPrice,
        startTime: data.startTime,
        endTime: data.endTime,
        status: new Date(data.startTime) > new Date() ? "UPCOMING" : "ACTIVE",
      },
    });

    if (imageUrls && imageUrls.length > 0) {
      await tx.bidProductImage.createMany({
        data: imageUrls.map((url) => ({
          bidProductId: bidProduct.id,
          url,
        })),
      });
    }

    return tx.bidProduct.findUnique({
      where: { id: bidProduct.id },
      include: {
        images: true,
        seller: { select: { id: true, displayName: true, avatarUrl: true } },
        bids: {
          include: {
            bidder: { select: { id: true, displayName: true, avatarUrl: true } },
          },
        },
      },
    });
  });
};

const findById = async (id) => {
  return prisma.bidProduct.findUnique({
    where: { id },
    include: {
      images: true,
      seller: { select: { id: true, displayName: true, avatarUrl: true } },
      winner: { select: { id: true, displayName: true, avatarUrl: true } },
      bids: {
        include: {
          bidder: { select: { id: true, displayName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
};

const findMany = async (filters = {}) => {
  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.sellerId) {
    where.sellerId = filters.sellerId;
  }

  return prisma.bidProduct.findMany({
    where,
    include: {
      images: { take: 1 },
      seller: { select: { id: true, displayName: true } },
      bids: {
        include: {
          bidder: { select: { id: true, displayName: true, avatarUrl: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const findActive = async () => {
  return prisma.bidProduct.findMany({
    where: {
      status: "ACTIVE",
      endTime: { gt: new Date() },
    },
    include: {
      images: { take: 1 },
      seller: { select: { id: true, displayName: true } },
      bids: { select: { id: true } },
    },
    orderBy: { endTime: "asc" },
  });
};

const update = async (id, data) => {
  return prisma.bidProduct.update({
    where: { id },
    data,
    include: {
      images: true,
      seller: { select: { id: true, displayName: true, avatarUrl: true } },
      bids: {
        include: {
          bidder: { select: { id: true, displayName: true, avatarUrl: true } },
        },
      },
      winner: { select: { id: true, displayName: true, avatarUrl: true } },
    },
  });
};

const remove = async (id) => {
  return prisma.bidProduct.delete({ where: { id } });
};

const findExpiredActive = async () => {
  return prisma.bidProduct.findMany({
    where: {
      status: "ACTIVE",
      endTime: { lte: new Date() },
    },
    include: {
      bids: {
        orderBy: { amount: "desc" },
        take: 1,
        select: { bidderId: true, amount: true },
      },
    },
  });
};

const updateStatus = async (id, status, winnerId = null) => {
  return prisma.bidProduct.update({
    where: { id },
    data: { status, winnerId },
  });
};

module.exports = {
  create,
  findById,
  findMany,
  findActive,
  update,
  remove,
  findExpiredActive,
  updateStatus,
};
