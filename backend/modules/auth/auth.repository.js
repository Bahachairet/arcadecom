const prisma = require("../../prisma/prisma");

const createUser = async (email, displayName) => {
  return prisma.user.create({
    data: {
      email,
      displayName,
    },
  });
};

const createGoogleUser = async (email, displayName, avatarUrl) => {
  return prisma.user.create({
    data: {
      email,
      displayName,
      avatarUrl,
    },
  });
};

const findGoogleAccount = async (googleId) => {
  return prisma.authAccount.findFirst({
    where: {
      provider: "google",
      providerUserId: googleId,
    },
    include: { user: true },
  });
};

const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const createGoogleAccount = async (userId, googleId) => {
  return prisma.authAccount.create({
    data: {
      userId,
      provider: "google",
      providerUserId: googleId,
    },
  });
};

const createAuthAccount = async (userId, passwordHash, email) => {
  return prisma.authAccount.create({
    data: {
      userId,
      provider: "local",
      providerUserId: email,
      passwordHash,
    },
  });
};

const findLocalUserByEmail = async (email) => {
  return prisma.authAccount.findFirst({
    where: {
      provider: "local",
      providerUserId: email,
    },
    include: { user: true },
  });
};

const createSession = async (userId, sessionId, expiresAt) => {
  return prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
    },
  });
};

const findSession = async (sessionId) => {
  return prisma.session.findFirst({
    where: {
      id: sessionId,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });
};

const deleteSession = async (sessionId) => {
  return prisma.session.delete({
    where: { id: sessionId },
  });
};

const updateLastLoginAt = async (userId) => {
  return prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
};

module.exports = {
  createUser,
  createGoogleUser,
  createAuthAccount,
  findLocalUserByEmail,
  createSession,
  findSession,
  deleteSession,
  findGoogleAccount,
  findUserByEmail,
  createGoogleAccount,
  updateLastLoginAt,
};
