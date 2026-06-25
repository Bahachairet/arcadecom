const {
  getMessages,
  sendMessage,
  readMessages,
} = require("./message.service");

const getConversationMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const result = await getMessages(
      req.params.conversationId,
      req.user.id,
      parseInt(page),
      parseInt(limit)
    );
    res.json(result);
  } catch (error) {
    const status = error.message.includes("Not authorized") ? 403 : 404;
    res.status(status).json({ message: error.message });
  }
};

const sendMessageHandler = async (req, res) => {
  try {
    const { content } = req.body;
    const io = req.app.get("io");

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const message = await sendMessage(
      req.params.conversationId,
      req.user.id,
      content.trim(),
      io
    );

    res.status(201).json({ message });
  } catch (error) {
    const status = error.message.includes("Not authorized") ? 403 : 400;
    res.status(status).json({ message: error.message });
  }
};

const markConversationRead = async (req, res) => {
  try {
    await readMessages(req.params.conversationId, req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConversationMessages,
  sendMessageHandler,
  markConversationRead,
};
