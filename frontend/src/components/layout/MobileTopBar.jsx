import { useNavigate } from "react-router-dom";
import { Menu, Orbit, Bell } from "lucide-react";
import { useMobileNav } from "@/context/MobileNavContext";
import { useNotifications } from "@/context/NotificationContext";

export default function MobileTopBar() {
  const { open } = useMobileNav();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  return (
    <div
      className="lg:hidden flex items-center justify-between px-4 h-14 shrink-0 border-b"
      style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}
    >
      <button
        onClick={open}
        className="p-2 -ml-2 rounded-full"
        style={{ color: "var(--text-primary)" }}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-soft))" }}
        >
          <Orbit size={14} color="var(--accent-contrast)" strokeWidth={2.4} />
        </div>
        <span className="font-bold text-base font-display" style={{ color: "var(--text-primary)" }}>
          Orbit
        </span>
      </div>

      <button
        onClick={() => navigate("/app/notifications")}
        className="p-2 -mr-2 rounded-full relative"
        style={{ color: "var(--text-primary)" }}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center"
            style={{ background: "var(--notification)", color: "#fff" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
