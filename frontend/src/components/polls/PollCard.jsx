import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { useSocket } from "@/context/SocketContext";

export default function PollCard({ poll: initialPoll }) {
  const { socket } = useSocket();
  const [poll, setPoll] = useState(initialPoll);
  const [votedOption, setVotedOption] = useState(initialPoll.options?.find((o) => o.votedByMe)?.id || null);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (update) => {
      if (String(update.id) !== String(poll.id)) return;
      setPoll((prev) => ({
        ...prev,
        totalVotes: update.totalVotes,
        options: update.options.map((o) => ({ ...o, votedByMe: prev.options.find((p) => p.id === o.id)?.votedByMe })),
      }));
    };
    socket.on("poll:updated", handleUpdate);
    return () => socket.off("poll:updated", handleUpdate);
  }, [socket, poll.id]);

  const handleVote = (optionId) => {
    setVotedOption(optionId);
    setPoll((prev) => ({ ...prev, options: prev.options.map((o) => ({ ...o, votedByMe: o.id === optionId })) }));
    socket?.emit("poll:vote", { pollId: poll.id, optionId });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-[var(--radius-lg)] p-5 w-full max-w-sm elevated"
      style={{ background: "var(--card)", border: "1px solid var(--border-soft)" }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-wash)" }}>
          <BarChart3 size={14} style={{ color: "var(--accent)" }} />
        </div>
        <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          {poll.question}
        </p>
      </div>
      <div className="space-y-2">
        {poll.options.map((opt) => (
          <motion.button
            key={opt.id}
            onClick={() => !poll.isClosed && handleVote(opt.id)}
            disabled={poll.isClosed}
            whileHover={!poll.isClosed ? { scale: 1.01 } : {}}
            whileTap={!poll.isClosed ? { scale: 0.99 } : {}}
            className="w-full text-left relative overflow-hidden rounded-[var(--radius-base)] px-4 py-3"
            style={{
              border: `2px solid ${votedOption === opt.id ? "var(--accent)" : "var(--border)"}`,
            }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-soft))", opacity: 0.16 }}
              initial={{ width: 0 }}
              animate={{ width: `${opt.percentage}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
            <div className="relative flex items-center justify-between">
              <span className="text-[13.5px] font-semibold" style={{ color: "var(--text-primary)" }}>
                {opt.text}
              </span>
              <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
                {opt.percentage}%
              </span>
            </div>
          </motion.button>
        ))}
      </div>
      <p className="text-xs mt-4 font-medium" style={{ color: "var(--text-muted)" }}>
        {poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""} · {poll.isAnonymous ? "Anonymous" : "Public"} ·{" "}
        {poll.isClosed ? "Closed" : "Active"}
      </p>
    </motion.div>
  );
}
