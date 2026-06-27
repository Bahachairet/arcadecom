const statsService = require("./stats.service");

// ── Seller Stats ──

const getSellerOverview = async (req, res) => {
  try {
    const stats = await statsService.getSellerOverview(req.user.id);
    return res.json(stats);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getSellerChart = async (req, res) => {
  try {
    const { period } = req.query;
    const chart = await statsService.getSellerChart(req.user.id, period);
    return res.json(chart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getSellerTopProducts = async (req, res) => {
  try {
    const topProducts = await statsService.getSellerTopProducts(req.user.id);
    return res.json(topProducts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Admin Stats ──

const getAdminOverview = async (req, res) => {
  try {
    const stats = await statsService.getAdminOverview();
    return res.json(stats);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAdminChart = async (req, res) => {
  try {
    const { period } = req.query;
    const chart = await statsService.getAdminChart(period);
    return res.json(chart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const activity = await statsService.getRecentActivity();
    return res.json(activity);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllSellers = async (req, res) => {
  try {
    const sellers = await statsService.getAllSellers();
    return res.json(sellers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getSellerDetail = async (req, res) => {
  try {
    const detail = await statsService.getSellerDetail(req.params.userId);
    return res.json(detail);
  } catch (error) {
    const status = error.message === "Seller not found" ? 404 : 500;
    return res.status(status).json({ message: error.message });
  }
};

module.exports = {
  getSellerOverview,
  getSellerChart,
  getSellerTopProducts,
  getAdminOverview,
  getAdminChart,
  getRecentActivity,
  getAllSellers,
  getSellerDetail,
};
