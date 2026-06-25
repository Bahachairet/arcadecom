const reviewService = require("./review.service");

const getReviewsByProduct = async (req, res) => {
  try {
    const result = await reviewService.getReviewsByProduct(req.params.productId);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }
    const review = await reviewService.create(
      req.user.id,
      req.params.productId,
      parseInt(rating, 10),
      comment
    );
    return res.status(201).json({ review });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }
    const review = await reviewService.update(
      req.user.id,
      req.params.reviewId,
      parseInt(rating, 10),
      comment
    );
    return res.json({ review });
  } catch (error) {
    const status = error.message === "Review not found" ? 404 : 403;
    return res.status(status).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    await reviewService.remove(req.user.id, req.params.reviewId);
    return res.json({ message: "Review deleted" });
  } catch (error) {
    const status = error.message === "Review not found" ? 404 : 403;
    return res.status(status).json({ message: error.message });
  }
};

module.exports = { getReviewsByProduct, createReview, updateReview, deleteReview };
