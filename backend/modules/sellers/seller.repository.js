const prisma = require("../../prisma/prisma");

const findProfileByUserId = async (userId) => {
  return prisma.sellerProfile.findUnique({
    where: { userId },
  });
};

const createProfile = async (userId, storeName, description) => {
  return prisma.sellerProfile.create({
    data: {
      userId,
      storeName,
      description,
    },
  });
};

const findAllApplications = async () => {
  return prisma.sellerProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const findApplicationById = async (id) => {
  return prisma.sellerProfile.findUnique({
    where: { id },
    include: { user: true },
  });
};

const updateApplicationStatus = async (id, status) => {
  return prisma.sellerProfile.update({
    where: { id },
    data: { status },
  });
};

const updateUserRole = async (userId, role) => {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
  });
};

module.exports = {
  findProfileByUserId,
  createProfile,
  findAllApplications,
  findApplicationById,
  updateApplicationStatus,
  updateUserRole,
};
