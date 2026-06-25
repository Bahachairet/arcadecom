const {
  findAll,
  findById,
  findSellerProducts,
  create,
  addImages,
  update,
  remove,
  findSellerProductById,
} = require("./product.repository");

const getAll = async (filters) => {
  return findAll(filters);
};

const getById = async (id) => {
  const product = await findById(id);

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

const getSellerProducts = async (sellerId) => {
  return findSellerProducts(sellerId);
};

const createProduct = async (sellerId, data, files) => {
  let stock = data.stock ? parseInt(data.stock, 10) : 0;
  let fileUrl = null;

  if (data.type === "COLLECTIBLE") {
    stock = 1;
  }

  if (data.type === "DIGITAL") {
    stock = 9999;
    if (files && files.length > 0) {
      fileUrl = `/uploads/products/${files[0].filename}`;
    }
  }

  if (data.type === "PHYSICAL" && stock <= 0) {
    throw new Error("Physical products must have stock greater than 0");
  }

  const product = await create({
    sellerId,
    categoryId: data.categoryId,
    title: data.title,
    description: data.description,
    price: parseFloat(data.price),
    type: data.type,
    stock,
    fileUrl,
  });

  if (files && files.length > 0) {
    await addImages(product.id, files);
  }

  return findById(product.id);
};

const updateProduct = async (productId, sellerId, data, files) => {
  const existing = await findSellerProductById(productId, sellerId);

  if (!existing) {
    throw new Error("Product not found or not owned by you");
  }

  const updateData = {};

  if (data.title) updateData.title = data.title;
  if (data.description) updateData.description = data.description;
  if (data.price) updateData.price = parseFloat(data.price);
  if (data.categoryId) updateData.categoryId = data.categoryId;
  if (data.status) updateData.status = data.status;

  if (data.stock !== undefined) {
    if (existing.type === "COLLECTIBLE") {
      updateData.stock = 1;
    } else if (existing.type === "DIGITAL") {
      updateData.stock = 9999;
    } else {
      updateData.stock = parseInt(data.stock, 10);
    }
  }

  if (data.type && data.type !== existing.type) {
    updateData.type = data.type;

    if (data.type === "COLLECTIBLE") {
      updateData.stock = 1;
    } else if (data.type === "DIGITAL") {
      updateData.stock = 9999;
    }
  }

  await update(productId, updateData);

  if (files && files.length > 0) {
    await addImages(productId, files);
  }

  return findById(productId);
};

const deleteProduct = async (productId, sellerId) => {
  const existing = await findSellerProductById(productId, sellerId);

  if (!existing) {
    throw new Error("Product not found or not owned by you");
  }

  return remove(productId);
};

const archiveProduct = async (productId, sellerId) => {
  const existing = await findSellerProductById(productId, sellerId);

  if (!existing) {
    throw new Error("Product not found or not owned by you");
  }

  await update(productId, { status: "ARCHIVED" });
  return findById(productId);
};

module.exports = {
  getAll,
  getById,
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  archiveProduct,
};
