const express = require("express");
const router = express.Router();
const productController = require("./product.controller");
const { requireAuth, requireRole } = require("../../middleware/auth");
const upload = require("../../middleware/upload");
const { processUploads } = require("../../middleware/imageOptimize");

router.get("/", productController.getAll);
router.get("/seller", requireAuth, requireRole("seller"), productController.getSellerProducts);
router.get("/:id", productController.getById);

router.post(
  "/",
  requireAuth,
  requireRole("seller"),
  upload.array("images", 5),
  processUploads,
  productController.create
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("seller"),
  upload.array("images", 5),
  processUploads,
  productController.update
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("seller"),
  productController.remove
);

router.patch(
  "/:id/archive",
  requireAuth,
  requireRole("seller"),
  productController.archive
);

module.exports = router;
