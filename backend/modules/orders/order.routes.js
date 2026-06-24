const express = require("express");
const router = express.Router();
const orderController = require("./order.controller");
const { requireAuth } = require("../../middleware/auth");

router.post("/checkout", requireAuth, orderController.checkout);
router.get("/my-orders", requireAuth, orderController.getMyOrders);
router.get("/seller-orders", requireAuth, orderController.getSellerOrders);
router.get("/:id", requireAuth, orderController.getOrder);
router.patch("/:id/accept", requireAuth, orderController.acceptOrder);
router.patch("/:id/reject", requireAuth, orderController.rejectOrder);

module.exports = router;
