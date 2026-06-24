const {
  createOrder,
  findOrdersByBuyer,
  findOrdersBySeller,
  findOrderById,
  acceptOrder,
  rejectOrder,
} = require("./order.repository");

const prisma = require("../../prisma/prisma");

const checkout = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  for (const item of cart.items) {
    if (item.product.status !== "ACTIVE") {
      throw new Error(`"${item.product.title}" is no longer available`);
    }
    if (item.quantity > item.product.stock) {
      throw new Error(`Not enough stock for "${item.product.title}"`);
    }
  }

  const total = cart.items.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );

  const order = await createOrder(userId, cart.items, total);
  return order;
};

const getBuyerOrders = async (userId) => {
  return findOrdersByBuyer(userId);
};

const getSellerOrders = async (sellerId, page, limit) => {
  return findOrdersBySeller(sellerId, page, limit);
};

const getOrderById = async (orderId, userId) => {
  const order = await findOrderById(orderId);
  if (!order) throw new Error("Order not found");
  if (order.userId !== userId) throw new Error("Unauthorized");
  return order;
};

const accept = async (sellerId, orderId) => {
  return acceptOrder(orderId, sellerId);
};

const reject = async (sellerId, orderId) => {
  return rejectOrder(orderId, sellerId);
};

module.exports = { checkout, getBuyerOrders, getSellerOrders, getOrderById, accept, reject };
