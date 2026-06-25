const {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} = require("./bidproduct-review.service");

const getReviewsHandler = async (req, res) => {
  try {
    const result = await getReviews(req.params.bidProductId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createReviewHandler = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await createReview(
      req.user.id,
      req.params.bidProductId,
      parseInt(rating),
      comment
    );
    res.status(201).json({ review });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateReviewHandler = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await updateReview(
      req.params.id,
      req.user.id,
      parseInt(rating),
      comment
    );
    res.json({ review });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteReviewHandler = async (req, res) => {
  try {
    await deleteReview(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getReviewsHandler,
  createReviewHandler,
  updateReviewHandler,
  deleteReviewHandler,
};
