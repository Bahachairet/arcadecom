const {
  findCartByUserId,
  createCart,
  findCartItem,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} = require("./cart.repository");

const getCart = async (userId) => {
  let cart = await findCartByUserId(userId);

  if (!cart) {
    cart = await createCart(userId);
  }

  return cart;
};

const addItem = async (userId, productId, quantity = 1) => {
  let cart = await findCartByUserId(userId);

  if (!cart) {
    cart = await createCart(userId);
  }

  const product = await require("../../prisma/prisma").product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.status !== "ACTIVE") {
    throw new Error("Product is not available");
  }

  if (product.type === "COLLECTIBLE" && product.stock < 1) {
    throw new Error("This collectible has already been claimed");
  }

  const existingItem = await findCartItem(cart.id, productId);

  if (existingItem && product.type === "COLLECTIBLE") {
    throw new Error("This collectible is already in your cart");
  }

  if (existingItem && existingItem.quantity + quantity > product.stock) {
    throw new Error("Not enough stock available");
  }

  await addCartItem(cart.id, productId, quantity);
  return getCart(userId);
};

const updateQuantity = async (userId, cartItemId, quantity) => {
  const cart = await findCartByUserId(userId);

  if (!cart) {
    throw new Error("Cart not found");
  }

  const item = cart.items.find((i) => i.id === cartItemId);

  if (!item) {
    throw new Error("Item not found in your cart");
  }

  if (quantity < 1) {
    return removeItem(userId, cartItemId);
  }

  if (quantity > item.product.stock) {
    throw new Error("Not enough stock available");
  }

  await updateCartItemQuantity(cartItemId, quantity);
  return getCart(userId);
};

const removeItem = async (userId, cartItemId) => {
  const cart = await findCartByUserId(userId);

  if (!cart) {
    throw new Error("Cart not found");
  }

  const item = cart.items.find((i) => i.id === cartItemId);

  if (!item) {
    throw new Error("Item not found in your cart");
  }

  await removeCartItem(cartItemId);
  return getCart(userId);
};

const clear = async (userId) => {
  const cart = await findCartByUserId(userId);

  if (!cart) {
    throw new Error("Cart not found");
  }

  await clearCart(cart.id);
  return getCart(userId);
};

module.exports = { getCart, addItem, updateQuantity, removeItem, clear };
