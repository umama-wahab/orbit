import Confession from "../models/Confession.js";
import Comment from "../models/Comment.js";

function toConfessionPublic(confession, currentUserId) {
  return {
    id: confession._id,
    text: confession.text,
    category: confession.category,
    likeCount: confession.likes.length,
    isLikedByMe: confession.likes.some((id) => String(id) === String(currentUserId)),
    commentCount: confession.commentCount,
    createdAt: confession.createdAt,
    isMine: String(confession.author) === String(currentUserId),
  };
}

export async function createConfession(req, res, next) {
  try {
    const { text, category } = req.body;
    const validCategories = [
      "College",
      "Gaming",
      "Relationships",
      "Work",
      "Random Thoughts",
      "Funny Stories",
    ];

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Confession text is required" });
    }
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const confession = await Confession.create({
      text: text.trim(),
      category,
      author: req.user._id,
    });

    res.status(201).json({ confession: toConfessionPublic(confession, req.user._id) });
  } catch (err) {
    next(err);
  }
}

export async function getConfessions(req, res, next) {
  try {
    const { category, sort = "recent", page = 1, limit = 15 } = req.query;

    const query = { isHidden: false };
    if (category && category !== "All") query.category = category;

    const sortOption = sort === "trending" ? { likeCount: -1, createdAt: -1 } : { createdAt: -1 };

    let confessionsQuery = Confession.find(query);

    if (sort === "trending") {
      // Trending = most liked in the last 48 hours, falls back to overall likes
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
      confessionsQuery = Confession.find({ ...query, createdAt: { $gte: cutoff } });
    }

    const confessions = await confessionsQuery
      .sort(sort === "trending" ? {} : sortOption)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    let results = confessions.map((c) => toConfessionPublic(c, req.user._id));

    if (sort === "trending") {
      results = results.sort((a, b) => b.likeCount - a.likeCount);
    }

    res.json({ confessions: results });
  } catch (err) {
    next(err);
  }
}

export async function likeConfession(req, res, next) {
  try {
    const { id } = req.params;
    const confession = await Confession.findById(id);
    if (!confession) return res.status(404).json({ message: "Confession not found" });

    const liked = confession.likes.some((u) => String(u) === String(req.user._id));
    if (liked) {
      confession.likes = confession.likes.filter((u) => String(u) !== String(req.user._id));
    } else {
      confession.likes.push(req.user._id);
    }
    await confession.save();

    res.json({ confession: toConfessionPublic(confession, req.user._id) });
  } catch (err) {
    next(err);
  }
}

export async function reportConfession(req, res, next) {
  try {
    const { id } = req.params;
    const confession = await Confession.findById(id);
    if (!confession) return res.status(404).json({ message: "Confession not found" });

    const alreadyReported = confession.reportedBy.some((u) => String(u) === String(req.user._id));
    if (alreadyReported) {
      return res.status(409).json({ message: "You already reported this confession" });
    }

    confession.reportedBy.push(req.user._id);
    confession.reportCount += 1;
    if (confession.reportCount >= 5) confession.isHidden = true;
    await confession.save();

    res.json({ message: "Confession reported" });
  } catch (err) {
    next(err);
  }
}

export async function getComments(req, res, next) {
  try {
    const { id } = req.params;
    const comments = await Comment.find({ confession: id }).sort({ createdAt: 1 });

    res.json({
      comments: comments.map((c) => ({
        id: c._id,
        text: c.text,
        likeCount: c.likes.length,
        isLikedByMe: c.likes.some((u) => String(u) === String(req.user._id)),
        createdAt: c.createdAt,
        isMine: String(c.author) === String(req.user._id),
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function addComment(req, res, next) {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const confession = await Confession.findById(id);
    if (!confession) return res.status(404).json({ message: "Confession not found" });

    const comment = await Comment.create({
      confession: id,
      author: req.user._id,
      text: text.trim(),
    });

    confession.commentCount += 1;
    await confession.save();

    res.status(201).json({
      comment: {
        id: comment._id,
        text: comment.text,
        likeCount: 0,
        isLikedByMe: false,
        createdAt: comment.createdAt,
        isMine: true,
      },
      confessionAuthorId: confession.author,
    });
  } catch (err) {
    next(err);
  }
}
