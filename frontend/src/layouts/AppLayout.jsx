import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import NotificationToast from "@/components/layout/NotificationToast";

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-gradient)" }}>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 my-3 mr-3 lg:mr-0 rounded-[var(--radius-xl)] glass-panel elevated">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname.split("/").slice(0, 3).join("/")}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col overflow-hidden min-w-0"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <RightPanel />
      <NotificationToast />
    </div>
  );
}
