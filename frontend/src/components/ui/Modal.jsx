import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(10,8,6,0.55)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className={`relative w-full ${maxWidth} rounded-[var(--radius-xl)] overflow-hidden elevated`}
            style={{ background: "var(--surface)", border: "1px solid var(--border-soft)" }}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {title && (
              <div
                className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b"
                style={{ borderColor: "var(--border-soft)" }}
              >
                <h3 className="font-bold text-lg sm:text-xl font-display truncate pr-2" style={{ color: "var(--text-primary)" }}>
                  {title}
                </h3>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-full"
                  style={{ background: "var(--card)", color: "var(--text-secondary)" }}
                  whileHover={{ scale: 1.08, rotate: 90 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <X size={16} />
                </motion.button>
              </div>
            )}
            <div className="p-4 sm:p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
