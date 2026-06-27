import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Info, BarChart3, ArrowLeft, Users, Activity, Plus, ArrowUpRight } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { useConversationMessages } from "@/hooks/useConversationMessages";
import { getCoverGradient } from "@/lib/covers";
import { formatRelativeTime } from "@/lib/utils";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatComposer from "@/components/chat/ChatComposer";
import TypingIndicator from "@/components/chat/TypingIndicator";
import NewGroupModal from "@/components/chat/NewGroupModal";
import GroupInfoModal from "@/components/chat/GroupInfoModal";
import CreatePollModal from "@/components/polls/CreatePollModal";
import Card from "@/components/ui/Card";

export default function Groups() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { onlineUserIds } = useSocket();
  const [groups, setGroups] = useState([]);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const scrollRef = useRef(null);

  const fetchGroups = useCallback(async () => {
    const { data } = await api.get("/conversations");
    setGroups(data.conversations.filter((c) => c.isGroup));
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const activeGroup = groups.find((g) => g._id === conversationId);

  const { messages, loading, typingUsers, sendMessage, editMessage, deleteMessage, reactToMessage, startTyping } =
    useConversationMessages(conversationId);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  if (!conversationId) {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-9">
        <div className="flex items-center justify-between mb-6 sm:mb-7 flex-wrap gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold font-display" style={{ color: "var(--text-primary)" }}>
              Communities
            </h1>
            <p className="text-xs sm:text-sm mt-1 sm:mt-1.5" style={{ color: "var(--text-secondary)" }}>
              Your group chats, all in one place.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowNewGroup(true)}
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-full elevated shrink-0"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-soft))", color: "var(--accent-contrast)" }}
          >
            <Plus size={15} className="sm:hidden" /> <Plus size={16} className="hidden sm:block" /> New group
          </motion.button>
        </div>

        {groups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[var(--radius-xl)] p-12 text-center max-w-lg mx-auto mt-12 elevated"
            style={{ background: "var(--card)" }}
          >
            <div
              className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ background: "var(--accent)" }}
            />
            <div
              className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
              style={{ background: "#307092" }}
            />
            <div className="relative z-10">
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 elevated-sm"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-soft))" }}
              >
                <Users size={28} color="var(--accent-contrast)" />
              </div>
              <p className="font-bold text-lg mb-1.5" style={{ color: "var(--text-primary)" }}>
                No communities yet
              </p>
              <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
                Create a group to start chatting with multiple people at once.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowNewGroup(true)}
                className="inline-flex items-center gap-2 text-sm font-bold px-5 py-3 rounded-full elevated"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-soft))", color: "var(--accent-contrast)" }}
              >
                <Plus size={16} /> Create your first group
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {groups.map((g, i) => {
              const onlineCount = g.participants.filter((p) => onlineUserIds.has(p._id)).length;
              return (
                <motion.div
                  key={g._id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="group"
                >
                  <Card hover className="overflow-hidden cursor-pointer" onClick={() => navigate(`/app/groups/${g._id}`)}>
                    <div className="h-28 relative" style={{ background: getCoverGradient(g._id) }}>
                      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.3))" }} />
                      {onlineCount > 0 && (
                        <span
                          className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                          style={{ background: "rgba(0,0,0,0.35)", color: "#fff" }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--online)" }} />
                          {onlineCount} online
                        </span>
                      )}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{}}
                        className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.92)", color: "#181818" }}
                      >
                        Open <ArrowUpRight size={11} />
                      </motion.div>
                      <div
                        className="absolute -bottom-6 left-5 w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white elevated"
                        style={{ background: getCoverGradient(g._id + "icon"), border: "3px solid var(--card)" }}
                      >
                        {g.icon || g.name?.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div className="p-5 pt-9">
                      <p className="font-bold text-[15px] truncate mb-1" style={{ color: "var(--text-primary)" }}>
                        {g.name}
                      </p>
                      <p className="text-xs truncate mb-3" style={{ color: "var(--text-secondary)" }}>
                        {g.lastMessage ? g.lastMessage.text || "📎 Attachment" : "No messages yet"}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                          <Users size={12} /> {g.participants.length} members
                        </span>
                        {g.lastActivity && (
                          <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: "var(--online)" }}>
                            <Activity size={11} /> {formatRelativeTime(g.lastActivity)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <NewGroupModal
          isOpen={showNewGroup}
          onClose={() => setShowNewGroup(false)}
          onCreated={(group) => {
            fetchGroups();
            navigate(`/app/groups/${group._id}`);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {!activeGroup ? (
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: "var(--text-muted)" }}>Loading group...</p>
        </div>
      ) : (
        <>
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between gap-3 shrink-0 border-b" style={{ borderColor: "var(--border-soft)" }}>
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
              <button onClick={() => navigate("/app/groups")} className="shrink-0" style={{ color: "var(--text-secondary)" }}>
                <ArrowLeft size={18} />
              </button>
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center text-sm font-bold text-white elevated-sm shrink-0"
                style={{ background: getCoverGradient(activeGroup._id + "icon") }}
              >
                {activeGroup.icon || activeGroup.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[15px] truncate" style={{ color: "var(--text-primary)" }}>
                  {activeGroup.name}
                </p>
                <p className="text-xs font-medium truncate" style={{ color: "var(--text-muted)" }}>
                  {activeGroup.participants.length} members
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setShowPoll(true)} className="p-2 sm:p-2.5 rounded-full" style={{ color: "var(--text-secondary)" }}>
                <BarChart3 size={18} />
              </button>
              <button onClick={() => setShowInfo(true)} className="p-2 sm:p-2.5 rounded-full" style={{ color: "var(--text-secondary)" }}>
                <Info size={18} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 lg:px-6 py-6 space-y-3.5 relative chat-bg">
            {loading ? (
              <p className="text-center text-sm mt-8" style={{ color: "var(--text-muted)" }}>
                Loading messages...
              </p>
            ) : messages.length === 0 ? (
              <p className="text-center text-sm mt-8" style={{ color: "var(--text-muted)" }}>
                No messages yet. Break the ice! 🧊
              </p>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <MessageBubble
                    key={m._id}
                    message={m}
                    isMine={m.sender?._id === user.id}
                    showAvatar={messages[i - 1]?.sender?._id !== m.sender?._id}
                    onReact={reactToMessage}
                    onEdit={editMessage}
                    onDelete={deleteMessage}
                  />
                ))}
              </AnimatePresence>
            )}
            <AnimatePresence>
              {typingUsers.length > 0 && (
                <TypingIndicator label={`${typingUsers.join(", ")} ${typingUsers.length > 1 ? "are" : "is"} typing`} />
              )}
            </AnimatePresence>
          </div>

          <ChatComposer onSend={sendMessage} onTyping={startTyping} placeholder={`Message ${activeGroup.name}...`} />

          <GroupInfoModal
            isOpen={showInfo}
            onClose={() => setShowInfo(false)}
            conversation={activeGroup}
            onUpdated={(updated) => setGroups((prev) => prev.map((g) => (g._id === updated._id ? updated : g)))}
          />
          <CreatePollModal isOpen={showPoll} onClose={() => setShowPoll(false)} context="group" conversationId={activeGroup._id} onCreated={() => {}} />
        </>
      )}
    </div>
  );
}
