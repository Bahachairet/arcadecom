const prisma = require("../../prisma/prisma");

const findAllUsers = async (filters = {}) => {
  const where = {};

  if (filters.role) {
    where.role = filters.role;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      { displayName: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      sellerProfile: { select: { storeName: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return users;
};

const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      sellerProfile: { select: { storeName: true, status: true } },
    },
  });
};

const updateUserStatus = async (id, status) => {
  return prisma.user.update({
    where: { id },
    data: { status },
  });
};

module.exports = {
  findAllUsers,
  findUserById,
  updateUserStatus,
};
