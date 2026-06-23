const prisma = require("../../prisma/prisma");

const findCartByUserId = async (userId) => {
  return prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
              seller: { select: { id: true, displayName: true } },
            },
          },
        },
      },
    },
  });
};

const createCart = async (userId) => {
  return prisma.cart.create({
    data: { userId },
    include: { items: true },
  });
};

const findCartItem = async (cartId, productId) => {
  return prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId, productId } },
  });
};

const addCartItem = async (cartId, productId, quantity) => {
  const existing = await findCartItem(cartId, productId);

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  }

  return prisma.cartItem.create({
    data: { cartId, productId, quantity },
  });
};

const updateCartItemQuantity = async (cartItemId, quantity) => {
  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });
};

const removeCartItem = async (cartItemId) => {
  return prisma.cartItem.delete({ where: { id: cartItemId } });
};

const clearCart = async (cartId) => {
  return prisma.cartItem.deleteMany({ where: { cartId } });
};

module.exports = {
  findCartByUserId,
  createCart,
  findCartItem,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
