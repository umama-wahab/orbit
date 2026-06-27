import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles, UserPlus, Users2 } from "lucide-react";
import api from "@/lib/api";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";

export default function MessagesEmptyState({ existingContactIds, onStartChat, onNewChat }) {
  const [suggested, setSuggested] = useState([]);

  useEffect(() => {
    // Reuse the contacts list as "people you know" suggestions, filtered to
    // anyone you don't already have an open conversation with.
    api
      .get("/users/contacts")
      .then(({ data }) => {
        const filtered = data.contacts.filter((c) => !existingContactIds.has(c._id));
        setSuggested(filtered.slice(0, 4));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 py-10 relative">
      {/* decorative ambient blobs so this never feels like flat white space */}
      <div
        className="absolute top-10 right-10 w-72 h-72 rounded-full blur-3xl opacity-[0.10] pointer-events-none"
        style={{ background: "var(--accent)" }}
      />
      <div
        className="absolute bottom-10 left-10 w-56 h-56 rounded-full blur-3xl opacity-[0.08] pointer-events-none"
        style={{ background: "#8D47F5" }}
      />

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-[24px] sm:rounded-[28px] flex items-center justify-center mb-5 elevated"
        style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-soft))" }}
      >
        <MessageCircle size={40} color="var(--accent-contrast)" strokeWidth={1.8} />
        <motion.div
          className="absolute -bottom-2 -right-2 w-9 h-9 rounded-2xl flex items-center justify-center elevated-sm"
          style={{ background: "linear-gradient(135deg, #8D47F5, #D84F83)" }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles size={16} color="#fff" />
        </motion.div>
      </motion.div>

      <h2 className="relative z-10 font-bold text-xl font-display mb-1.5" style={{ color: "var(--text-primary)" }}>
        Your messages live here
      </h2>
      <p className="relative z-10 text-sm text-center max-w-xs mb-7" style={{ color: "var(--text-muted)" }}>
        Pick a conversation from the left, or start something new with a friend.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative z-10"
      >
        <Button onClick={onNewChat} size="lg">
          <UserPlus size={16} /> Start a new conversation
        </Button>
      </motion.div>

      {suggested.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="relative z-10 mt-10 w-full max-w-sm"
        >
          <p
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-3 justify-center"
            style={{ color: "var(--text-muted)" }}
          >
            <Users2 size={12} /> People you can message
          </p>
          <div className="flex flex-col gap-1.5 rounded-[var(--radius-lg)] p-2 elevated" style={{ background: "var(--card)" }}>
            {suggested.map((u, i) => (
              <motion.button
                key={u._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                whileHover={{ x: 2 }}
                onClick={() => onStartChat(u._id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-base)] text-left"
              >
                <Avatar username={u.username} avatarUrl={u.avatarUrl} avatarColor={u.avatarColor} size="sm" isOnline={false} />
                <span className="text-sm font-semibold flex-1 truncate" style={{ color: "var(--text-primary)" }}>
                  {u.username}
                </span>
                <span className="text-[11px] font-bold" style={{ color: "var(--accent)" }}>
                  Message
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
