const {
  createBidProduct,
  getBidProduct,
  getSellerBidProducts,
  getActiveAuctions,
  getAllBidProducts,
  updateBidProduct,
  cancelBidProduct,
  endAuction,
} = require("./bidproduct.service");

const createBidProductHandler = async (req, res) => {
  try {
    const imageUrls = req.files
      ? req.files.map((f) => `/uploads/products/${f.filename}`)
      : [];

    const bidProduct = await createBidProduct(req.user.id, req.body, imageUrls);
    res.status(201).json({ bidProduct });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getBidProductHandler = async (req, res) => {
  try {
    const bidProduct = await getBidProduct(req.params.id);
    res.json({ bidProduct });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getSellerBidProductsHandler = async (req, res) => {
  try {
    const bidProducts = await getSellerBidProducts(req.user.id);
    res.json({ bidProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getActiveAuctionsHandler = async (req, res) => {
  try {
    const bidProducts = await getActiveAuctions();
    res.json({ bidProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllBidProductsHandler = async (req, res) => {
  try {
    const { status, sellerId } = req.query;
    const bidProducts = await getAllBidProducts({ status, sellerId });
    res.json({ bidProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBidProductHandler = async (req, res) => {
  try {
    const bidProduct = await updateBidProduct(
      req.params.id,
      req.user.id,
      req.body
    );
    res.json({ bidProduct });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const cancelBidProductHandler = async (req, res) => {
  try {
    const bidProduct = await cancelBidProduct(req.params.id, req.user.id);
    res.json({ bidProduct });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const endAuctionHandler = async (req, res) => {
  try {
    const { winnerId } = req.body;
    const bidProduct = await endAuction(req.params.id, req.user.id, winnerId);
    res.json({ bidProduct });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createBidProductHandler,
  getBidProductHandler,
  getSellerBidProductsHandler,
  getActiveAuctionsHandler,
  getAllBidProductsHandler,
  updateBidProductHandler,
  cancelBidProductHandler,
  endAuctionHandler,
};
