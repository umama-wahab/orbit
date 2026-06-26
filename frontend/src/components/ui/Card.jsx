import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Card({ children, className, glass, hover, as = "div", ...props }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={cn(
        "rounded-[var(--radius-lg)]",
        glass ? "glass-panel" : "elevated",
        className
      )}
      style={{
        background: glass ? undefined : "var(--card)",
        border: glass ? undefined : "1px solid var(--border-soft)",
      }}
      whileHover={hover ? { y: -3, transition: { duration: 0.2, ease: "easeOut" } } : undefined}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
