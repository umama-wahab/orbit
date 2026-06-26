import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import api from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Avatar from "@/components/ui/Avatar";

export default function NewChatModal({ isOpen, onClose, onCreated }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
        setResults(data.users);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const startChat = async (userId) => {
    try {
      const { data } = await api.post("/conversations/private", { userId });
      setQuery("");
      setResults([]);
      onCreated(data.conversation);
      onClose();
    } catch {
      /* noop */
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start a conversation">
      <div className="relative mb-4">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username..."
          className="w-full pl-10 pr-4 py-3 rounded-[var(--radius-base)] text-sm outline-none border-2 border-transparent focus:border-[var(--accent)]"
          style={{ background: "var(--card)", color: "var(--text-primary)" }}
        />
      </div>
      <div className="space-y-1 max-h-72 overflow-y-auto">
        {loading && (
          <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>
            Searching...
          </p>
        )}
        {!loading && query && results.length === 0 && (
          <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>
            No users found
          </p>
        )}
        {results.map((u, i) => (
          <motion.button
            key={u._id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => startChat(u._id)}
            whileHover={{ x: 2 }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-[var(--radius-base)] hover:bg-[var(--card)] text-left"
          >
            <Avatar username={u.username} avatarUrl={u.avatarUrl} avatarColor={u.avatarColor} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                {u.username}
              </p>
              {u.bio && (
                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                  {u.bio}
                </p>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </Modal>
  );
}
