import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

// Get all conversations (private + group) for the logged-in user
export async function getConversations(req, res, next) {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate("participants", "username avatarUrl avatarColor isOnline lastSeen")
      .populate("lastMessage")
      .sort({ lastActivity: -1 });

    res.json({ conversations });
  } catch (err) {
    next(err);
  }
}

// Create or fetch an existing private (1:1) conversation
export async function createPrivateConversation(req, res, next) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (userId === String(req.user._id)) {
      return res.status(400).json({ message: "Cannot start a conversation with yourself" });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [req.user._id, userId], $size: 2 },
    }).populate("participants", "username avatarUrl avatarColor isOnline lastSeen");

    if (!conversation) {
      conversation = await Conversation.create({
        isGroup: false,
        participants: [req.user._id, userId],
      });
      conversation = await Conversation.findById(conversation._id).populate(
        "participants",
        "username avatarUrl avatarColor isOnline lastSeen"
      );
    }

    res.status(201).json({ conversation });
  } catch (err) {
    next(err);
  }
}

// Create a group
export async function createGroup(req, res, next) {
  try {
    const { name, participantIds = [], icon } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const uniqueParticipants = Array.from(new Set([...participantIds, String(req.user._id)]));

    const conversation = await Conversation.create({
      isGroup: true,
      name: name.trim(),
      icon: icon || "",
      participants: uniqueParticipants,
      admins: [req.user._id],
      createdBy: req.user._id,
    });

    const populated = await Conversation.findById(conversation._id).populate(
      "participants",
      "username avatarUrl avatarColor isOnline lastSeen"
    );

    res.status(201).json({ conversation: populated });
  } catch (err) {
    next(err);
  }
}

export async function updateGroup(req, res, next) {
  try {
    const { id } = req.params;
    const { name, icon } = req.body;

    const conversation = await Conversation.findById(id);
    if (!conversation || !conversation.isGroup) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (!conversation.admins.some((a) => String(a) === String(req.user._id))) {
      return res.status(403).json({ message: "Only group admins can update group settings" });
    }

    if (name) conversation.name = name.trim();
    if (icon !== undefined) conversation.icon = icon;
    await conversation.save();

    const populated = await Conversation.findById(id).populate(
      "participants",
      "username avatarUrl avatarColor isOnline lastSeen"
    );

    res.json({ conversation: populated });
  } catch (err) {
    next(err);
  }
}

export async function addGroupMembers(req, res, next) {
  try {
    const { id } = req.params;
    const { userIds = [] } = req.body;

    const conversation = await Conversation.findById(id);
    if (!conversation || !conversation.isGroup) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (!conversation.participants.some((p) => String(p) === String(req.user._id))) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    const newSet = new Set([...conversation.participants.map(String), ...userIds]);
    conversation.participants = Array.from(newSet);
    await conversation.save();

    const populated = await Conversation.findById(id).populate(
      "participants",
      "username avatarUrl avatarColor isOnline lastSeen"
    );

    res.json({ conversation: populated });
  } catch (err) {
    next(err);
  }
}

export async function makeGroupAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const conversation = await Conversation.findById(id);
    if (!conversation || !conversation.isGroup) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (!conversation.admins.some((a) => String(a) === String(req.user._id))) {
      return res.status(403).json({ message: "Only group admins can assign admins" });
    }
    if (!conversation.admins.some((a) => String(a) === String(userId))) {
      conversation.admins.push(userId);
      await conversation.save();
    }

    res.json({ message: "Admin assigned" });
  } catch (err) {
    next(err);
  }
}

// Get messages for a conversation (paginated)
export async function getMessages(req, res, next) {
  try {
    const { id } = req.params;
    const { before, limit = 30 } = req.query;

    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    if (!conversation.participants.some((p) => String(p) === String(req.user._id))) {
      return res.status(403).json({ message: "You are not part of this conversation" });
    }

    const query = { conversation: id, deleted: { $ne: true } };
    if (before) query.createdAt = { $lt: new Date(before) };

    const messages = await Message.find(query)
      .populate("sender", "username avatarUrl avatarColor")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ messages: messages.reverse() });
  } catch (err) {
    next(err);
  }
}

export async function searchMessages(req, res, next) {
  try {
    const { id } = req.params;
    const { q } = req.query;
    if (!q || q.trim().length === 0) return res.json({ messages: [] });

    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    if (!conversation.participants.some((p) => String(p) === String(req.user._id))) {
      return res.status(403).json({ message: "You are not part of this conversation" });
    }

    const messages = await Message.find({
      conversation: id,
      deleted: { $ne: true },
      text: { $regex: q.trim(), $options: "i" },
    })
      .populate("sender", "username avatarUrl avatarColor")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ messages });
  } catch (err) {
    next(err);
  }
}
