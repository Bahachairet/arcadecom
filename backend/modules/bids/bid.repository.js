const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const create = async (bidProductId, bidderId, amount) => {
  return prisma.$transaction(async (tx) => {
    const bid = await tx.bid.create({
      data: {
        bidProductId,
        bidderId,
        amount,
      },
      include: {
        bidder: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });

    await tx.bidProduct.update({
      where: { id: bidProductId },
      data: { currentPrice: amount },
    });

    return bid;
  });
};

const findByBidProduct = async (bidProductId) => {
  return prisma.bid.findMany({
    where: { bidProductId },
    include: {
      bidder: { select: { id: true, displayName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const findHighestBid = async (bidProductId) => {
  return prisma.bid.findFirst({
    where: { bidProductId },
    orderBy: { amount: "desc" },
    include: {
      bidder: { select: { id: true, displayName: true, avatarUrl: true } },
    },
  });
};

const findUserBid = async (bidProductId, bidderId) => {
  return prisma.bid.findFirst({
    where: { bidProductId, bidderId },
    orderBy: { amount: "desc" },
  });
};

const countBids = async (bidProductId) => {
  return prisma.bid.count({
    where: { bidProductId },
  });
};

const findUniqueBidders = async (bidProductId) => {
  const bids = await prisma.bid.findMany({
    where: { bidProductId },
    select: { bidderId: true },
    distinct: ["bidderId"],
  });
  return bids.length;
};

module.exports = {
  create,
  findByBidProduct,
  findHighestBid,
  findUserBid,
  countBids,
  findUniqueBidders,
};
