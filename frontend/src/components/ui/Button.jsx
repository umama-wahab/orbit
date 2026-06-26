import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "px-3.5 py-2 text-[13px] gap-1.5",
  md: "px-5 py-2.5 text-sm gap-2",
  lg: "px-6 py-3.5 text-[15px] gap-2.5",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}) {
  const style = {};

  if (variant === "primary") {
    style.background = "linear-gradient(135deg, var(--accent), var(--accent-soft))";
    style.color = "var(--accent-contrast)";
    style.boxShadow = "0 8px 20px -6px var(--accent-wash)";
    style.textShadow = "0 1px 2px rgba(0,0,0,0.12)";
  } else if (variant === "secondary") {
    style.border = "1px solid var(--border)";
    style.color = "var(--text-primary)";
    style.background = "var(--surface)";
  } else if (variant === "ghost") {
    style.color = "var(--text-secondary)";
    style.background = "transparent";
  } else if (variant === "danger") {
    style.background = "var(--notification)";
    style.color = "#fff";
  }

  return (
    <motion.button
      className={cn(
        "rounded-[var(--radius-pill)] font-semibold transition-colors duration-200",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        "inline-flex items-center justify-center shrink-0",
        SIZE_CLASSES[size],
        className
      )}
      style={style}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02, filter: "brightness(1.05)" }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
