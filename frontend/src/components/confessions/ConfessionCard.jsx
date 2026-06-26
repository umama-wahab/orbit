import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Flag, MoreHorizontal, Share2, Ghost, Check } from "lucide-react";
import api from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import Card from "@/components/ui/Card";

const CATEGORY_STYLES = {
  College: { bg: "rgba(240,123,63,0.14)", color: "#F07B3F" },
  Gaming: { bg: "rgba(141,71,245,0.14)", color: "#8D47F5" },
  Relationships: { bg: "rgba(216,79,131,0.14)", color: "#D84F83" },
  Work: { bg: "rgba(217,122,43,0.14)", color: "#D97A2B" },
  "Random Thoughts": { bg: "rgba(111,168,105,0.14)", color: "#6FA869" },
  "Funny Stories": { bg: "rgba(233,106,95,0.14)", color: "#E96A5F" },
};

export default function ConfessionCard({ confession, onOpenComments }) {
  const [liked, setLiked] = useState(confession.isLikedByMe);
  const [likeCount, setLikeCount] = useState(confession.likeCount);
  const [burst, setBurst] = useState(false);
  const [reported, setReported] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleLike = async () => {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    if (!liked) {
      setBurst(true);
      setTimeout(() => setBurst(false), 500);
    }
    try {
      await api.post(`/confessions/${confession.id}/like`);
    } catch {
      setLiked((v) => !v);
      setLikeCount((c) => (liked ? c + 1 : c - 1));
    }
  };

  const handleReport = async () => {
    setShowMenu(false);
    try {
      await api.post(`/confessions/${confession.id}/report`);
      setReported(true);
    } catch {
      /* noop */
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/app/confessions?id=${confession.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable, silently no-op */
    }
  };

  const categoryStyle = CATEGORY_STYLES[confession.category] || CATEGORY_STYLES.College;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="p-6 relative" hover>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "var(--card)", border: "1.5px dashed var(--border)" }}
            >
              <Ghost size={14} style={{ color: "var(--text-muted)" }} />
            </div>
            <div>
              <p className="text-[12.5px] font-bold leading-tight" style={{ color: "var(--text-secondary)" }}>
                Anonymous
              </p>
              <p className="text-[10.5px] font-medium leading-tight" style={{ color: "var(--text-muted)" }}>
                {formatRelativeTime(confession.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="text-[11px] font-bold px-3 py-1.5 rounded-full"
              style={{ background: categoryStyle.bg, color: categoryStyle.color }}
            >
              {confession.category}
            </span>
            <div className="relative">
              <button onClick={() => setShowMenu((v) => !v)} className="p-1" style={{ color: "var(--text-muted)" }}>
                <MoreHorizontal size={16} />
              </button>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-7 z-10 rounded-[var(--radius-base)] elevated overflow-hidden"
                  style={{ background: "var(--surface)", border: "1px solid var(--border-soft)" }}
                >
                  <button
                    onClick={handleReport}
                    disabled={reported}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap"
                    style={{ color: "var(--notification)" }}
                  >
                    <Flag size={12} /> {reported ? "Reported" : "Report"}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <p className="text-[15px] leading-[1.6] mb-5 font-medium" style={{ color: "var(--text-primary)" }}>
          {confession.text}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button onClick={toggleLike} className="flex items-center gap-1.5 text-sm relative">
              <motion.div whileTap={{ scale: 0.8 }} className="relative">
                <Heart size={17} fill={liked ? "var(--notification)" : "none"} color={liked ? "var(--notification)" : "var(--text-secondary)"} strokeWidth={2} />
                {burst && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 rounded-full"
                    style={{ background: "var(--notification)" }}
                  />
                )}
              </motion.div>
              <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>
                {likeCount}
              </span>
            </button>
            <button onClick={() => onOpenComments(confession)} className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              <MessageCircle size={17} />
              {confession.commentCount}
            </button>
            <button onClick={handleShare} className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: copied ? "var(--success)" : "var(--text-secondary)" }}>
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              {copied ? "Copied" : "Share"}
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
