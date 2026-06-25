const { Router } = require("express");
const { requireAuth, requireRole } = require("../../middleware/auth");
const upload = require("../../middleware/upload");
const { processUploads } = require("../../middleware/imageOptimize");
const {
  createBidProductHandler,
  getBidProductHandler,
  getSellerBidProductsHandler,
  getActiveAuctionsHandler,
  getAllBidProductsHandler,
  updateBidProductHandler,
  cancelBidProductHandler,
  endAuctionHandler,
} = require("./bidproduct.controller");

const router = Router();

router.get("/active", getActiveAuctionsHandler);
router.get("/seller", requireAuth, requireRole("seller"), getSellerBidProductsHandler);
router.get("/", getAllBidProductsHandler);
router.get("/:id", getBidProductHandler);
router.post("/", requireAuth, requireRole("seller"), upload.array("images", 5), processUploads, createBidProductHandler);
router.put("/:id", requireAuth, requireRole("seller"), updateBidProductHandler);
router.patch("/:id/cancel", requireAuth, requireRole("seller"), cancelBidProductHandler);
router.patch("/:id/end", requireAuth, requireRole("seller"), endAuctionHandler);

module.exports = router;
