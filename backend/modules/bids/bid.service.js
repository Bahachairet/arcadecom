const {
  create,
  findByBidProduct,
  findHighestBid,
  findUserBid,
  countBids,
  findUniqueBidders,
} = require("./bid.repository");
const { findById, update } = require("../bidproducts/bidproduct.repository");

const placeBid = async (bidProductId, bidderId, amount, io) => {
  const bidProduct = await findById(bidProductId);

  if (!bidProduct) {
    throw new Error("Auction not found");
  }

  if (bidProduct.status !== "ACTIVE") {
    throw new Error("Auction is not active");
  }

  if (new Date(bidProduct.endTime) < new Date()) {
    throw new Error("Auction has ended");
  }

  if (bidProduct.sellerId === bidderId) {
    throw new Error("Sellers cannot bid on their own auction");
  }

  const bidAmount = parseFloat(amount);
  const currentPrice = parseFloat(bidProduct.currentPrice);
  const minIncrement = parseFloat(bidProduct.minIncrement);

  if (isNaN(bidAmount) || bidAmount <= 0) {
    throw new Error("Invalid bid amount");
  }

  if (bidAmount < currentPrice + minIncrement) {
    throw new Error(
      `Bid must be at least $${(currentPrice + minIncrement).toFixed(2)}`
    );
  }

  const previousHighest = await findHighestBid(bidProductId);
  const previousBidderId = previousHighest?.bidderId;

  const bid = await create(bidProductId, bidderId, bidAmount);

  const timeLeft = new Date(bidProduct.endTime).getTime() - Date.now();
  let newEndTime = bidProduct.endTime;

  if (timeLeft < 30000) {
    newEndTime = new Date(Date.now() + 30000);
    await update(bidProductId, { endTime: newEndTime });
  }

  const totalBids = await countBids(bidProductId);

  if (io) {
    io.to(`auction:${bidProductId}`).emit("bid:placed", {
      bid,
      currentPrice: bidAmount,
      endTime: newEndTime,
      totalBids,
    });

    if (previousBidderId && previousBidderId !== bidderId) {
      io.to(`user:${previousBidderId}`).emit("bid:outbid", {
        bidProductId,
        bidProductTitle: bidProduct.title,
        newHighest: bidAmount,
      });
    }
  }

  return { bid, newEndTime };
};

const getBidHistory = async (bidProductId) => {
  const bids = await findByBidProduct(bidProductId);
  const totalBids = await countBids(bidProductId);
  const uniqueBidders = await findUniqueBidders(bidProductId);
  const highest = await findHighestBid(bidProductId);

  return { bids, totalBids, uniqueBidders, highest };
};

module.exports = { placeBid, getBidHistory };
