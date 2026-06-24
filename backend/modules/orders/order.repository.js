const prisma = require("../../prisma/prisma");

const createOrder = async (userId, cartItems, total) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId,
        total,
        status: "PENDING",
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            sellerId: item.product.sellerId,
            title: item.product.title,
            unitPrice: item.product.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    for (const item of cartItems) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      const newStock = product.stock - item.quantity;
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: newStock,
          status: newStock <= 0 ? "OUT_OF_STOCK" : product.status,
        },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cartItems[0].cartId } });

    return order;
  });
};

const findOrdersByBuyer = async (userId) => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: { images: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const findOrdersBySeller = async (sellerId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: {
        items: { some: { sellerId } },
      },
      include: {
        user: { select: { id: true, displayName: true, email: true } },
        items: {
          where: { sellerId },
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({
      where: {
        items: { some: { sellerId } },
      },
    }),
  ]);

  return {
    orders,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

const findOrderById = async (orderId) => {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { id: true, displayName: true, email: true } },
      items: {
        include: {
          product: {
            include: { images: true },
          },
        },
      },
    },
  });
};

const acceptOrder = async (orderId, sellerId) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error("Order not found");
    if (order.status !== "PENDING") throw new Error("Order is not pending");

    const sellerItems = order.items.filter((item) => item.sellerId === sellerId);
    if (sellerItems.length === 0) throw new Error("Unauthorized");

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
      include: {
        user: { select: { id: true, displayName: true, email: true } },
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
    });

    return updatedOrder;
  });
};

const rejectOrder = async (orderId, sellerId) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error("Order not found");
    if (order.status !== "PENDING") throw new Error("Order is not pending");

    const sellerItems = order.items.filter((item) => item.sellerId === sellerId);
    if (sellerItems.length === 0) throw new Error("Unauthorized");

    for (const item of sellerItems) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      const restoredStock = product.stock + item.quantity;
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: restoredStock,
          status: product.status === "OUT_OF_STOCK" ? "ACTIVE" : product.status,
        },
      });
    }

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
      include: {
        user: { select: { id: true, displayName: true, email: true } },
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
    });

    return updatedOrder;
  });
};

module.exports = {
  createOrder,
  findOrdersByBuyer,
  findOrdersBySeller,
  findOrderById,
  acceptOrder,
  rejectOrder,
};
