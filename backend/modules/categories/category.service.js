const {
  findAll,
  findById,
  findByNameOrSlug,
  create,
  update,
  remove,
} = require("./category.repository");

const getAll = async () => {
  return findAll();
};

const getById = async (id) => {
  const category = await findById(id);

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

const createCategory = async (name, slug) => {
  const existing = await findByNameOrSlug(name, slug);

  if (existing) {
    throw new Error("Category with this name or slug already exists");
  }

  return create(name, slug);
};

const updateCategory = async (id, name, slug) => {
  await getById(id);
  return update(id, name, slug);
};

const deleteCategory = async (id) => {
  await getById(id);
  return remove(id);
};

module.exports = {
  getAll,
  getById,
  createCategory,
  updateCategory,
  deleteCategory,
};
