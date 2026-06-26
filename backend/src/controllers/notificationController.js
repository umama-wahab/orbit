import Notification from "../models/Notification.js";

export async function getNotifications(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("actor", "username avatarUrl avatarColor")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const { id } = req.params;
    await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { isRead: true }
    );
    res.json({ message: "Marked as read" });
  } catch (err) {
    next(err);
  }
}

export async function markAllNotificationsRead(req, res, next) {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
}

export async function deleteNotification(req, res, next) {
  try {
    const { id } = req.params;
    await Notification.findOneAndDelete({ _id: id, recipient: req.user._id });
    res.json({ message: "Notification deleted" });
  } catch (err) {
    next(err);
  }
}

// Internal helper used by sockets/controllers to create + emit notifications
export async function createNotification({ recipient, type, actor, title, body, link }) {
  return Notification.create({ recipient, type, actor, title, body, link });
}
