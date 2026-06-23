const express = require("express");
const router = express.Router();
const categoryController = require("./category.controller");
const { requireAuth, requireRole } = require("../../middleware/auth");

router.get("/", categoryController.getAll);

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  categoryController.create
);

router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  categoryController.update
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  categoryController.remove
);

module.exports = router;
