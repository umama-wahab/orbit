import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

export async function sendMessage(req, res, next) {
  try {
    const { conversationId, text, attachments = [] } = req.body;

    if (!text && attachments.length === 0) {
      return res.status(400).json({ message: "Message must contain text or an attachment" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    if (!conversation.participants.some((p) => String(p) === String(req.user._id))) {
      return res.status(403).json({ message: "You are not part of this conversation" });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text: text || "",
      attachments,
      readBy: [req.user._id],
    });

    conversation.lastMessage = message._id;
    conversation.lastActivity = new Date();
    await conversation.save();

    const populated = await Message.findById(message._id).populate(
      "sender",
      "username avatarUrl avatarColor"
    );

    res.status(201).json({ message: populated });
  } catch (err) {
    next(err);
  }
}

export async function editMessage(req, res, next) {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    if (String(message.sender) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }

    message.text = text;
    message.edited = true;
    await message.save();

    const populated = await Message.findById(id).populate("sender", "username avatarUrl avatarColor");
    res.json({ message: populated });
  } catch (err) {
    next(err);
  }
}

export async function deleteMessage(req, res, next) {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    if (String(message.sender) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    message.deleted = true;
    message.text = "";
    message.attachments = [];
    await message.save();

    res.json({ message: "Message deleted", id });
  } catch (err) {
    next(err);
  }
}

export async function reactToMessage(req, res, next) {
  try {
    const { id } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const existingIndex = message.reactions.findIndex(
      (r) => String(r.user) === String(req.user._id) && r.emoji === emoji
    );

    if (existingIndex >= 0) {
      message.reactions.splice(existingIndex, 1);
    } else {
      message.reactions.push({ user: req.user._id, emoji });
    }

    await message.save();
    const populated = await Message.findById(id).populate("sender", "username avatarUrl avatarColor");
    res.json({ message: populated });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const { conversationId } = req.body;
    await Message.updateMany(
      { conversation: conversationId, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ message: "Marked as read" });
  } catch (err) {
    next(err);
  }
}
