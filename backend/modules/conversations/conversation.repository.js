const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const findOrCreate = async (buyerId, sellerId, productId, bidProductId) => {
  const whereClause = { buyerId, sellerId };
  if (productId) {
    whereClause.productId = productId;
    whereClause.bidProductId = null;
  } else if (bidProductId) {
    whereClause.bidProductId = bidProductId;
    whereClause.productId = null;
  }

  const existing = await prisma.conversation.findFirst({
    where: whereClause,
    include: {
      buyer: { select: { id: true, displayName: true, avatarUrl: true } },
      seller: { select: { id: true, displayName: true, avatarUrl: true } },
      product: productId
        ? {
            select: {
              id: true,
              title: true,
              images: { select: { url: true }, take: 1 },
              price: true,
            },
          }
        : false,
      bidProduct: bidProductId
        ? {
            select: {
              id: true,
              title: true,
              images: { select: { url: true }, take: 1 },
              currentPrice: true,
            },
          }
        : false,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, senderId: true, createdAt: true },
      },
    },
  });

  if (existing) return existing;

  return prisma.conversation.create({
    data: {
      buyerId,
      sellerId,
      productId: productId || null,
      bidProductId: bidProductId || null,
    },
    include: {
      buyer: { select: { id: true, displayName: true, avatarUrl: true } },
      seller: { select: { id: true, displayName: true, avatarUrl: true } },
      product: productId
        ? {
            select: {
              id: true,
              title: true,
              images: { select: { url: true }, take: 1 },
              price: true,
            },
          }
        : false,
      bidProduct: bidProductId
        ? {
            select: {
              id: true,
              title: true,
              images: { select: { url: true }, take: 1 },
              currentPrice: true,
            },
          }
        : false,
      messages: true,
    },
  });
};

const findByUser = async (userId) => {
  return prisma.conversation.findMany({
    where: {
      OR: [{ buyerId: userId }, { sellerId: userId }],
    },
    include: {
      buyer: { select: { id: true, displayName: true, avatarUrl: true } },
      seller: { select: { id: true, displayName: true, avatarUrl: true } },
      product: {
        select: {
          id: true,
          title: true,
          images: { select: { url: true }, take: 1 },
          price: true,
        },
      },
      bidProduct: {
        select: {
          id: true,
          title: true,
          images: { select: { url: true }, take: 1 },
          currentPrice: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, senderId: true, createdAt: true },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });
};

const findById = async (id) => {
  return prisma.conversation.findUnique({
    where: { id },
    include: {
      buyer: { select: { id: true, displayName: true, avatarUrl: true } },
      seller: { select: { id: true, displayName: true, avatarUrl: true } },
      product: {
        select: {
          id: true,
          title: true,
          images: { select: { url: true }, take: 1 },
          price: true,
        },
      },
      bidProduct: {
        select: {
          id: true,
          title: true,
          images: { select: { url: true }, take: 1 },
          currentPrice: true,
        },
      },
    },
  });
};

const updateLastMessage = async (id, content) => {
  return prisma.conversation.update({
    where: { id },
    data: { lastMessage: content, lastMessageAt: new Date() },
  });
};

const getUnreadCount = async (userId) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ buyerId: userId }, { sellerId: userId }],
    },
    select: {
      id: true,
      buyerId: true,
      sellerId: true,
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

module.exports = { findOrCreate, findByUser, findById, updateLastMessage, getUnreadCount };
