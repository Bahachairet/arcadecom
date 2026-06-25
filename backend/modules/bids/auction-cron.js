const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

let io = null;

const setSocketIO = (socketIO) => {
  io = socketIO;
};

const checkExpiredAuctions = async () => {
  try {
    const expired = await prisma.bidProduct.findMany({
      where: {
        status: "ACTIVE",
        endTime: { lte: new Date() },
      },
      include: {
        bids: {
          orderBy: { amount: "desc" },
          take: 1,
          select: { bidderId: true, amount: true },
        },
      },
    });

    for (const auction of expired) {
      if (auction.bids.length > 0) {
        const winnerId = auction.bids[0].bidderId;

        await prisma.bidProduct.update({
          where: { id: auction.id },
          data: {
            status: "ENDED",
            winnerId,
          },
        });

        if (io) {
          io.to(`auction:${auction.id}`).emit("bid:ended", {
            bidProductId: auction.id,
            winnerId,
            winningAmount: auction.bids[0].amount,
          });

          io.to(`user:${winnerId}`).emit("bid:won", {
            bidProductId: auction.id,
            bidProductTitle: auction.title,
            winningAmount: auction.bids[0].amount,
          });

          io.to(`user:${auction.sellerId}`).emit("bid:auction-ended", {
            bidProductId: auction.id,
            bidProductTitle: auction.title,
            winnerId,
            winningAmount: auction.bids[0].amount,
          });
        }
      } else {
        await prisma.bidProduct.update({
          where: { id: auction.id },
          data: { status: "ENDED" },
        });

        if (io) {
          io.to(`auction:${auction.id}`).emit("bid:ended-no-winner", {
            bidProductId: auction.id,
          });
        }
      }
    }

    if (expired.length > 0) {
      console.log(`Closed ${expired.length} expired auctions`);
    }
  } catch (error) {
    console.error("Error checking expired auctions:", error);
  }
};

const checkUpcomingAuctions = async () => {
  try {
    const now = new Date();
    const upcoming = await prisma.bidProduct.findMany({
      where: {
        status: "UPCOMING",
        startTime: { lte: now },
      },
    });

    for (const auction of upcoming) {
      await prisma.bidProduct.update({
        where: { id: auction.id },
        data: { status: "ACTIVE" },
      });

      if (io) {
        io.to(`auction:${auction.id}`).emit("bid:started", {
          bidProductId: auction.id,
        });
      }
    }

    if (upcoming.length > 0) {
      console.log(`Activated ${upcoming.length} upcoming auctions`);
    }
  } catch (error) {
    console.error("Error checking upcoming auctions:", error);
  }
};

const startCron = (socketIO) => {
  io = socketIO;
  setInterval(checkExpiredAuctions, 30000);
  setInterval(checkUpcomingAuctions, 30000);
  console.log("Auction cron started (30s interval)");
};

module.exports = { startCron, checkExpiredAuctions, checkUpcomingAuctions };
