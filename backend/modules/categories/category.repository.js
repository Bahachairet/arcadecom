const prisma = require("../../prisma/prisma");

const findAll = async () => {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
};

const findById = async (id) => {
  return prisma.category.findUnique({
    where: { id },
  });
};

const create = async (name, slug) => {
  return prisma.category.create({
    data: { name, slug },
  });
};

const update = async (id, name, slug) => {
  return prisma.category.update({
    where: { id },
    data: { name, slug },
  });
};

const findByNameOrSlug = async (name, slug) => {
  return prisma.category.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
};

const remove = async (id) => {
  return prisma.category.delete({
    where: { id },
  });
};

module.exports = { findAll, findById, findByNameOrSlug, create, update, remove };
