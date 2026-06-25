const { Router } = require("express");
const { requireAuth } = require("../../middleware/auth");
const {
  getReviewsHandler,
  createReviewHandler,
  updateReviewHandler,
  deleteReviewHandler,
} = require("./bidproduct-review.controller");

const router = Router();

router.get("/:bidProductId", getReviewsHandler);
router.post("/:bidProductId", requireAuth, createReviewHandler);
router.put("/:id", requireAuth, updateReviewHandler);
router.delete("/:id", requireAuth, deleteReviewHandler);

module.exports = router;
