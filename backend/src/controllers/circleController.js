import Circle from "../models/Circle.js";
import CircleMessage from "../models/CircleMessage.js";
import User from "../models/User.js";
import { generateAlias, generateAliasColor } from "../utils/aliasGenerator.js";
import { generateInviteCode } from "../utils/inviteCodeGenerator.js";

const DURATION_MAP = {
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};

function toMemberPublic(member) {
  return {
    alias: member.alias,
    aliasColor: member.aliasColor,
    joinedAt: member.joinedAt,
  };
}

function toCirclePublic(circle, currentUserId) {
  const me = circle.members.find((m) => String(m.user) === String(currentUserId));
  return {
    id: circle._id,
    name: circle.name,
    description: circle.description,
    inviteCode: circle.inviteCode,
    memberCount: circle.members.length,
    members: circle.members.map(toMemberPublic),
    isTemporary: circle.isTemporary,
    expiresAt: circle.expiresAt,
    isActive: circle.isActive,
    myAlias: me ? me.alias : null,
    myAliasColor: me ? me.aliasColor : null,
    isCreator: String(circle.createdBy) === String(currentUserId),
    createdAt: circle.createdAt,
    lastActivity: circle.lastActivity,
  };
}

export async function createCircle(req, res, next) {
  try {
    const { name, description, isTemporary, duration, customHours } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Circle name is required" });
    }

    let inviteCode = generateInviteCode();
    // Extremely unlikely collision, but guard anyway
    let attempts = 0;
    while ((await Circle.findOne({ inviteCode })) && attempts < 5) {
      inviteCode = generateInviteCode();
      attempts++;
    }

    let expiresAt = null;
    if (isTemporary) {
      if (duration === "custom" && customHours) {
        expiresAt = new Date(Date.now() + Number(customHours) * 60 * 60 * 1000);
      } else if (DURATION_MAP[duration]) {
        expiresAt = new Date(Date.now() + DURATION_MAP[duration]);
      } else {
        return res.status(400).json({ message: "Invalid duration for temporary circle" });
      }
    }

    const alias = generateAlias();
    const aliasColor = generateAliasColor();

    const circle = await Circle.create({
      name: name.trim(),
      description: description || "",
      inviteCode,
      createdBy: req.user._id,
      members: [{ user: req.user._id, alias, aliasColor }],
      isTemporary: !!isTemporary,
      expiresAt,
    });

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { joinedCircles: circle._id } });

    res.status(201).json({ circle: toCirclePublic(circle, req.user._id) });
  } catch (err) {
    next(err);
  }
}

export async function joinCircle(req, res, next) {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) return res.status(400).json({ message: "Invite code is required" });

    const circle = await Circle.findOne({ inviteCode: inviteCode.toUpperCase().trim() });
    if (!circle) return res.status(404).json({ message: "Invalid invite code" });

    if (!circle.isActive || (circle.expiresAt && circle.expiresAt < new Date())) {
      return res.status(410).json({ message: "This circle has expired" });
    }

    const alreadyMember = circle.members.some((m) => String(m.user) === String(req.user._id));
    if (alreadyMember) {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { joinedCircles: circle._id } });
      return res.json({ circle: toCirclePublic(circle, req.user._id) });
    }

    const usedAliases = new Set(circle.members.map((m) => m.alias));
    const alias = generateAlias(usedAliases);
    const aliasColor = generateAliasColor();

    circle.members.push({ user: req.user._id, alias, aliasColor });
    circle.lastActivity = new Date();
    await circle.save();

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { joinedCircles: circle._id } });

    await CircleMessage.create({
      circle: circle._id,
      senderAlias: "System",
      senderAliasColor: "#72727A",
      senderUser: req.user._id,
      text: `${alias} joined the circle`,
      type: "system",
    });

    res.status(201).json({ circle: toCirclePublic(circle, req.user._id) });
  } catch (err) {
    next(err);
  }
}

export async function getMyCircles(req, res, next) {
  try {
    const circles = await Circle.find({
      "members.user": req.user._id,
      isActive: true,
    }).sort({ lastActivity: -1 });

    res.json({ circles: circles.map((c) => toCirclePublic(c, req.user._id)) });
  } catch (err) {
    next(err);
  }
}

export async function getCircleById(req, res, next) {
  try {
    const circle = await Circle.findById(req.params.id);
    if (!circle) return res.status(404).json({ message: "Circle not found" });

    const isMember = circle.members.some((m) => String(m.user) === String(req.user._id));
    if (!isMember) return res.status(403).json({ message: "You are not a member of this circle" });

    res.json({ circle: toCirclePublic(circle, req.user._id) });
  } catch (err) {
    next(err);
  }
}

export async function leaveCircle(req, res, next) {
  try {
    const circle = await Circle.findById(req.params.id);
    if (!circle) return res.status(404).json({ message: "Circle not found" });

    const member = circle.members.find((m) => String(m.user) === String(req.user._id));
    if (!member) return res.status(403).json({ message: "You are not a member of this circle" });

    circle.members = circle.members.filter((m) => String(m.user) !== String(req.user._id));
    await circle.save();
    await User.findByIdAndUpdate(req.user._id, { $pull: { joinedCircles: circle._id } });

    await CircleMessage.create({
      circle: circle._id,
      senderAlias: "System",
      senderAliasColor: "#72727A",
      senderUser: req.user._id,
      text: `${member.alias} left the circle`,
      type: "system",
    });

    res.json({ message: "Left circle" });
  } catch (err) {
    next(err);
  }
}

// Discover public-ish trending circles (non-temporary, sorted by activity) for the right panel
export async function getTrendingCircles(req, res, next) {
  try {
    const circles = await Circle.find({ isActive: true, isTemporary: false })
      .sort({ lastActivity: -1 })
      .limit(8)
      .select("name description memberCount members lastActivity");

    res.json({
      circles: circles.map((c) => ({
        id: c._id,
        name: c.name,
        description: c.description,
        memberCount: c.members.length,
        lastActivity: c.lastActivity,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getCircleMessages(req, res, next) {
  try {
    const { id } = req.params;
    const { before, limit = 40 } = req.query;

    const circle = await Circle.findById(id);
    if (!circle) return res.status(404).json({ message: "Circle not found" });
    if (!circle.members.some((m) => String(m.user) === String(req.user._id))) {
      return res.status(403).json({ message: "You are not a member of this circle" });
    }

    const query = { circle: id };
    if (before) query.createdAt = { $lt: new Date(before) };

    const messages = await CircleMessage.find(query)
      .populate("poll")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select("-senderUser");

    res.json({ messages: messages.reverse() });
  } catch (err) {
    next(err);
  }
}
