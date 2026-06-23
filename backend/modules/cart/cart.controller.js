const cartService = require("./cart.service");

const getCart = async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    return res.json({ cart });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const cart = await cartService.addItem(
      req.user.id,
      productId,
      quantity ? parseInt(quantity, 10) : 1
    );

    return res.json({ cart });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ message: "Quantity is required" });
    }

    const cart = await cartService.updateQuantity(
      req.user.id,
      req.params.itemId,
      parseInt(quantity, 10)
    );

    return res.json({ cart });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const removeItem = async (req, res) => {
  try {
    const cart = await cartService.removeItem(req.user.id, req.params.itemId);
    return res.json({ cart });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const clear = async (req, res) => {
  try {
    const cart = await cartService.clear(req.user.id);
    return res.json({ cart });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = { getCart, addItem, updateQuantity, removeItem, clear };
