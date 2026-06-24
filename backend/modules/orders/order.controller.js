const orderService = require("./order.service");

const checkout = async (req, res) => {
  try {
    const order = await orderService.checkout(req.user.id);
    return res.status(201).json({ order });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getBuyerOrders(req.user.id);
    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await orderService.getSellerOrders(req.user.id, page, limit);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user.id);
    return res.json({ order });
  } catch (error) {
    const status = error.message === "Order not found" ? 404 : 403;
    return res.status(status).json({ message: error.message });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const order = await orderService.accept(req.user.id, req.params.id);
    return res.json({ order });
  } catch (error) {
    const status = error.message === "Order not found" ? 404 : 403;
    return res.status(status).json({ message: error.message });
  }
};

const rejectOrder = async (req, res) => {
  try {
    const order = await orderService.reject(req.user.id, req.params.id);
    return res.json({ order });
  } catch (error) {
    const status = error.message === "Order not found" ? 404 : 403;
    return res.status(status).json({ message: error.message });
  }
};

module.exports = { checkout, getMyOrders, getSellerOrders, getOrder, acceptOrder, rejectOrder };
