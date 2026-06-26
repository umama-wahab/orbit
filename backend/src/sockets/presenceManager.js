// Maps userId -> Set of active socket ids, so a user with multiple tabs/devices
// is only considered offline once ALL their sockets disconnect.
const userSockets = new Map();

export function addUserSocket(userId, socketId) {
  if (!userSockets.has(userId)) userSockets.set(userId, new Set());
  userSockets.get(userId).add(socketId);
  return userSockets.get(userId).size === 1; // true if this is their first connection
}

export function removeUserSocket(userId, socketId) {
  if (!userSockets.has(userId)) return true;
  const sockets = userSockets.get(userId);
  sockets.delete(socketId);
  if (sockets.size === 0) {
    userSockets.delete(userId);
    return true; // true if user has no more active connections
  }
  return false;
}

export function isUserOnline(userId) {
  return userSockets.has(userId) && userSockets.get(userId).size > 0;
}

export function getOnlineUserIds() {
  return Array.from(userSockets.keys());
}
