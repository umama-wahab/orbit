import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

export default function OnlineFriendsCarousel({ contacts, onlineUserIds, loading }) {
  const navigate = useNavigate();
  const online = contacts.filter((c) => onlineUserIds.has(c._id));

  if (loading) {
    return (
      <div className="flex gap-4 px-1">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-16 h-16 rounded-full skeleton shrink-0" />
        ))}
      </div>
    );
  }

  if (online.length === 0) {
    return (
      <div
        className="flex items-center gap-3 px-5 py-4 rounded-[var(--radius-base)]"
        style={{ background: "var(--card)" }}
      >
        <Users size={18} style={{ color: "var(--text-muted)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
          None of your contacts are online right now. Start a conversation to grow your circle.
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-5 overflow-x-auto scrollbar-none px-1 py-1">
      {online.map((c, i) => (
        <motion.button
          key={c._id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -4, scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate(`/app/messages`)}
          className="flex flex-col items-center gap-2 shrink-0"
        >
          <Avatar username={c.username} avatarUrl={c.avatarUrl} avatarColor={c.avatarColor} size="lg" isOnline ring />
          <span className="text-xs font-semibold max-w-[64px] truncate" style={{ color: "var(--text-secondary)" }}>
            {c.username}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
