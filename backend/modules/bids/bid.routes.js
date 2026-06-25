const { Router } = require("express");
const { requireAuth } = require("../../middleware/auth");
const {
  placeBidHandler,
  getBidHistoryHandler,
} = require("./bid.controller");

const router = Router();

router.get("/:bidProductId", getBidHistoryHandler);
router.post("/:bidProductId", requireAuth, placeBidHandler);

module.exports = router;
