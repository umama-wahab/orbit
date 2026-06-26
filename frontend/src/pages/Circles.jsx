import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Clock, Users, Hash, Copy, EyeOff } from "lucide-react";
import api from "@/lib/api";
import { formatCountdown } from "@/lib/utils";
import Button from "@/components/ui/Button";
import CreateCircleModal from "@/components/circles/CreateCircleModal";
import JoinCircleModal from "@/components/circles/JoinCircleModal";

export default function Circles() {
  const navigate = useNavigate();
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchCircles = useCallback(async () => {
    try {
      const { data } = await api.get("/circles");
      setCircles(data.circles);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCircles();
  }, [fetchCircles]);

  const copyCode = (circle) => {
    navigator.clipboard.writeText(circle.inviteCode);
    setCopiedId(circle.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-9" style={{ background: "radial-gradient(circle at 50% 0%, rgba(141,71,245,0.04), transparent 60%)" }}>
      <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={20} style={{ color: "var(--purple, #8D47F5)" }} />
            <h1 className="text-3xl font-bold font-display" style={{ color: "var(--text-primary)" }}>
              Anonymous Circles
            </h1>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Chat freely. No real names, no profile photos — just aliases.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="secondary" onClick={() => setShowJoin(true)}>
            Join with code
          </Button>
          <Button onClick={() => setShowCreate(true)}>+ Create circle</Button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading circles...</p>
      ) : circles.length === 0 ? (
        <EmptyCirclesState onJoin={() => setShowJoin(true)} onCreate={() => setShowCreate(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {circles.map((circle, i) => (
            <motion.div
              key={circle.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              onClick={() => navigate(`/app/circles/${circle.id}`)}
              className="cursor-pointer rounded-[var(--radius-lg)] p-5 relative overflow-hidden elevated"
              style={{
                background: "linear-gradient(160deg, #1A1A22, #0E0E14)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* ambient glow blobs — mystery aesthetic */}
              <div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-30 pointer-events-none"
                style={{ background: circle.myAliasColor || "#8D47F5" }}
              />
              <div
                className="absolute -bottom-12 -left-8 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none"
                style={{ background: "#D84F83" }}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center elevated-sm"
                    style={{ background: `linear-gradient(135deg, ${circle.myAliasColor || "#8D47F5"}, #0E0E14)` }}
                  >
                    <EyeOff size={17} color="#fff" />
                  </div>
                  {circle.isTemporary && (
                    <span
                      className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-full"
                      style={{ background: "rgba(216,79,131,0.18)", color: "#F0A8C0" }}
                    >
                      <Clock size={10} /> {formatCountdown(circle.expiresAt)}
                    </span>
                  )}
                </div>

                <p className="font-bold text-[15px] mb-1" style={{ color: "#F2F2F2" }}>
                  {circle.name}
                </p>
                {circle.description && (
                  <p className="text-xs mb-4 line-clamp-2 leading-relaxed" style={{ color: "#9A9AA4" }}>
                    {circle.description}
                  </p>
                )}

                <div
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full mb-4"
                  style={{ background: `${circle.myAliasColor}22`, color: circle.myAliasColor }}
                >
                  You are {circle.myAlias}
                </div>

                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#75757F" }}>
                    <Users size={12} /> {circle.memberCount}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyCode(circle);
                    }}
                    className="flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-1.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.06)", color: "#C8C8D0" }}
                  >
                    <Hash size={10} />
                    {circle.inviteCode}
                    <Copy size={10} />
                  </button>
                </div>
                {copiedId === circle.id && (
                  <p className="text-[10px] mt-1.5 text-right font-semibold" style={{ color: "var(--success)" }}>
                    Copied!
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CreateCircleModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(circle) => {
          setCircles((prev) => [circle, ...prev]);
          navigate(`/app/circles/${circle.id}`);
        }}
      />
      <JoinCircleModal
        isOpen={showJoin}
        onClose={() => setShowJoin(false)}
        onJoined={(circle) => {
          fetchCircles();
          navigate(`/app/circles/${circle.id}`);
        }}
      />
    </div>
  );
}

function EmptyCirclesState({ onJoin, onCreate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto mt-12 rounded-[var(--radius-lg)] p-12 text-center relative overflow-hidden elevated"
      style={{ background: "linear-gradient(160deg, #1A1A22, #0E0E14)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl opacity-30" style={{ background: "#8D47F5" }} />
      <div className="relative z-10">
        <Sparkles size={32} className="mx-auto mb-4" style={{ color: "#E5BE4D" }} />
        <p className="font-bold text-lg mb-1.5" style={{ color: "#F2F2F2" }}>
          No circles yet
        </p>
        <p className="text-sm mb-6" style={{ color: "#9A9AA4" }}>
          Create your own anonymous circle or join one using an invite code.
        </p>
        <div className="flex gap-2.5 justify-center">
          <Button variant="secondary" onClick={onJoin}>
            Join with code
          </Button>
          <Button onClick={onCreate}>+ Create circle</Button>
        </div>
      </div>
    </motion.div>
  );
}
