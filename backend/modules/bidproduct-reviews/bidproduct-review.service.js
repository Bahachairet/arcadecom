const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  findByBidProduct,
  findUserReview,
  create,
  update,
  remove,
  getSummary,
} = require("./bidproduct-review.repository");
const { findById } = require("../bidproducts/bidproduct.repository");

const getReviews = async (bidProductId) => {
  const reviews = await findByBidProduct(bidProductId);
  const summary = await getSummary(bidProductId);
  return { reviews, summary };
};

const createReview = async (userId, bidProductId, rating, comment) => {
  const bidProduct = await findById(bidProductId);
  if (!bidProduct) {
    throw new Error("Auction not found");
  }

  if (bidProduct.status !== "ENDED" || !bidProduct.winnerId) {
    throw new Error("Can only review ended auctions with a winner");
  }

  if (bidProduct.winnerId !== userId) {
    throw new Error("Only the winner can review this auction");
  }

  const existing = await findUserReview(userId, bidProductId);
  if (existing) {
    throw new Error("You already reviewed this auction");
  }

  return create(userId, bidProductId, rating, comment);
};

const updateReview = async (reviewId, userId, rating, comment) => {
  const review = await prisma.bidProductReview.findUnique({ where: { id: reviewId } });

  if (!review) {
    throw new Error("Review not found");
  }
  if (review.userId !== userId) {
    throw new Error("Not authorized");
  }

  return update(reviewId, rating, comment);
};

const deleteReview = async (reviewId, userId) => {
  const review = await prisma.bidProductReview.findUnique({ where: { id: reviewId } });

  if (!review) {
    throw new Error("Review not found");
  }
  if (review.userId !== userId) {
    throw new Error("Not authorized");
  }

  return remove(reviewId);
};

module.exports = { getReviews, createReview, updateReview, deleteReview };
