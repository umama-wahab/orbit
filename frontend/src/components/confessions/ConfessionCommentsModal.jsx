import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import api from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import Modal from "@/components/ui/Modal";

export default function ConfessionCommentsModal({ confession, isOpen, onClose }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!isOpen || !confession) return;
    setLoading(true);
    api.get(`/confessions/${confession.id}/comments`).then(({ data }) => setComments(data.comments)).finally(() => setLoading(false));
  }, [isOpen, confession]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      const { data } = await api.post(`/confessions/${confession.id}/comments`, { text: text.trim() });
      setComments((prev) => [...prev, data.comment]);
      setText("");
    } finally {
      setPosting(false);
    }
  };

  if (!confession) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comments" maxWidth="max-w-lg">
      <div className="space-y-5">
        <div className="text-[14px] p-4 rounded-[var(--radius-base)] leading-relaxed" style={{ background: "var(--card)", color: "var(--text-secondary)" }}>
          {confession.text}
        </div>

        <div className="max-h-72 overflow-y-auto space-y-4">
          {loading ? (
            <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>
              Loading comments...
            </p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>
              No comments yet. Be the first to respond anonymously.
            </p>
          ) : (
            comments.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start justify-between gap-3 px-1"
              >
                <p className="text-sm flex-1 leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  {c.text}
                </p>
                <span className="text-[10px] font-medium shrink-0" style={{ color: "var(--text-muted)" }}>
                  {formatRelativeTime(c.createdAt)}
                </span>
              </motion.div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add an anonymous comment..."
            maxLength={500}
            className="flex-1 px-4 py-3 rounded-[var(--radius-base)] border-2 border-transparent text-sm outline-none focus:border-[var(--accent)]"
            style={{ background: "var(--card)", color: "var(--text-primary)" }}
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            disabled={!text.trim() || posting}
            className="p-3 rounded-full disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-soft))", color: "var(--accent-contrast)" }}
          >
            <Send size={16} />
          </motion.button>
        </form>
      </div>
    </Modal>
  );
}
