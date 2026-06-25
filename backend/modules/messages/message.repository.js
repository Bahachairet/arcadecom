const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const findByConversation = async (conversationId, page = 1, limit = 50) => {
  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, displayName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "asc" },
      skip,
      take: limit,
    }),
    prisma.message.count({
      where: { conversationId },
    }),
  ]);

  return {
    messages,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

const create = async (conversationId, senderId, content) => {
  const message = await prisma.message.create({
    data: { conversationId, senderId, content },
    include: {
      sender: { select: { id: true, displayName: true, avatarUrl: true } },
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessage: content, lastMessageAt: new Date() },
  });

  return message;
};

const markAsRead = async (conversationId, userId) => {
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      readAt: null,
    },
    data: { readAt: new Date() },
  });
};

const getUnreadCount = async (userId) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ buyerId: userId }, { sellerId: userId }],
    },
    select: {
      id: true,
      messages: {
        where: {
          senderId: { not: userId },
          readAt: null,
        },
        select: { id: true },
      },
    },
  });

  return conversations.reduce((sum, c) => sum + c.messages.length, 0);
};

module.exports = { findByConversation, create, markAsRead, getUnreadCount };
