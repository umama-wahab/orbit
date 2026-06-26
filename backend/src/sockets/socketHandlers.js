import User from "../models/User.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import Circle from "../models/Circle.js";
import CircleMessage from "../models/CircleMessage.js";
import Poll from "../models/Poll.js";
import Notification from "../models/Notification.js";
import { addUserSocket, removeUserSocket, getOnlineUserIds } from "./presenceManager.js";

// In-memory typing state: conversationId/circleId -> Set of identities currently typing
const typingState = new Map();

export function registerSocketHandlers(io, socket) {
  const userId = socket.userId;

  // ---------- CONNECTION & PRESENCE ----------
  socket.join(`user:${userId}`);

  const isFirstConnection = addUserSocket(userId, socket.id);

  if (isFirstConnection) {
    User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() }).catch(() => {});
    socket.broadcast.emit("presence:online", { userId, lastSeen: new Date() });
  }

  socket.on("presence:request_online_list", () => {
    socket.emit("presence:online_list", { userIds: getOnlineUserIds() });
  });

  // ---------- JOIN ROOMS ----------
  socket.on("conversation:join", async (conversationId) => {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (conversation && conversation.participants.some((p) => String(p) === userId)) {
        socket.join(`conversation:${conversationId}`);
      }
    } catch (err) {
      socket.emit("error", { message: "Failed to join conversation" });
    }
  });

  socket.on("conversation:leave", (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
  });

  socket.on("circle:join_room", async (circleId) => {
    try {
      const circle = await Circle.findById(circleId);
      if (circle && circle.members.some((m) => String(m.user) === userId)) {
        socket.join(`circle:${circleId}`);
      }
    } catch (err) {
      socket.emit("error", { message: "Failed to join circle room" });
    }
  });

  socket.on("circle:leave_room", (circleId) => {
    socket.leave(`circle:${circleId}`);
  });

  // ---------- PRIVATE / GROUP MESSAGING ----------
  socket.on("message:send", async (payload, callback) => {
    try {
      const { conversationId, text, attachments = [], tempId } = payload;

      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.some((p) => String(p) === userId)) {
        return callback?.({ error: "Not authorized for this conversation" });
      }

      const message = await Message.create({
        conversation: conversationId,
        sender: userId,
        text: text || "",
        attachments,
        readBy: [userId],
      });

      conversation.lastMessage = message._id;
      conversation.lastActivity = new Date();
      await conversation.save();

      const populated = await Message.findById(message._id).populate(
        "sender",
        "username avatarUrl avatarColor"
      );

      const payloadOut = { message: populated, tempId };

      // Broadcast to everyone in the room EXCEPT the sender's own socket.
      // The sender already receives this exact message via the ack callback
      // below — emitting to the whole room (including self) caused the
      // message to arrive twice on the sender's client (once via ack, once
      // via broadcast), which is what produced duplicate bubbles in the UI.
      socket.to(`conversation:${conversationId}`).emit("message:new", payloadOut);
      callback?.({ message: populated, tempId });

      // Notify offline/inactive participants
      const recipients = conversation.participants.filter((p) => String(p) !== userId);
      for (const recipientId of recipients) {
        const notif = await Notification.create({
          recipient: recipientId,
          type: "message",
          actor: userId,
          title: conversation.isGroup
            ? `New message in ${conversation.name}`
            : `${socket.user.username} sent you a message`,
          body: text?.slice(0, 80) || "Sent an attachment",
          link: `/messages/${conversationId}`,
        });
        io.to(`user:${recipientId}`).emit("notification:new", notif);
      }

      clearTyping(`conversation:${conversationId}`, userId, io);
    } catch (err) {
      callback?.({ error: "Failed to send message" });
    }
  });

  socket.on("message:edit", async ({ messageId, text }) => {
    try {
      const message = await Message.findById(messageId);
      if (!message || String(message.sender) !== userId) return;
      message.text = text;
      message.edited = true;
      await message.save();
      const populated = await Message.findById(messageId).populate(
        "sender",
        "username avatarUrl avatarColor"
      );
      io.to(`conversation:${message.conversation}`).emit("message:edited", { message: populated });
    } catch (err) {
      socket.emit("error", { message: "Failed to edit message" });
    }
  });

  socket.on("message:delete", async ({ messageId }, callback) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) return callback?.({ error: "Message not found" });
      if (String(message.sender) !== userId) {
        return callback?.({ error: "You can only delete your own messages" });
      }
      message.deleted = true;
      message.text = "";
      message.attachments = [];
      await message.save();
      io.to(`conversation:${message.conversation}`).emit("message:deleted", {
        messageId,
        conversationId: message.conversation,
      });
      callback?.({ success: true });
    } catch (err) {
      callback?.({ error: "Failed to delete message" });
    }
  });

  socket.on("message:react", async ({ messageId, emoji }) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) return;

      const existingIndex = message.reactions.findIndex(
        (r) => String(r.user) === userId && r.emoji === emoji
      );
      if (existingIndex >= 0) {
        message.reactions.splice(existingIndex, 1);
      } else {
        message.reactions.push({ user: userId, emoji });
      }
      await message.save();

      const populated = await Message.findById(messageId).populate(
        "sender",
        "username avatarUrl avatarColor"
      );
      io.to(`conversation:${message.conversation}`).emit("message:reacted", { message: populated });

      if (existingIndex < 0 && String(message.sender) !== userId) {
        const notif = await Notification.create({
          recipient: message.sender,
          type: "reaction",
          actor: userId,
          title: `${socket.user.username} reacted to your message`,
          body: emoji,
          link: `/messages/${message.conversation}`,
        });
        io.to(`user:${message.sender}`).emit("notification:new", notif);
      }
    } catch (err) {
      socket.emit("error", { message: "Failed to react to message" });
    }
  });

  // ---------- TYPING INDICATORS (private/group) ----------
  socket.on("typing:start", ({ conversationId }) => {
    setTyping(`conversation:${conversationId}`, userId, socket.user.username, io, socket);
  });

  socket.on("typing:stop", ({ conversationId }) => {
    clearTyping(`conversation:${conversationId}`, userId, io);
  });

  // ---------- ANONYMOUS CIRCLE MESSAGING ----------
  socket.on("circle:send_message", async (payload, callback) => {
    try {
      const { circleId, text, tempId } = payload;
      const circle = await Circle.findById(circleId);
      if (!circle) return callback?.({ error: "Circle not found" });

      const member = circle.members.find((m) => String(m.user) === userId);
      if (!member) return callback?.({ error: "Not a member of this circle" });
      if (!circle.isActive || (circle.expiresAt && circle.expiresAt < new Date())) {
        return callback?.({ error: "This circle has expired" });
      }

      const circleMessage = await CircleMessage.create({
        circle: circleId,
        senderAlias: member.alias,
        senderAliasColor: member.aliasColor,
        senderUser: userId,
        text,
        type: "text",
      });

      circle.lastActivity = new Date();
      await circle.save();

      const safeMessage = circleMessage.toObject();
      delete safeMessage.senderUser;

      // Same fix as private/group messages: don't echo back to the sender's
      // own socket via the room broadcast since they already get this exact
      // message through the ack callback below.
      socket.to(`circle:${circleId}`).emit("circle:new_message", { message: safeMessage, tempId });
      callback?.({ message: safeMessage, tempId });

      clearTyping(`circle:${circleId}`, userId, io);
    } catch (err) {
      callback?.({ error: "Failed to send message" });
    }
  });

  socket.on("circle:react", async ({ circleId, messageId, emoji }) => {
    try {
      const circle = await Circle.findById(circleId);
      const member = circle?.members.find((m) => String(m.user) === userId);
      if (!member) return;

      const message = await CircleMessage.findById(messageId);
      if (!message) return;

      const existingIndex = message.reactions.findIndex(
        (r) => r.alias === member.alias && r.emoji === emoji
      );
      if (existingIndex >= 0) {
        message.reactions.splice(existingIndex, 1);
      } else {
        message.reactions.push({ alias: member.alias, emoji });
      }
      await message.save();

      const safeMessage = message.toObject();
      delete safeMessage.senderUser;
      io.to(`circle:${circleId}`).emit("circle:message_reacted", { message: safeMessage });
    } catch (err) {
      socket.emit("error", { message: "Failed to react" });
    }
  });

  socket.on("circle:typing_start", async ({ circleId }) => {
    try {
      const circle = await Circle.findById(circleId);
      const member = circle?.members.find((m) => String(m.user) === userId);
      if (member) setTyping(`circle:${circleId}`, member.alias, member.alias, io, socket);
    } catch (err) {
      /* noop */
    }
  });

  socket.on("circle:typing_stop", async ({ circleId }) => {
    try {
      const circle = await Circle.findById(circleId);
      const member = circle?.members.find((m) => String(m.user) === userId);
      if (member) clearTyping(`circle:${circleId}`, member.alias, io);
    } catch (err) {
      /* noop */
    }
  });

  // ---------- POLLS (real-time vote updates) ----------
  socket.on("poll:vote", async ({ pollId, optionId }, callback) => {
    try {
      const poll = await Poll.findById(pollId);
      if (!poll) return callback?.({ error: "Poll not found" });
      if (poll.isClosed || (poll.expiresAt && poll.expiresAt < new Date())) {
        return callback?.({ error: "Poll has expired" });
      }

      let voterIdentity;
      let roomKey;
      if (poll.context === "group") {
        voterIdentity = userId;
        roomKey = `conversation:${poll.conversation}`;
      } else {
        const circle = await Circle.findById(poll.circle);
        const member = circle?.members.find((m) => String(m.user) === userId);
        if (!member) return callback?.({ error: "Not a member of this circle" });
        voterIdentity = member.alias;
        roomKey = `circle:${poll.circle}`;
      }

      poll.options.forEach((opt) => {
        opt.votes = opt.votes.filter((v) => v !== voterIdentity);
      });
      const target = poll.options.find((o) => String(o._id) === String(optionId));
      if (!target) return callback?.({ error: "Option not found" });
      target.votes.push(voterIdentity);
      await poll.save();

      const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);
      const pollUpdate = {
        id: poll._id,
        totalVotes,
        options: poll.options.map((o) => ({
          id: o._id,
          text: o.text,
          voteCount: o.votes.length,
          percentage: totalVotes > 0 ? Math.round((o.votes.length / totalVotes) * 100) : 0,
        })),
      };

      io.to(roomKey).emit("poll:updated", pollUpdate);
      callback?.({ success: true });
    } catch (err) {
      callback?.({ error: "Failed to vote" });
    }
  });

  // ---------- DISCONNECT ----------
  socket.on("disconnect", async () => {
    const fullyOffline = removeUserSocket(userId, socket.id);
    if (fullyOffline) {
      const lastSeen = new Date();
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen }).catch(() => {});
      socket.broadcast.emit("presence:offline", { userId, lastSeen });
      clearAllTypingForUser(userId, io);
    }
  });
}

// ---------- TYPING HELPERS ----------
function setTyping(roomKey, identity, displayName, io, socket) {
  if (!typingState.has(roomKey)) typingState.set(roomKey, new Map());
  const room = typingState.get(roomKey);
  room.set(identity, displayName);
  socket.to(roomKey).emit("typing:update", {
    room: roomKey,
    typingUsers: Array.from(room.values()),
  });
}

function clearTyping(roomKey, identity, io) {
  if (!typingState.has(roomKey)) return;
  const room = typingState.get(roomKey);
  if (room.delete(identity)) {
    io.to(roomKey).emit("typing:update", {
      room: roomKey,
      typingUsers: Array.from(room.values()),
    });
  }
}

function clearAllTypingForUser(userId, io) {
  for (const [roomKey, room] of typingState.entries()) {
    if (room.delete(userId)) {
      io.to(roomKey).emit("typing:update", {
        room: roomKey,
        typingUsers: Array.from(room.values()),
      });
    }
  }
}
