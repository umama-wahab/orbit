import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Hash, Copy, Users, LogOut, BarChart3, Clock, EyeOff } from "lucide-react";
import api from "@/lib/api";
import { formatCountdown } from "@/lib/utils";
import { useCircleMessages } from "@/hooks/useCircleMessages";
import CircleMessageBubble from "@/components/circles/CircleMessageBubble";
import ChatComposer from "@/components/chat/ChatComposer";
import TypingIndicator from "@/components/chat/TypingIndicator";
import CreatePollModal from "@/components/polls/CreatePollModal";
import PollCard from "@/components/polls/PollCard";
import Modal from "@/components/ui/Modal";

export default function CircleRoom() {
  const { circleId } = useParams();
  const navigate = useNavigate();
  const [circle, setCircle] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    api.get(`/circles/${circleId}`).then(({ data }) => setCircle(data.circle)).catch(() => navigate("/app/circles"));
  }, [circleId, navigate]);

  const { messages, loading, typingAliases, expired, sendMessage, reactToMessage, startTyping } =
    useCircleMessages(circleId, circle?.myAlias);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const handleLeave = async () => {
    await api.post(`/circles/${circleId}/leave`);
    navigate("/app/circles");
  };

  const copyCode = () => {
    if (!circle) return;
    navigator.clipboard.writeText(circle.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!circle) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: "#0E0E10" }}>
        <p style={{ color: "#75757F" }}>Loading circle...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative" style={{ background: "#0E0E10" }}>
      <div
        className="absolute top-0 left-1/3 w-72 h-72 rounded-full blur-3xl opacity-[0.12] pointer-events-none"
        style={{ background: circle.myAliasColor }}
      />

      <div className="px-6 lg:px-8 py-5 flex items-center justify-between shrink-0 border-b relative z-10" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3.5 min-w-0">
          <button onClick={() => navigate("/app/circles")} style={{ color: "#9A9AA4" }}>
            <ArrowLeft size={18} />
          </button>
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 elevated-sm"
            style={{ background: `linear-gradient(135deg, ${circle.myAliasColor}, #0E0E14)` }}
          >
            <EyeOff size={17} color="#fff" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[15px] truncate" style={{ color: "#F2F2F2" }}>
              {circle.name}
            </p>
            <p className="text-xs font-medium" style={{ color: "#75757F" }}>
              You are <span style={{ color: circle.myAliasColor, fontWeight: 700 }}>{circle.myAlias}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {circle.isTemporary && (
            <span
              className="hidden sm:flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-full mr-1"
              style={{ background: "rgba(216,79,131,0.18)", color: "#F0A8C0" }}
            >
              <Clock size={10} /> {formatCountdown(circle.expiresAt)}
            </span>
          )}
          <button onClick={() => setShowPoll(true)} className="p-2.5 rounded-full" style={{ color: "#9A9AA4" }}>
            <BarChart3 size={18} />
          </button>
          <button onClick={() => setShowMembers(true)} className="p-2.5 rounded-full" style={{ color: "#9A9AA4" }}>
            <Users size={18} />
          </button>
        </div>
      </div>

      {expired && (
        <div className="px-4 py-2.5 text-center text-xs font-bold relative z-10" style={{ background: "var(--rose, #D84F83)", color: "#fff" }}>
          This circle has expired and is now read-only. Messages have been archived.
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 lg:px-6 py-6 space-y-3.5 relative z-10">
        {loading ? (
          <p className="text-center text-sm mt-8" style={{ color: "#75757F" }}>
            Loading messages...
          </p>
        ) : messages.length === 0 ? (
          <div className="text-center mt-16">
            <EyeOff size={28} className="mx-auto mb-3" style={{ color: "#3A3A42" }} />
            <p className="text-sm" style={{ color: "#75757F" }}>
              No messages yet. Be the first to speak anonymously.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((m) =>
              m.type === "poll" && m.poll ? (
                <div key={m._id} className="flex justify-start px-1">
                  <PollCard poll={m.poll} />
                </div>
              ) : (
                <CircleMessageBubble
                  key={m._id}
                  message={m}
                  isMine={m.senderAlias === circle.myAlias && m.type !== "system"}
                  onReact={reactToMessage}
                />
              )
            )}
          </AnimatePresence>
        )}
        <AnimatePresence>
          {typingAliases.length > 0 && (
            <TypingIndicator label={`${typingAliases.join(", ")} ${typingAliases.length > 1 ? "are" : "is"} typing`} />
          )}
        </AnimatePresence>
      </div>

      {!expired && (
        <div className="relative z-10">
          <ChatComposer onSend={sendMessage} onTyping={startTyping} placeholder="Message anonymously..." />
        </div>
      )}

      <Modal isOpen={showMembers} onClose={() => setShowMembers(false)} title={`${circle.memberCount} members`}>
        <div className="space-y-3">
          <button
            onClick={copyCode}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-[var(--radius-base)] font-mono text-sm font-bold"
            style={{ background: "var(--card)", color: "var(--text-primary)" }}
          >
            <Hash size={14} /> {circle.inviteCode} <Copy size={13} />
          </button>
          {copied && (
            <p className="text-xs text-center font-semibold" style={{ color: "var(--success)" }}>
              Invite code copied!
            </p>
          )}
          <div className="space-y-1 max-h-56 overflow-y-auto">
            {circle.members.map((m) => (
              <div key={m.alias} className="flex items-center gap-3 px-2 py-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${m.aliasColor}, ${m.aliasColor}99)` }}>
                  <span className="text-xs font-bold text-white">{m.alias.slice(0, 1)}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: m.aliasColor }}>
                  {m.alias}
                </span>
                {m.alias === circle.myAlias && (
                  <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    (you)
                  </span>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handleLeave}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--radius-base)] text-sm font-bold"
            style={{ color: "var(--notification)" }}
          >
            <LogOut size={15} /> Leave circle
          </button>
        </div>
      </Modal>

      <CreatePollModal isOpen={showPoll} onClose={() => setShowPoll(false)} context="circle" circleId={circleId} onCreated={() => {}} />
    </div>
  );
}
