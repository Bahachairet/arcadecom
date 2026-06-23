const express = require("express");
const router = express.Router();
const cartController = require("./cart.controller");
const { requireAuth } = require("../../middleware/auth");

router.get("/", requireAuth, cartController.getCart);
router.post("/items", requireAuth, cartController.addItem);
router.patch("/items/:itemId", requireAuth, cartController.updateQuantity);
router.delete("/items/:itemId", requireAuth, cartController.removeItem);
router.delete("/", requireAuth, cartController.clear);

module.exports = router;
