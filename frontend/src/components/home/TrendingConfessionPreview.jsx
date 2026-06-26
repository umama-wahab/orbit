import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

const CATEGORY_STYLES = {
  College: { bg: "rgba(240,123,63,0.14)", color: "#F07B3F" },
  Gaming: { bg: "rgba(141,71,245,0.14)", color: "#8D47F5" },
  Relationships: { bg: "rgba(216,79,131,0.14)", color: "#D84F83" },
  Work: { bg: "rgba(217,122,43,0.14)", color: "#D97A2B" },
  "Random Thoughts": { bg: "rgba(111,168,105,0.14)", color: "#6FA869" },
  "Funny Stories": { bg: "rgba(233,106,95,0.14)", color: "#E96A5F" },
};

export default function TrendingConfessionPreview({ confession, onClick, index = 0 }) {
  const style = CATEGORY_STYLES[confession.category] || CATEGORY_STYLES.College;

  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      onClick={onClick}
      className="text-left rounded-[var(--radius-lg)] p-5 elevated flex flex-col h-full"
      style={{ background: "var(--card)", border: "1px solid var(--border-soft)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: style.bg, color: style.color }}>
          {confession.category}
        </span>
        <span className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
          {formatRelativeTime(confession.createdAt)}
        </span>
      </div>
      <p className="text-[13.5px] leading-relaxed font-medium mb-4 flex-1" style={{ color: "var(--text-primary)" }}>
        {confession.text.length > 120 ? `${confession.text.slice(0, 120)}…` : confession.text}
      </p>
      <div className="flex items-center gap-4 pt-1">
        <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
          <Heart size={13} fill={confession.isLikedByMe ? "var(--notification)" : "none"} color={confession.isLikedByMe ? "var(--notification)" : "var(--text-secondary)"} />
          {confession.likeCount}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
          <MessageCircle size={13} />
          {confession.commentCount}
        </span>
      </div>
    </motion.button>
  );
}
