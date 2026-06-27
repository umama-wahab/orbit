import { Settings as SettingsIcon, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ThemeSwitcher from "@/components/profile/ThemeSwitcher";

export default function SettingsPage() {
  const { logout } = useAuth();

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-9 max-w-3xl">
      <h1 className="text-xl sm:text-3xl font-bold font-display mb-2 flex items-center gap-2 sm:gap-3" style={{ color: "var(--text-primary)" }}>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "var(--accent-wash)" }}>
          <SettingsIcon size={16} className="sm:hidden" style={{ color: "var(--accent)" }} />
          <SettingsIcon size={18} className="hidden sm:block" style={{ color: "var(--accent)" }} />
        </div>
        Settings
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
        Customize how Orbit looks and feels.
      </p>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="p-7 mb-6">
          <h2 className="font-bold text-lg font-display mb-1.5" style={{ color: "var(--text-primary)" }}>
            Appearance
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Pick a theme. Your choice is saved to your account and synced across devices.
          </p>
          <ThemeSwitcher />
        </Card>
      </motion.div>

      <Card className="p-7">
        <h2 className="font-bold text-lg font-display mb-4" style={{ color: "var(--text-primary)" }}>
          Account
        </h2>
        <Button variant="secondary" onClick={logout} className="w-full justify-start">
          <LogOut size={16} /> Log out
        </Button>
      </Card>
    </div>
  );
}
