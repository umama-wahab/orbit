import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Heart } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default function HomeHero({ user, activeConversations, circleCount, reactionCount }) {
  const stats = [
    {
      icon: MessageCircle,
      label: activeConversations === 1 ? "active conversation" : "active conversations",
      value: activeConversations,
    },
    {
      icon: Sparkles,
      label: circleCount === 1 ? "circle joined" : "circles joined",
      value: circleCount,
    },
    {
      icon: Heart,
      label: "new reactions",
      value: reactionCount,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[var(--radius-xl)] elevated mb-6"
      style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-soft))" }}
    >
      <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none" style={{ background: "#fff" }} />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: "#000" }} />
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, white 1.5px, transparent 2px)",
          backgroundSize: "22px 22px",
        }}
      />
      <motion.div
        className="absolute -right-10 -top-10 w-44 h-44 rounded-full border-[14px] pointer-events-none hidden sm:block"
        style={{ borderColor: "rgba(255,255,255,0.12)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 p-5 sm:p-7 lg:p-10">
        <div className="flex items-start gap-4 sm:gap-5 mb-6 sm:mb-7">
          <Avatar
            username={user?.username}
            avatarUrl={user?.avatarUrl}
            avatarColor={user?.avatarColor}
            size="xl-responsive"
            ring
          />
          <div className="pt-1 min-w-0">
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl sm:text-3xl lg:text-4xl font-bold font-display leading-tight break-words"
              style={{ color: "var(--accent-contrast)" }}
            >
              {getGreeting()}, {user?.username} 👋
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="text-[15px] font-medium mt-1.5 opacity-90"
              style={{ color: "var(--accent-contrast)" }}
            >
              Connect freely. Reveal only what you choose.
            </motion.p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.07, duration: 0.3 }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full glass-panel"
              style={{ border: "1px solid rgba(255,255,255,0.25)" }}
            >
              <s.icon size={14} style={{ color: "var(--accent-contrast)" }} />
              <span className="text-sm font-bold" style={{ color: "var(--accent-contrast)" }}>
                {s.value}
              </span>
              <span className="text-xs font-medium opacity-85" style={{ color: "var(--accent-contrast)" }}>
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
