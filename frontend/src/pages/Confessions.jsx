import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Clock, Plus, MessageSquareText, Hash } from "lucide-react";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfessionCard from "@/components/confessions/ConfessionCard";
import ConfessionCommentsModal from "@/components/confessions/ConfessionCommentsModal";

const CATEGORIES = ["All", "College", "Gaming", "Relationships", "Work", "Random Thoughts", "Funny Stories"];

const CATEGORY_DOT = {
  College: "#F07B3F",
  Gaming: "#8D47F5",
  Relationships: "#D84F83",
  Work: "#D97A2B",
  "Random Thoughts": "#6FA869",
  "Funny Stories": "#E96A5F",
};

export default function Confessions() {
  const [confessions, setConfessions] = useState([]);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [activeConfession, setActiveConfession] = useState(null);

  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState("Random Thoughts");
  const [posting, setPosting] = useState(false);

  const fetchConfessions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/confessions", { params: { category, sort } });
      setConfessions(data.confessions);
    } finally {
      setLoading(false);
    }
  }, [category, sort]);

  useEffect(() => {
    fetchConfessions();
  }, [fetchConfessions]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    confessions.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [confessions]);

  const handlePost = async () => {
    if (!newText.trim()) return;
    setPosting(true);
    try {
      const { data } = await api.post("/confessions", { text: newText.trim(), category: newCategory });
      setConfessions((prev) => [data.confession, ...prev]);
      setNewText("");
      setShowCompose(false);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ===== Compact hero — title, Confess button, filters. Never scrolls
          away with the feed; on mobile this collapses to two tight rows
          instead of the title block + button + 7 wrapped chips that used
          to push the first confession off-screen. ===== */}
      <div className="shrink-0 px-4 sm:px-6 lg:px-9 pt-4 sm:pt-6 lg:pt-8 pb-3 sm:pb-4">
        <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-display truncate" style={{ color: "var(--text-primary)" }}>
              Confession Hub
            </h1>
            <p className="hidden sm:block text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Say what you really think. No names attached.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCompose(true)}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-full elevated shrink-0"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-soft))", color: "var(--accent-contrast)" }}
          >
            <Plus size={15} /> Confess
          </motion.button>
        </div>

        <div className="flex items-center gap-2 flex-nowrap">
          <div className="flex gap-2 overflow-x-auto scrollbar-none flex-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className="text-xs font-bold px-3.5 py-2 rounded-full whitespace-nowrap shrink-0 transition-colors"
                style={{
                  background: category === c ? "linear-gradient(135deg, var(--accent), var(--accent-soft))" : "var(--card)",
                  color: category === c ? "var(--accent-contrast)" : "var(--text-secondary)",
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-1 shrink-0 p-1 rounded-full" style={{ background: "var(--card)" }}>
            <button
              onClick={() => setSort("recent")}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-full transition-colors"
              style={{ background: sort === "recent" ? "var(--surface)" : "transparent", color: sort === "recent" ? "var(--text-primary)" : "var(--text-muted)" }}
            >
              <Clock size={12} /> <span className="hidden sm:inline">Recent</span>
            </button>
            <button
              onClick={() => setSort("trending")}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-full transition-colors"
              style={{ background: sort === "trending" ? "var(--surface)" : "transparent", color: sort === "trending" ? "var(--text-primary)" : "var(--text-muted)" }}
            >
              <TrendingUp size={12} /> <span className="hidden sm:inline">Trending</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== Scrollable body: feed + side rail. Only this area scrolls,
          so the hero above stays put and confessions are visible almost
          immediately on any screen size. ===== */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-9 pb-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-7">
          <div className="flex-1 max-w-2xl min-w-0">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-40 rounded-[var(--radius-lg)] skeleton" />
                ))}
              </div>
            ) : confessions.length === 0 ? (
              <EmptyConfessions onCompose={() => setShowCompose(true)} />
            ) : (
              <div className="flex flex-col gap-4 sm:gap-5">
                {confessions.map((c) => (
                  <ConfessionCard key={c.id} confession={c} onOpenComments={setActiveConfession} />
                ))}
              </div>
            )}
          </div>

          {/* Side rail collapses below the feed on mobile/tablet instead of
              disappearing or forcing horizontal scroll. */}
          <div className="lg:w-72 shrink-0 space-y-4">
            <div className="rounded-[var(--radius-lg)] p-5 elevated" style={{ background: "var(--card)" }}>
              <h3 className="font-bold text-sm flex items-center gap-2 mb-4" style={{ color: "var(--text-primary)" }}>
                <Hash size={14} style={{ color: "var(--accent)" }} />
                Popular categories
              </h3>
              <div className="space-y-2.5">
                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <button key={c} onClick={() => setCategory(c)} className="w-full flex items-center justify-between text-left">
                    <span className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: category === c ? "var(--accent)" : "var(--text-secondary)" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: CATEGORY_DOT[c] }} />
                      {c}
                    </span>
                    <span className="text-[11px] font-bold" style={{ color: "var(--text-muted)" }}>
                      {categoryCounts[c] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div
              className="rounded-[var(--radius-lg)] p-5 relative overflow-hidden elevated"
              style={{ background: "linear-gradient(160deg, #1A1A22, #0E0E14)" }}
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-25" style={{ background: "#8D47F5" }} />
              <p className="text-sm font-bold mb-1.5 relative z-10" style={{ color: "#F2F2F2" }}>
                It's anonymous, always
              </p>
              <p className="text-xs leading-relaxed relative z-10" style={{ color: "#9A9AA4" }}>
                No one — not even moderators — can see who posted a confession. Speak freely.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showCompose} onClose={() => setShowCompose(false)} title="Post a confession">
        <div className="space-y-5">
          <textarea
            autoFocus
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="What's on your mind? It's completely anonymous..."
            maxLength={1000}
            rows={5}
            className="w-full px-4 py-3.5 rounded-[var(--radius-base)] border-2 border-transparent text-sm outline-none resize-none focus:border-[var(--accent)]"
            style={{ background: "var(--card)", color: "var(--text-primary)" }}
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => c !== "All").map((c) => (
              <button
                key={c}
                onClick={() => setNewCategory(c)}
                className="text-xs font-bold px-3.5 py-2 rounded-full transition-colors"
                style={{
                  background: newCategory === c ? "linear-gradient(135deg, var(--accent), var(--accent-soft))" : "var(--card)",
                  color: newCategory === c ? "var(--accent-contrast)" : "var(--text-secondary)",
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <Button className="w-full" disabled={!newText.trim() || posting} onClick={handlePost}>
            {posting ? "Posting..." : "Post anonymously"}
          </Button>
        </div>
      </Modal>

      <ConfessionCommentsModal confession={activeConfession} isOpen={!!activeConfession} onClose={() => setActiveConfession(null)} />
    </div>
  );
}

function EmptyConfessions({ onCompose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[var(--radius-xl)] p-8 sm:p-12 text-center elevated"
      style={{ background: "var(--card)" }}
    >
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: "var(--accent)" }} />
      <div className="relative z-10">
        <MessageSquareText size={28} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
        <p className="font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>
          No confessions in this category yet
        </p>
        <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
          Be the first to share something anonymously.
        </p>
        <Button onClick={onCompose}>
          <Plus size={15} /> Write a confession
        </Button>
      </div>
    </motion.div>
  );
}
