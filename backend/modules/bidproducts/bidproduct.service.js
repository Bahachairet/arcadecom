const {
  create,
  findById,
  findMany,
  findActive,
  update,
  remove,
} = require("./bidproduct.repository");

const createBidProduct = async (sellerId, data, imageUrls) => {
  const startingPrice = parseFloat(data.startingPrice);
  const minIncrement = parseFloat(data.minIncrement);

  if (isNaN(startingPrice) || startingPrice <= 0) {
    throw new Error("Starting price must be greater than 0");
  }

  if (isNaN(minIncrement) || minIncrement <= 0) {
    throw new Error("Minimum increment must be greater than 0");
  }

  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);

  if (endTime <= startTime) {
    throw new Error("End time must be after start time");
  }

  if (endTime <= new Date()) {
    throw new Error("End time must be in the future");
  }

  return create(
    {
      sellerId,
      title: data.title,
      description: data.description,
      startingPrice,
      minIncrement,
      startTime,
      endTime,
    },
    imageUrls
  );
};

const getBidProduct = async (id) => {
  const bidProduct = await findById(id);
  if (!bidProduct) {
    throw new Error("Auction not found");
  }
  return bidProduct;
};

const getSellerBidProducts = async (sellerId) => {
  return findMany({ sellerId });
};

const getActiveAuctions = async (limit = null) => {
  return findActive(limit);
};

const getAllBidProducts = async (filters) => {
  return findMany(filters);
};

const updateBidProduct = async (id, sellerId, data) => {
  const existing = await findById(id);
  if (!existing) {
    throw new Error("Auction not found");
  }
  if (existing.sellerId !== sellerId) {
    throw new Error("Not authorized");
  }
  if (existing.status !== "UPCOMING") {
    throw new Error("Can only edit upcoming auctions");
  }
  return update(id, data);
};

const cancelBidProduct = async (id, sellerId) => {
  const existing = await findById(id);
  if (!existing) {
    throw new Error("Auction not found");
  }
  if (existing.sellerId !== sellerId) {
    throw new Error("Not authorized");
  }
  if (existing.status === "ENDED" || existing.status === "CANCELLED") {
    throw new Error("Cannot cancel ended or cancelled auction");
  }
  return update(id, { status: "CANCELLED" });
};

const endAuction = async (id, sellerId, winnerId) => {
  const existing = await findById(id);
  if (!existing) {
    throw new Error("Auction not found");
  }
  if (existing.sellerId !== sellerId) {
    throw new Error("Not authorized");
  }
  if (existing.status === "ENDED" || existing.status === "CANCELLED") {
    throw new Error("Auction already ended or cancelled");
  }

  if (winnerId) {
    const validBidder = existing.bids.some((b) => b.bidderId === winnerId);
    if (!validBidder) {
      throw new Error("Winner must be one of the bidders");
    }
  }

  return update(id, {
    status: "ENDED",
    endTime: new Date(),
    winnerId: winnerId || null,
  });
};

const convertToFixedPrice = async (id) => {
  const bidProduct = await findById(id);
  if (!bidProduct) {
    throw new Error("Auction not found");
  }
  return bidProduct;
};

module.exports = {
  createBidProduct,
  getBidProduct,
  getSellerBidProducts,
  getActiveAuctions,
  getAllBidProducts,
  updateBidProduct,
  cancelBidProduct,
  endAuction,
};
