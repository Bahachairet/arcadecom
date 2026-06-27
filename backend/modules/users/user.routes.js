const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const { requireAuth, requireRole } = require("../../middleware/auth");

router.get("/", requireAuth, requireRole("admin"), userController.getAllUsers);
router.get("/:id", requireAuth, requireRole("admin"), userController.getUserById);
router.patch("/:id/status", requireAuth, requireRole("admin"), userController.updateUserStatus);

module.exports = router;
