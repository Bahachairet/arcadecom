const prisma = require("../prisma/prisma");

const requireAuth = async (req, res, next) => {
  const sessionId = req.cookies.sessionId;

  if (!sessionId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!session) {
    return res.status(401).json({ message: "Session expired" });
  }

  req.user = session.user;
  next();
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
};

module.exports = { requireAuth, requireRole };
