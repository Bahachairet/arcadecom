const express = require("express");
const router = express.Router();
const statsController = require("./stats.controller");
const { requireAuth, requireRole } = require("../../middleware/auth");

// ── Seller Stats (authenticated seller) ──
router.get("/seller", requireAuth, requireRole("seller"), statsController.getSellerOverview);
router.get("/seller/chart", requireAuth, requireRole("seller"), statsController.getSellerChart);
router.get("/seller/top-products", requireAuth, requireRole("seller"), statsController.getSellerTopProducts);

// ── Admin Stats (admin only) ──
router.get("/admin", requireAuth, requireRole("admin"), statsController.getAdminOverview);
router.get("/admin/chart", requireAuth, requireRole("admin"), statsController.getAdminChart);
router.get("/admin/recent-activity", requireAuth, requireRole("admin"), statsController.getRecentActivity);
router.get("/admin/sellers", requireAuth, requireRole("admin"), statsController.getAllSellers);
router.get("/admin/seller/:userId", requireAuth, requireRole("admin"), statsController.getSellerDetail);

module.exports = router;
