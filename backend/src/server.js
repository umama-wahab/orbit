import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { socketAuthMiddleware } from "./sockets/socketAuth.js";
import { registerSocketHandlers } from "./sockets/socketHandlers.js";
import { startCircleExpiryJob } from "./jobs/circleExpiry.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
  console.log(`[orbit] Socket connected: ${socket.id} (user ${socket.userId})`);
  registerSocketHandlers(io, socket);
});

const start = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`[orbit] Server running on port ${PORT}`);
  });

  startCircleExpiryJob(io);
};

start();

process.on("unhandledRejection", (err) => {
  console.error("[orbit] Unhandled rejection:", err);
});
