const categoryService = require("./category.service");

const getAll = async (req, res) => {
  try {
    const categories = await categoryService.getAll();
    return res.json({ categories });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: "Name and slug are required" });
    }

    const category = await categoryService.createCategory(name, slug);
    return res.status(201).json({ category });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { name, slug } = req.body;
    const category = await categoryService.updateCategory(
      req.params.id,
      name,
      slug
    );
    return res.json({ category });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    return res.json({ message: "Category deleted" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = { getAll, create, update, remove };
