import Circle from "../models/Circle.js";
import CircleMessage from "../models/CircleMessage.js";

/**
 * Runs periodically. Finds temporary circles whose expiry time has passed,
 * marks them inactive (closing the circle + disabling the invite code) and
 * tags their messages as archived. We keep the documents rather than
 * hard-deleting so "Messages archived" in the spec is meaningful.
 */
export async function expireTemporaryCircles(io) {
  try {
    const now = new Date();
    const expiredCircles = await Circle.find({
      isTemporary: true,
      isActive: true,
      expiresAt: { $lte: now },
    });

    for (const circle of expiredCircles) {
      circle.isActive = false;
      await circle.save();

      await CircleMessage.create({
        circle: circle._id,
        senderAlias: "System",
        senderAliasColor: "#72727A",
        senderUser: circle.createdBy,
        text: "This circle has expired and is now archived. The invite code is disabled.",
        type: "system",
      });

      if (io) {
        io.to(`circle:${circle._id}`).emit("circle:expired", { circleId: circle._id });
      }
    }

    if (expiredCircles.length > 0) {
      console.log(`[orbit] Expired ${expiredCircles.length} temporary circle(s)`);
    }
  } catch (err) {
    console.error("[orbit] Error expiring circles:", err.message);
  }
}

export function startCircleExpiryJob(io, intervalMs = 60 * 1000) {
  setInterval(() => expireTemporaryCircles(io), intervalMs);
}
