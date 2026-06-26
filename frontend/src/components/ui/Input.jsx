import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef(function Input({ label, error, className, ...props }, ref) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[13px] font-semibold mb-2 tracking-wide" style={{ color: "var(--text-secondary)" }}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full rounded-[var(--radius-base)] px-4 py-3 text-sm outline-none transition-all duration-150",
          "border-2 placeholder:opacity-40",
          "focus:border-[var(--accent)]",
          className
        )}
        style={{
          background: "var(--card)",
          borderColor: error ? "var(--notification)" : "transparent",
          color: "var(--text-primary)",
        }}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs font-medium" style={{ color: "var(--notification)" }}>
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
