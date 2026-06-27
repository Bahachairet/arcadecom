const statsRepository = require("./stats.repository");

const getSellerOverview = async (sellerId) => {
  return statsRepository.getSellerOverview(sellerId);
};

const getSellerChart = async (sellerId, period) => {
  const validPeriods = ["daily", "weekly", "monthly"];
  const p = validPeriods.includes(period) ? period : "daily";
  return statsRepository.getSellerChart(sellerId, p);
};

const getSellerTopProducts = async (sellerId) => {
  return statsRepository.getSellerTopProducts(sellerId);
};

const getAdminOverview = async () => {
  return statsRepository.getAdminOverview();
};

const getAdminChart = async (period) => {
  const validPeriods = ["daily", "weekly", "monthly"];
  const p = validPeriods.includes(period) ? period : "daily";
  return statsRepository.getAdminChart(p);
};

const getRecentActivity = async () => {
  return statsRepository.getRecentActivity();
};

const getAllSellers = async () => {
  return statsRepository.getAllSellers();
};

const getSellerDetail = async (userId) => {
  const detail = await statsRepository.getSellerDetail(userId);
  if (!detail) throw new Error("Seller not found");
  return detail;
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
