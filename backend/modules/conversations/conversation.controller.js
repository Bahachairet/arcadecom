const {
  getOrCreateConversation,
  getMyConversations,
  getConversationById,
} = require("./conversation.service");

const { getUnreadCount } = require("./conversation.repository");

const createConversation = async (req, res) => {
  try {
    const { sellerId, productId, bidProductId } = req.body;
    const buyerId = req.user.id;

    if (!sellerId) {
      return res.status(400).json({ message: "sellerId is required" });
    }

    if (!productId && !bidProductId) {
      return res.status(400).json({ message: "Either productId or bidProductId is required" });
    }

    const conversation = await getOrCreateConversation(buyerId, sellerId, productId, bidProductId);
    res.status(201).json({ conversation });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const conversations = await getMyConversations(req.user.id);
    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getConversation = async (req, res) => {
  try {
    const conversation = await getConversationById(
      req.params.id,
      req.user.id
    );
    res.json({ conversation });
  } catch (error) {
    const status = error.message.includes("Not authorized") ? 403 : 404;
    res.status(status).json({ message: error.message });
  }
};

const getUnread = async (req, res) => {
  try {
    const count = await getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createConversation, getConversations, getConversation, getUnread };
