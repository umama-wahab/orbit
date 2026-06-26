import User from "../models/User.js";

export async function updateProfile(req, res, next) {
  try {
    const { username, bio, avatarUrl, avatarColor } = req.body;
    const user = req.user;

    if (username && username !== user.username) {
      const exists = await User.findOne({ username, _id: { $ne: user._id } });
      if (exists) return res.status(409).json({ message: "Username already taken" });
      user.username = username;
    }

    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (avatarColor !== undefined) user.avatarColor = avatarColor;

    await user.save();
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}

export async function updateTheme(req, res, next) {
  try {
    const { theme } = req.body;
    if (!["social", "focus", "shadow"].includes(theme)) {
      return res.status(400).json({ message: "Invalid theme" });
    }
    req.user.theme = theme;
    await req.user.save();
    res.json({ theme: req.user.theme });
  } catch (err) {
    next(err);
  }
}

export async function searchUsers(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ users: [] });
    }

    const users = await User.find({
      _id: { $ne: req.user._id },
      username: { $regex: q.trim(), $options: "i" },
    })
      .limit(15)
      .select("username bio avatarUrl avatarColor isOnline lastSeen");

    res.json({ users });
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select(
      "username bio avatarUrl avatarColor isOnline lastSeen createdAt"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function getContacts(req, res, next) {
  try {
    const user = await User.findById(req.user._id).populate(
      "contacts",
      "username bio avatarUrl avatarColor isOnline lastSeen"
    );
    res.json({ contacts: user.contacts });
  } catch (err) {
    next(err);
  }
}

export async function addContact(req, res, next) {
  try {
    const { userId } = req.body;
    if (userId === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot add yourself as a contact" });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (!req.user.contacts.includes(userId)) {
      req.user.contacts.push(userId);
      await req.user.save();
    }
    if (!targetUser.contacts.includes(req.user._id)) {
      targetUser.contacts.push(req.user._id);
      await targetUser.save();
    }

    res.json({ message: "Contact added" });
  } catch (err) {
    next(err);
  }
}
