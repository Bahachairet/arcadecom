const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const findByBidProduct = async (bidProductId) => {
  return prisma.bidProductReview.findMany({
    where: { bidProductId },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const findUserReview = async (userId, bidProductId) => {
  return prisma.bidProductReview.findUnique({
    where: { userId_bidProductId: { userId, bidProductId } },
  });
};

const create = async (userId, bidProductId, rating, comment) => {
  return prisma.bidProductReview.create({
    data: { userId, bidProductId, rating, comment },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true } },
    },
  });
};

const update = async (id, rating, comment) => {
  return prisma.bidProductReview.update({
    where: { id },
    data: { rating, comment },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true } },
    },
  });
};

const remove = async (id) => {
  return prisma.bidProductReview.delete({ where: { id } });
};

const getSummary = async (bidProductId) => {
  const result = await prisma.bidProductReview.aggregate({
    where: { bidProductId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return {
    average: result._avg.rating || 0,
    count: result._count.rating,
  };
};

module.exports = { findByBidProduct, findUserReview, create, update, remove, getSummary };
