const prisma = require("../../prisma/prisma");

const findReviewByUserAndProduct = async (userId, productId) => {
  return prisma.review.findUnique({
    where: { userId_productId: { userId, productId } },
  });
};

const findReviewsByProduct = async (productId) => {
  return prisma.review.findMany({
    where: { productId },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const createReview = async (userId, productId, rating, comment) => {
  return prisma.review.create({
    data: { userId, productId, rating, comment },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true } },
    },
  });
};

const updateReview = async (reviewId, rating, comment) => {
  return prisma.review.update({
    where: { id: reviewId },
    data: { rating, comment },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true } },
    },
  });
};

const deleteReview = async (reviewId) => {
  return prisma.review.delete({ where: { id: reviewId } });
};

const hasPurchasedProduct = async (userId, productId) => {
  const count = await prisma.orderItem.count({
    where: {
      product: { id: productId },
      order: {
        userId,
        status: "COMPLETED",
      },
    },
  });
  return count > 0;
};

const getProductRatingSummary = async (productId) => {
  const result = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return {
    average: result._avg.rating || 0,
    count: result._count.rating,
  };
};

module.exports = {
  findReviewByUserAndProduct,
  findReviewsByProduct,
  createReview,
  updateReview,
  deleteReview,
  hasPurchasedProduct,
  getProductRatingSummary,
};
