import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Smile, Check, CheckCheck } from "lucide-react";
import { formatMessageTime, cn } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";

const QUICK_EMOJIS = ["❤️", "😂", "👍", "😮", "😢", "🔥"];

export default function MessageBubble({ id, message, isMine, showAvatar, isSeen, onReact, onEdit, onDelete }) {
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);

  const groupedReactions = (message.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editText.trim() && editText !== message.text) {
      onEdit(message._id, editText.trim());
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex gap-2.5 group px-1 rounded-2xl transition-colors duration-300", isMine ? "justify-end" : "justify-start")}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowEmojiPicker(false);
      }}
    >
      {!isMine && (
        <div className="w-8 shrink-0 self-end">
          {showAvatar && (
            <Avatar
              username={message.sender?.username}
              avatarUrl={message.sender?.avatarUrl}
              avatarColor={message.sender?.avatarColor}
              size="xs"
            />
          )}
        </div>
      )}

      <div className={cn("flex flex-col max-w-[68%]", isMine ? "items-end" : "items-start")}>
        {!isMine && showAvatar && (
          <span className="text-[11px] font-bold mb-1 ml-1" style={{ color: "var(--text-muted)" }}>
            {message.sender?.username}
          </span>
        )}

        <div className="relative flex items-center gap-2">
          {isMine && showActions && !isEditing && (
            <motion.div
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 order-first"
            >
              <ActionButton onClick={() => setShowEmojiPicker((v) => !v)} icon={Smile} />
              <ActionButton onClick={() => setIsEditing(true)} icon={Pencil} />
              <ActionButton onClick={() => onDelete(message._id)} icon={Trash2} danger />
            </motion.div>
          )}

          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="flex gap-2">
              <input
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setIsEditing(false)}
                className="px-4 py-2.5 rounded-[var(--radius-base)] border-2 text-sm outline-none"
                style={{ background: "var(--surface)", borderColor: "var(--accent)", color: "var(--text-primary)" }}
              />
            </form>
          ) : (
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "px-4 py-2.5 rounded-[var(--radius-lg)] text-[14px] leading-relaxed break-words whitespace-pre-wrap elevated-sm",
                message.pending && "opacity-50"
              )}
              style={{
                background: isMine ? "var(--bubble-mine)" : "var(--bubble-theirs)",
                color: isMine ? "var(--bubble-mine-text)" : "var(--bubble-theirs-text)",
                borderRadius: isMine
                  ? "var(--radius-lg) var(--radius-lg) 6px var(--radius-lg)"
                  : "var(--radius-lg) var(--radius-lg) var(--radius-lg) 6px",
              }}
            >
              {message.attachments?.map((att, i) =>
                att.type === "image" ? (
                  <img key={i} src={att.url} alt={att.name} className="rounded-[14px] mb-1.5 max-w-xs" />
                ) : (
                  <a key={i} href={att.url} target="_blank" rel="noreferrer" className="block underline mb-1.5 text-xs">
                    📎 {att.name}
                  </a>
                )
              )}
              {message.text}
              {message.edited && <span className="text-[10px] opacity-60 ml-1.5">(edited)</span>}
            </motion.div>
          )}

          {!isMine && showActions && !isEditing && (
            <ActionButton onClick={() => setShowEmojiPicker((v) => !v)} icon={Smile} />
          )}

          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="absolute -top-12 flex gap-1 px-2.5 py-2 rounded-full elevated glass-panel z-10"
              >
                {QUICK_EMOJIS.map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.35, y: -2 }}
                    whileTap={{ scale: 1.1 }}
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
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-1 mt-1.5"
          >
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <span
                key={emoji}
                className="text-[11px] px-2 py-1 rounded-full elevated-sm flex items-center gap-1 font-semibold"
                style={{ background: "var(--card)" }}
              >
                {emoji} {count > 1 && <span style={{ color: "var(--text-secondary)" }}>{count}</span>}
              </span>
            ))}
          </motion.div>
        )}

        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
            {formatMessageTime(message.createdAt)}
          </span>
          {isMine && isSeen !== undefined && (
            isSeen ? (
              <CheckCheck size={12} style={{ color: "var(--accent)" }} />
            ) : (
              <Check size={12} style={{ color: "var(--text-muted)" }} />
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ActionButton({ onClick, icon: Icon, danger }) {
  return (
    <motion.button
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="p-1.5 rounded-full elevated-sm"
      style={{ background: "var(--card)", color: danger ? "var(--notification)" : "var(--text-secondary)" }}
    >
      <Icon size={13} />
    </motion.button>
  );
}
