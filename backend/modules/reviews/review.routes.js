const express = require("express");
const router = express.Router();
const reviewController = require("./review.controller");
const { requireAuth } = require("../../middleware/auth");

router.get("/product/:productId", reviewController.getReviewsByProduct);
router.post("/product/:productId", requireAuth, reviewController.createReview);
router.patch("/:reviewId", requireAuth, reviewController.updateReview);
router.delete("/:reviewId", requireAuth, reviewController.deleteReview);

module.exports = router;
