const http = require("http");
const { Server } = require("socket.io");
const cookie = require("cookie");
const { PrismaClient } = require("@prisma/client");
const { startCron } = require("../modules/bids/auction-cron");

const prisma = new PrismaClient();

const app = require("./app");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

app.set("io", io);

io.use(async (socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const sessionId = cookies.sessionId;

    if (!sessionId) {
      return next(new Error("Authentication error"));
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { userId: true, expiresAt: true },
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return next(new Error("Session expired"));
    }

    socket.userId = session.userId;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.userId}`);
  socket.join(`user:${socket.userId}`);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

startCron(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
