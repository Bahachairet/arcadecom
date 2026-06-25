const {
  findReviewByUserAndProduct,
  findReviewsByProduct,
  createReview,
  updateReview,
  deleteReview,
  hasPurchasedProduct,
  getProductRatingSummary,
} = require("./review.repository");

const getReviewsByProduct = async (productId) => {
  const [reviews, summary] = await Promise.all([
    findReviewsByProduct(productId),
    getProductRatingSummary(productId),
  ]);
  return { reviews, summary };
};

const create = async (userId, productId, rating, comment) => {
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const existing = await findReviewByUserAndProduct(userId, productId);
  if (existing) {
    throw new Error("You have already reviewed this product");
  }

  const purchased = await hasPurchasedProduct(userId, productId);
  if (!purchased) {
    throw new Error("You can only review products you have purchased");
  }

  return createReview(userId, productId, rating, comment);
};

const update = async (userId, reviewId, rating, comment) => {
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const existing = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!existing) throw new Error("Review not found");
  if (existing.userId !== userId) throw new Error("Unauthorized");

  return updateReview(reviewId, rating, comment);
};

const remove = async (userId, reviewId) => {
  const existing = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!existing) throw new Error("Review not found");
  if (existing.userId !== userId) throw new Error("Unauthorized");

  return deleteReview(reviewId);
};

const prisma = require("../../prisma/prisma");

module.exports = { getReviewsByProduct, create, update, remove };
