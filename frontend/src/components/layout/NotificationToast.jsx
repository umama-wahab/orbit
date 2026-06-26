import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bell, X } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";

export default function NotificationToast() {
  const { toast, dismissToast } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="fixed top-6 right-6 z-[100] w-80">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[var(--radius-lg)] p-4 cursor-pointer glass-panel elevated"
            onClick={() => {
              if (toast.link) navigate(toast.link);
              dismissToast();
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-soft))" }}
              >
                <Bell size={16} color="var(--accent-contrast)" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {toast.title}
                </p>
                {toast.body && (
                  <p className="text-xs mt-0.5 truncate font-medium" style={{ color: "var(--text-secondary)" }}>
                    {toast.body}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissToast();
                }}
                className="p-0.5 rounded-full"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
