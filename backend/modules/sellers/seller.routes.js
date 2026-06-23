const express = require("express");
const router = express.Router();
const sellerController = require("./seller.controller");
const { requireAuth, requireRole } = require("../../middleware/auth");

router.get(
  "/me",
  requireAuth,
  sellerController.getMyProfile
);

router.post(
  "/apply",
  requireAuth,
  requireRole("buyer"),
  sellerController.apply
);

router.get(
  "/applications",
  requireAuth,
  requireRole("admin"),
  sellerController.getApplications
);

router.patch(
  "/approve/:id",
  requireAuth,
  requireRole("admin"),
  sellerController.approveApplication
);

router.patch(
  "/reject/:id",
  requireAuth,
  requireRole("admin"),
  sellerController.rejectApplication
);

module.exports = router;
