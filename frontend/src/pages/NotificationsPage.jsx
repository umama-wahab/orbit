import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, MessageCircle, Users, Sparkles, Heart, AtSign, BarChart3, MessageSquareText, CheckCheck } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { formatRelativeTime } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";

const ICONS = {
  message: MessageCircle,
  group_invite: Users,
  circle_invite: Sparkles,
  reaction: Heart,
  mention: AtSign,
  poll_vote: BarChart3,
  confession_comment: MessageSquareText,
  confession_like: Heart,
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, markRead, markAllRead, unreadCount } = useNotifications();

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-9 max-w-2xl">
      <div className="flex items-center justify-between mb-7">
        <h1 className="text-3xl font-bold font-display flex items-center gap-3" style={{ color: "var(--text-primary)" }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "var(--accent-wash)" }}>
            <Bell size={18} style={{ color: "var(--accent)" }} />
          </div>
          Notifications
        </h1>
        {unreadCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-full"
            style={{ background: "var(--card)", color: "var(--text-secondary)" }}
          >
            <CheckCheck size={13} /> Mark all read
          </motion.button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-sm text-center mt-12 font-medium" style={{ color: "var(--text-muted)" }}>
          You're all caught up. No notifications yet.
        </p>
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence>
            {notifications.map((n, i) => {
              const Icon = ICONS[n.type] || Bell;
              return (
                <motion.button
                  key={n._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => {
                    if (!n.isRead) markRead(n._id);
                    if (n.link) navigate(n.link);
                  }}
                  whileHover={{ x: 2 }}
                  className="w-full flex items-start gap-3.5 px-4 py-4 rounded-[var(--radius-base)] text-left"
                  style={{ background: n.isRead ? "transparent" : "var(--card)" }}
                >
                  {n.actor ? (
                    <Avatar username={n.actor.username} avatarUrl={n.actor.avatarUrl} avatarColor={n.actor.avatarColor} size="sm" />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-soft))" }}>
                      <Icon size={15} color="var(--accent-contrast)" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
                        {n.body}
                      </p>
                    )}
                    <p className="text-[11px] mt-1 font-medium" style={{ color: "var(--text-muted)" }}>
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                  {!n.isRead && <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: "var(--accent)" }} />}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
