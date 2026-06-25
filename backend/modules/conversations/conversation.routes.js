const { Router } = require("express");
const { requireAuth } = require("../../middleware/auth");
const {
  createConversation,
  getConversations,
  getConversation,
  getUnread,
} = require("./conversation.controller");

const router = Router();

router.get("/unread", requireAuth, getUnread);
router.get("/", requireAuth, getConversations);
router.post("/", requireAuth, createConversation);
router.get("/:id", requireAuth, getConversation);

module.exports = router;
