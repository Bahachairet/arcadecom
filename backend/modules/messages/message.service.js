const {
  findByConversation,
  create,
  markAsRead,
  getUnreadCount,
} = require("./message.repository");
const { findById } = require("../conversations/conversation.repository");

const getMessages = async (conversationId, userId, page, limit) => {
  const conversation = await findById(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    throw new Error("Not authorized");
  }

  return findByConversation(conversationId, page, limit);
};

const sendMessage = async (conversationId, senderId, content, io) => {
  const conversation = await findById(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (conversation.buyerId !== senderId && conversation.sellerId !== senderId) {
    throw new Error("Not authorized");
  }

  const message = await create(conversationId, senderId, content);

  const recipientId =
    senderId === conversation.buyerId
      ? conversation.sellerId
      : conversation.buyerId;

  if (io) {
    io.to(`user:${recipientId}`).emit("newMessage", {
      message,
      conversationId,
    });
  }

  return message;
};

const readMessages = async (conversationId, userId) => {
  await markAsRead(conversationId, userId);
};

module.exports = { getMessages, sendMessage, readMessages };
