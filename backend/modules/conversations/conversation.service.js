const {
  findOrCreate,
  findByUser,
  findById,
} = require("./conversation.repository");

const getOrCreateConversation = async (buyerId, sellerId, productId, bidProductId) => {
  if (buyerId === sellerId) {
    throw new Error("Cannot start a conversation with yourself");
  }

  if (!productId && !bidProductId) {
    throw new Error("Either productId or bidProductId is required");
  }

  const conversation = await findOrCreate(buyerId, sellerId, productId, bidProductId);
  return conversation;
};

const getMyConversations = async (userId) => {
  return findByUser(userId);
};

const getConversationById = async (conversationId, userId) => {
  const conversation = await findById(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    throw new Error("Not authorized to view this conversation");
  }

  return conversation;
};

module.exports = {
  getOrCreateConversation,
  getMyConversations,
  getConversationById,
};
