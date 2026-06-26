import { motion } from "framer-motion";
import { cn, formatRelativeTime } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";

export default function ConversationListItem({ conversation, currentUserId, isActive, isOnline, onClick }) {
  const otherUser = !conversation.isGroup
    ? conversation.participants.find((p) => p._id !== currentUserId)
    : null;

  const displayName = conversation.isGroup ? conversation.name : otherUser?.username;
  const lastMessage = conversation.lastMessage;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 2 }}
      className={cn(
        "w-full flex items-center gap-3.5 px-3.5 py-3 rounded-[var(--radius-base)] transition-colors text-left relative"
      )}
      style={{ background: isActive ? "var(--card)" : "transparent" }}
    >
      {isActive && (
        <motion.div
          layoutId="conv-active-bar"
          className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-full"
          style={{ background: "linear-gradient(180deg, var(--accent), var(--accent-soft))" }}
        />
      )}
      {conversation.isGroup ? (
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold shrink-0 elevated-sm"
          style={{ background: "linear-gradient(135deg, var(--accent-soft), var(--accent))", color: "#fff" }}
        >
          {conversation.icon || displayName?.slice(0, 2).toUpperCase()}
        </div>
      ) : (
        <Avatar
          username={otherUser?.username}
          avatarUrl={otherUser?.avatarUrl}
          avatarColor={otherUser?.avatarColor}
          isOnline={isOnline}
          size="md"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[14px] font-bold truncate" style={{ color: "var(--text-primary)" }}>
            {displayName}
          </p>
          {lastMessage && (
            <span className="text-[10px] font-medium shrink-0" style={{ color: "var(--text-muted)" }}>
              {formatRelativeTime(lastMessage.createdAt)}
            </span>
          )}
        </div>
        <p className="text-[12.5px] truncate mt-0.5" style={{ color: "var(--text-secondary)" }}>
          {lastMessage ? lastMessage.text || "📎 Attachment" : "No messages yet"}
        </p>
      </div>
    </motion.button>
  );
}
