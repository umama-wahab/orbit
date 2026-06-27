import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import api from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";

export default function ChatSearchPanel({ conversationId, isOpen, onClose, onJumpToMessage }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (q) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/conversations/${conversationId}/messages/search`, { params: { q } });
      setResults(data.messages);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden border-b"
          style={{ borderColor: "var(--border-soft)" }}
        >
          <div className="px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                autoFocus
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search in this conversation..."
                className="w-full pl-10 pr-9 py-2.5 rounded-[var(--radius-base)] text-sm outline-none border-2 border-transparent focus:border-[var(--accent)]"
                style={{ background: "var(--card)", color: "var(--text-primary)" }}
              />
              <button
                onClick={onClose}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={14} />
              </button>
            </div>

            {query.trim() && (
              <div className="mt-2.5 max-h-48 overflow-y-auto rounded-[var(--radius-base)]" style={{ background: "var(--card)" }}>
                {loading ? (
                  <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>
                    Searching...
                  </p>
                ) : results.length === 0 ? (
                  <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>
                    No matches found.
                  </p>
                ) : (
                  results.map((m) => (
                    <button
                      key={m._id}
                      onClick={() => onJumpToMessage?.(m._id)}
                      className="w-full text-left px-3.5 py-2.5 flex items-start justify-between gap-3"
                    >
                      <p className="text-xs truncate flex-1" style={{ color: "var(--text-primary)" }}>
                        <span className="font-bold">{m.sender?.username}: </span>
                        {m.text}
                      </p>
                      <span className="text-[10px] shrink-0 font-medium" style={{ color: "var(--text-muted)" }}>
                        {formatRelativeTime(m.createdAt)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
