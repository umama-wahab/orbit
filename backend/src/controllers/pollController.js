import Poll from "../models/Poll.js";
import Circle from "../models/Circle.js";
import Conversation from "../models/Conversation.js";
import CircleMessage from "../models/CircleMessage.js";

function toPollPublic(poll, voterIdentity) {
  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);
  return {
    id: poll._id,
    question: poll.question,
    context: poll.context,
    isAnonymous: poll.isAnonymous,
    isClosed: poll.isClosed || (poll.expiresAt && poll.expiresAt < new Date()),
    expiresAt: poll.expiresAt,
    totalVotes,
    options: poll.options.map((o) => ({
      id: o._id,
      text: o.text,
      voteCount: o.votes.length,
      percentage: totalVotes > 0 ? Math.round((o.votes.length / totalVotes) * 100) : 0,
      votedByMe: voterIdentity ? o.votes.includes(voterIdentity) : false,
    })),
  };
}

export async function createPoll(req, res, next) {
  try {
    const { question, options, context, conversationId, circleId, expiresInMinutes } = req.body;

    if (!question || !options || options.length < 2) {
      return res.status(400).json({ message: "Poll needs a question and at least 2 options" });
    }
    if (!["group", "circle"].includes(context)) {
      return res.status(400).json({ message: "Invalid poll context" });
    }

    let voterIdentity;
    if (context === "group") {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.isGroup) {
        return res.status(404).json({ message: "Group not found" });
      }
      if (!conversation.participants.some((p) => String(p) === String(req.user._id))) {
        return res.status(403).json({ message: "You are not a member of this group" });
      }
      voterIdentity = String(req.user._id);
    } else {
      const circle = await Circle.findById(circleId);
      if (!circle) return res.status(404).json({ message: "Circle not found" });
      const member = circle.members.find((m) => String(m.user) === String(req.user._id));
      if (!member) return res.status(403).json({ message: "You are not a member of this circle" });
      voterIdentity = member.alias;
    }

    const expiresAt = expiresInMinutes ? new Date(Date.now() + expiresInMinutes * 60 * 1000) : null;

    const poll = await Poll.create({
      question: question.trim(),
      options: options.map((text) => ({ text: text.trim(), votes: [] })),
      context,
      conversation: context === "group" ? conversationId : undefined,
      circle: context === "circle" ? circleId : undefined,
      createdBy: req.user._id,
      expiresAt,
    });

    if (context === "circle") {
      const circle = await Circle.findById(circleId);
      const member = circle.members.find((m) => String(m.user) === String(req.user._id));
      await CircleMessage.create({
        circle: circleId,
        senderAlias: member.alias,
        senderAliasColor: member.aliasColor,
        senderUser: req.user._id,
        type: "poll",
        poll: poll._id,
      });
    }

    res.status(201).json({ poll: toPollPublic(poll, voterIdentity) });
  } catch (err) {
    next(err);
  }
}

export async function votePoll(req, res, next) {
  try {
    const { id } = req.params;
    const { optionId } = req.body;

    const poll = await Poll.findById(id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    if (poll.isClosed || (poll.expiresAt && poll.expiresAt < new Date())) {
      return res.status(410).json({ message: "This poll has expired" });
    }

    let voterIdentity;
    if (poll.context === "group") {
      voterIdentity = String(req.user._id);
    } else {
      const circle = await Circle.findById(poll.circle);
      const member = circle.members.find((m) => String(m.user) === String(req.user._id));
      if (!member) return res.status(403).json({ message: "You are not a member of this circle" });
      voterIdentity = member.alias;
    }

    // Remove any prior vote by this voter across all options (single-choice voting)
    poll.options.forEach((opt) => {
      opt.votes = opt.votes.filter((v) => v !== voterIdentity);
    });

    const target = poll.options.find((o) => String(o._id) === String(optionId));
    if (!target) return res.status(404).json({ message: "Option not found" });
    target.votes.push(voterIdentity);

    await poll.save();
    res.json({ poll: toPollPublic(poll, voterIdentity) });
  } catch (err) {
    next(err);
  }
}

export async function getPoll(req, res, next) {
  try {
    const { id } = req.params;
    const poll = await Poll.findById(id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    let voterIdentity;
    if (poll.context === "group") {
      voterIdentity = String(req.user._id);
    } else {
      const circle = await Circle.findById(poll.circle);
      const member = circle?.members.find((m) => String(m.user) === String(req.user._id));
      voterIdentity = member ? member.alias : null;
    }

    res.json({ poll: toPollPublic(poll, voterIdentity) });
  } catch (err) {
    next(err);
  }
}

export async function closePoll(req, res, next) {
  try {
    const { id } = req.params;
    const poll = await Poll.findById(id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    if (String(poll.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only the poll creator can close it" });
    }
    poll.isClosed = true;
    await poll.save();
    res.json({ message: "Poll closed" });
  } catch (err) {
    next(err);
  }
}
