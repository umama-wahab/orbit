import { motion } from "framer-motion";

export default function TypingIndicator({ label }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2.5 px-4 py-2"
    >
      <div
        className="flex items-center gap-1.5 px-4 py-3 rounded-[var(--radius-lg)] elevated-sm"
        style={{ background: "var(--bubble-theirs)", borderRadius: "var(--radius-lg) var(--radius-lg) var(--radius-lg) 6px" }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--accent)" }}
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
      {label && (
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
      )}
    </motion.div>
  );
}
