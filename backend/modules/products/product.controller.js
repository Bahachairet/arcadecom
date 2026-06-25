const productService = require("./product.service");

const getAll = async (req, res) => {
  try {
    const filters = {
      categoryId: req.query.categoryId,
      type: req.query.type,
      search: req.query.search,
    };

    const products = await productService.getAll(filters);
    return res.json({ products });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const product = await productService.getById(req.params.id);
    return res.json({ product });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const getSellerProducts = async (req, res) => {
  try {
    const products = await productService.getSellerProducts(req.user.id);
    return res.json({ products });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const { title, description, price, categoryId, type, stock } = req.body;

    if (!title || !description || !price || !categoryId || !type) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const product = await productService.createProduct(
      req.user.id,
      { title, description, price, categoryId, type, stock },
      req.files
    );

    return res.status(201).json({ product });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const product = await productService.updateProduct(
      req.params.id,
      req.user.id,
      req.body,
      req.files
    );

    return res.json({ product });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id, req.user.id);
    return res.json({ message: "Product deleted" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const archive = async (req, res) => {
  try {
    const product = await productService.archiveProduct(req.params.id, req.user.id);
    return res.json({ product });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = { getAll, getById, getSellerProducts, create, update, remove, archive };
