import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

export async function socketAuthMiddleware(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.userId = String(user._id);
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Invalid or expired token"));
  }
}
