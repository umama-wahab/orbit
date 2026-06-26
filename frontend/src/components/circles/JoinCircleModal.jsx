import { useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function JoinCircleModal({ isOpen, onClose, onJoined }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) return;
    setError("");
    setJoining(true);
    try {
      const { data } = await api.post("/circles/join", { inviteCode: code.trim() });
      onJoined(data.circle);
      setCode("");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join circle");
    } finally {
      setJoining(false);
    }
  };

  const formatCode = (value) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean.length <= 4) return clean;
    return `${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join a circle">
      <div className="space-y-5">
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Enter the invite code shared with you. You'll be assigned a random anonymous alias.
        </p>
        <motion.input
          autoFocus
          value={code}
          onChange={(e) => setCode(formatCode(e.target.value))}
          placeholder="ABX7-KP92"
          maxLength={9}
          whileFocus={{ scale: 1.02 }}
          className="w-full text-center text-2xl font-bold tracking-[0.2em] font-display px-4 py-5 rounded-[var(--radius-lg)] border-2 outline-none"
          style={{
            background: "var(--card)",
            borderColor: error ? "var(--notification)" : "transparent",
            color: "var(--text-primary)",
          }}
        />
        {error && (
          <p className="text-sm text-center font-medium" style={{ color: "var(--notification)" }}>
            {error}
          </p>
        )}
        <Button className="w-full" size="lg" disabled={joining || code.length < 9} onClick={handleJoin}>
          {joining ? "Joining..." : "Join circle"}
        </Button>
      </div>
    </Modal>
  );
}
