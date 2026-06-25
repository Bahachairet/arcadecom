const { Router } = require("express");
const { requireAuth } = require("../../middleware/auth");
const {
  getConversationMessages,
  sendMessageHandler,
  markConversationRead,
} = require("./message.controller");

const router = Router();

router.get("/:conversationId", requireAuth, getConversationMessages);
router.post("/:conversationId", requireAuth, sendMessageHandler);
router.patch("/:conversationId/read", requireAuth, markConversationRead);

module.exports = router;
