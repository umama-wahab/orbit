import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  MessageCircle,
  Users,
  Sparkles,
  MessageSquareText,
  Bell,
  User,
  Settings,
  Orbit,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import Avatar from "@/components/ui/Avatar";

const NAV_ITEMS = [
  { to: "/app/home", icon: Home, label: "Home" },
  { to: "/app/messages", icon: MessageCircle, label: "Messages" },
  { to: "/app/groups", icon: Users, label: "Groups" },
  { to: "/app/circles", icon: Sparkles, label: "Circles" },
  { to: "/app/confessions", icon: MessageSquareText, label: "Confessions" },
  { to: "/app/notifications", icon: Bell, label: "Notifications", badge: true },
  { to: "/app/profile", icon: User, label: "Profile" },
  { to: "/app/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <motion.aside
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-full w-[84px] lg:w-[252px] flex flex-col shrink-0 my-3 ml-3 rounded-[var(--radius-xl)] glass-panel elevated overflow-hidden transition-[width] duration-300"
    >
      <div className="flex items-center gap-3 px-4 lg:px-5 h-[76px] shrink-0">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 elevated-sm"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-soft))" }}
        >
          <Orbit size={20} color="var(--accent-contrast)" strokeWidth={2.4} />
        </div>
        <span
          className="hidden lg:block font-bold text-xl font-display"
          style={{ color: "var(--text-primary)" }}
        >
          Orbit
        </span>
      </div>

      <nav className="flex-1 px-3 lg:px-3.5 space-y-1 overflow-y-auto scrollbar-none">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="relative flex items-center justify-center lg:justify-start gap-3 px-3.5 py-3 rounded-[var(--radius-base)] transition-colors duration-150 group"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-[var(--radius-base)]"
                    style={{
                      background: "linear-gradient(135deg, var(--accent), var(--accent-soft))",
                      boxShadow: "0 6px 16px -4px var(--accent-wash)",
                    }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
                <div className="relative z-10">
                  <item.icon
                    size={19}
                    strokeWidth={isActive ? 2.4 : 2}
                    style={{ color: isActive ? "var(--accent-contrast)" : "var(--text-secondary)" }}
                  />
                  {item.badge && unreadCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                      style={{ background: "var(--notification)", color: "#fff" }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span
                  className="hidden lg:block text-[14px] font-semibold relative z-10"
                  style={{ color: isActive ? "var(--accent-contrast)" : "var(--text-secondary)" }}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 lg:p-3.5">
        <div
          className="flex items-center gap-3 px-2.5 py-2.5 rounded-[var(--radius-base)] mb-1.5"
          style={{ background: "var(--card)" }}
        >
          <Avatar
            username={user?.username}
            avatarUrl={user?.avatarUrl}
            avatarColor={user?.avatarColor}
            size="sm"
            isOnline={true}
            ring
          />
          <div className="hidden lg:block min-w-0 flex-1">
            <p className="text-[13px] font-bold truncate" style={{ color: "var(--text-primary)" }}>
              {user?.username}
            </p>
            <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
              {user?.email}
            </p>
          </div>
          <motion.button
            onClick={logout}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="hidden lg:flex p-2 rounded-full shrink-0"
            style={{ color: "var(--notification)" }}
          >
            <LogOut size={15} />
          </motion.button>
        </div>
        <motion.button
          onClick={logout}
          whileTap={{ scale: 0.95 }}
          className="lg:hidden w-full flex items-center justify-center py-2 rounded-[var(--radius-base)]"
          style={{ color: "var(--notification)" }}
        >
          <LogOut size={16} />
        </motion.button>
      </div>
    </motion.aside>
  );
}
