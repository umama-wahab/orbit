import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smile } from "lucide-react";
import { formatMessageTime, cn } from "@/lib/utils";

const QUICK_EMOJIS = ["❤️", "😂", "👍", "😮", "😢", "🔥"];

export default function CircleMessageBubble({ message, isMine, onReact }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  if (message.type === "system") {
    return (
      <div className="flex justify-center py-1">
        <span
          className="text-[11px] font-semibold px-3.5 py-1.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)", color: "#75757F" }}
        >
          {message.text}
        </span>
      </div>
    );
  }

  const groupedReactions = (message.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex gap-2.5 px-1 group", isMine ? "justify-end" : "justify-start")}
      onMouseLeave={() => setShowEmojiPicker(false)}
    >
      <div className={cn("flex flex-col max-w-[68%]", isMine ? "items-end" : "items-start")}>
        {!isMine && (
          <span
            className="inline-flex items-center text-[11px] font-bold mb-1.5 ml-1 px-2 py-0.5 rounded-full"
            style={{ background: `${message.senderAliasColor}1F`, color: message.senderAliasColor }}
          >
            {message.senderAlias}
          </span>
        )}
        <div className="relative flex items-center gap-2">
          <div
            className="px-4 py-2.5 text-[14px] leading-relaxed break-words whitespace-pre-wrap elevated-sm"
            style={{
              background: isMine ? "var(--bubble-mine)" : "rgba(255,255,255,0.05)",
              color: isMine ? "var(--bubble-mine-text)" : "#F2F2F2",
              border: !isMine ? `1px solid ${message.senderAliasColor}33` : "none",
              borderRadius: isMine
                ? "var(--radius-lg) var(--radius-lg) 6px var(--radius-lg)"
                : "var(--radius-lg) var(--radius-lg) var(--radius-lg) 6px",
            }}
          >
            {message.text}
          </div>
          <button
            onClick={() => setShowEmojiPicker((v) => !v)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full transition-opacity"
            style={{ background: "rgba(255,255,255,0.06)", color: "#9A9AA4" }}
          >
            <Smile size={13} />
          </button>
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.9 }}
                className="absolute -top-12 flex gap-1 px-2.5 py-2 rounded-full elevated z-10"
                style={{ background: "#222228", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {QUICK_EMOJIS.map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.35, y: -2 }}
                    onClick={() => {
                      onReact(message._id, emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="text-base"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {Object.keys(groupedReactions).length > 0 && (
          <div className="flex gap-1 mt-1.5">
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <span
                key={emoji}
                className="text-[11px] px-2 py-1 rounded-full font-semibold"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                {emoji} {count > 1 && count}
              </span>
            ))}
          </div>
        )}
        <span className="text-[10px] mt-1.5 px-1 font-medium" style={{ color: "#5C5C66" }}>
          {formatMessageTime(message.createdAt)}
        </span>
      </div>
    </motion.div>
  );
}
