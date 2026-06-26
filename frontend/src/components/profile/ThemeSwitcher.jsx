import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const THEME_PREVIEWS = {
  social: {
    label: "Social Mode",
    description: "Warm cream, premium lifestyle aesthetic",
    bg: "linear-gradient(135deg, #F6F1EB, #F0E5D6)",
    accent: "linear-gradient(135deg, #F07B3F, #F4A26C)",
    card: "#FFFFFF",
    text: "#181818",
  },
  focus: {
    label: "Focus Mode",
    description: "Professional blue-gray, Linear-inspired",
    bg: "linear-gradient(135deg, #E8EEEE, #DCE8E9)",
    accent: "linear-gradient(135deg, #307092, #5E97A7)",
    card: "#F5F8F8",
    text: "#071218",
  },
  shadow: {
    label: "Shadow Mode",
    description: "Immersive dark, premium glow effects",
    bg: "linear-gradient(135deg, #0E0E10, #1A1A20)",
    accent: "linear-gradient(135deg, #8D47F5, #E5BE4D)",
    card: "#2C2C31",
    text: "#F2F2F2",
  },
};

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {Object.entries(THEME_PREVIEWS).map(([key, preview], i) => {
        const isActive = theme === key;
        return (
          <motion.button
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            onClick={() => setTheme(key)}
            whileHover={{ y: -3 }}
            className="rounded-[var(--radius-lg)] p-1.5 text-left transition-all relative overflow-hidden"
            style={{
              boxShadow: isActive ? `0 0 0 2.5px var(--accent), 0 12px 28px -8px var(--shadow-color-strong)` : "0 4px 16px -4px var(--shadow-color)",
              background: "var(--surface)",
            }}
          >
            <div className="rounded-[14px] p-4 h-32 flex flex-col gap-2.5 relative overflow-hidden" style={{ background: preview.bg }}>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: preview.text, opacity: 0.5 }} />
                <div className="h-2.5 w-16 rounded-full" style={{ background: preview.text, opacity: 0.25 }} />
              </div>
              <div className="h-7 w-3/4 rounded-xl" style={{ background: preview.card, boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }} />
              <div className="h-7 w-1/2 rounded-xl" style={{ background: preview.accent }} />
              <div className="flex-1 rounded-xl" style={{ background: preview.card, opacity: 0.7 }} />
            </div>
            <div className="flex items-center justify-between px-3 py-3.5">
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {preview.label}
                </p>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {preview.description}
                </p>
              </div>
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: preview.accent }}
                >
                  <Check size={14} color="#fff" />
                </motion.div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
