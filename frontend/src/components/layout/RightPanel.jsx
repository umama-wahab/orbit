import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Users, Radio, Bell, Flame, Heart, MessageCircle } from "lucide-react";
import api from "@/lib/api";
import { useSocket } from "@/context/SocketContext";
import { useNotifications } from "@/context/NotificationContext";
import { formatRelativeTime } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";

export default function RightPanel() {
  const navigate = useNavigate();
  const { onlineUserIds } = useSocket();
  const { notifications } = useNotifications();
  const [contacts, setContacts] = useState([]);
  const [trendingCircles, setTrendingCircles] = useState([]);
  const [popularConfession, setPopularConfession] = useState(null);

  useEffect(() => {
    api.get("/users/contacts").then(({ data }) => setContacts(data.contacts)).catch(() => {});
    api.get("/circles/trending").then(({ data }) => setTrendingCircles(data.circles)).catch(() => {});
    api
      .get("/confessions", { params: { sort: "trending", limit: 1 } })
      .then(({ data }) => setPopularConfession(data.confessions[0] || null))
      .catch(() => {});
  }, []);

  const onlineContacts = contacts.filter((c) => onlineUserIds.has(c._id));
  const recentNotifications = notifications.slice(0, 3);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
      className="hidden lg:flex flex-col w-[280px] xl:w-[300px] h-full shrink-0 my-3 mr-3 gap-3 overflow-y-auto scrollbar-none"
    >
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[15px] flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Radio size={14} style={{ color: "var(--online)" }} />
            Online now
          </h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-bold" style={{ background: "var(--accent-wash)", color: "var(--accent)" }}>
            {onlineContacts.length}
          </span>
        </div>
        {onlineContacts.length === 0 ? (
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            None of your contacts are online right now.
          </p>
        ) : (
          <div className="space-y-3.5">
            {onlineContacts.slice(0, 5).map((c, i) => (
              <motion.button
                key={c._id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ x: 2 }}
                onClick={() => navigate("/app/messages")}
                className="flex items-center gap-2.5 w-full text-left"
              >
                <Avatar username={c.username} avatarUrl={c.avatarUrl} avatarColor={c.avatarColor} size="sm" isOnline />
                <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                  {c.username}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={14} style={{ color: "var(--accent)" }} />
          <h3 className="font-bold text-[15px]" style={{ color: "var(--text-primary)" }}>
            Trending circles
          </h3>
        </div>
        {trendingCircles.length === 0 ? (
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            No active circles yet. Be the first to start one!
          </p>
        ) : (
          <div className="space-y-3">
            {trendingCircles.slice(0, 4).map((c) => (
              <button
                key={c.id}
                onClick={() => navigate("/app/circles")}
                className="flex items-center gap-3 w-full text-left"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs text-white"
                  style={{ background: "linear-gradient(135deg, #8D47F5, #D84F83)" }}
                >
                  {c.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                    {c.name}
                  </p>
                  <p className="text-[11px] flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                    <Users size={10} /> {c.memberCount} members
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      {popularConfession && (
        <Card className="p-5 cursor-pointer" hover onClick={() => navigate("/app/confessions")}>
          <div className="flex items-center gap-2 mb-3.5">
            <Flame size={14} style={{ color: "var(--notification)" }} />
            <h3 className="font-bold text-[15px]" style={{ color: "var(--text-primary)" }}>
              Popular confession
            </h3>
          </div>
          <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
            {popularConfession.text.length > 90 ? `${popularConfession.text.slice(0, 90)}…` : popularConfession.text}
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>
              <Heart size={11} /> {popularConfession.likeCount}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>
              <MessageCircle size={11} /> {popularConfession.commentCount}
            </span>
          </div>
        </Card>
      )}

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="font-bold text-[15px] flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Bell size={14} style={{ color: "var(--accent)" }} />
            Recent activity
          </h3>
          <button onClick={() => navigate("/app/notifications")} className="text-[11px] font-bold" style={{ color: "var(--accent)" }}>
            View all
          </button>
        </div>
        {recentNotifications.length === 0 ? (
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Nothing new yet — you're all caught up.
          </p>
        ) : (
          <div className="space-y-3">
            {recentNotifications.map((n) => (
              <button
                key={n._id}
                onClick={() => navigate(n.link || "/app/notifications")}
                className="flex items-start gap-2.5 w-full text-left"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                  style={{ background: n.isRead ? "var(--text-muted)" : "var(--accent)" }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                    {n.title}
                  </p>
                  <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
                    {formatRelativeTime(n.createdAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>
    </motion.aside>
  );
}
