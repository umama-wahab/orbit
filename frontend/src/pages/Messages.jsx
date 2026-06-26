import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, MessageCircle } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { useConversationMessages } from "@/hooks/useConversationMessages";
import { formatLastSeen } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import ConversationListItem from "@/components/chat/ConversationListItem";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatComposer from "@/components/chat/ChatComposer";
import TypingIndicator from "@/components/chat/TypingIndicator";
import NewChatModal from "@/components/chat/NewChatModal";
import MessagesEmptyState from "@/components/chat/MessagesEmptyState";
import ChatSearchPanel from "@/components/chat/ChatSearchPanel";

export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { onlineUserIds } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const scrollRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    const { data } = await api.get("/conversations");
    setConversations(data.conversations.filter((c) => !c.isGroup));
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const activeConversation = conversations.find((c) => c._id === conversationId);
  const otherUser = activeConversation?.participants.find((p) => p._id !== user.id);

  const { messages, loading, typingUsers, sendMessage, editMessage, deleteMessage, reactToMessage, startTyping } =
    useConversationMessages(conversationId);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const filtered = conversations.filter((c) => {
    const other = c.participants.find((p) => p._id !== user.id);
    return other?.username.toLowerCase().includes(search.toLowerCase());
  });

  const existingContactIds = new Set(
    conversations.map((c) => c.participants.find((p) => p._id !== user.id)?._id).filter(Boolean)
  );

  const startChatWithUserId = async (userId) => {
    const { data } = await api.post("/conversations/private", { userId });
    fetchConversations();
    navigate(`/app/messages/${data.conversation._id}`);
  };

  return (
    <div className="flex h-full">
      <div
        className={`w-full md:w-[340px] flex flex-col shrink-0 border-r ${conversationId ? "hidden md:flex" : "flex"}`}
        style={{ borderColor: "var(--border-soft)" }}
      >
        <div className="px-6 pt-7 pb-5 shrink-0">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-bold font-display" style={{ color: "var(--text-primary)" }}>
              Messages
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewChat(true)}
              className="text-xs font-bold px-4 py-2 rounded-full elevated-sm"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-soft))", color: "var(--accent-contrast)" }}
            >
              + New
            </motion.button>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-3 rounded-[var(--radius-base)] text-sm outline-none border-2 border-transparent focus:border-[var(--accent)]"
              style={{ background: "var(--card)", color: "var(--text-primary)" }}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          {filtered.length === 0 ? (
            <EmptySidebar />
          ) : (
            filtered.map((c) => {
              const other = c.participants.find((p) => p._id !== user.id);
              return (
                <ConversationListItem
                  key={c._id}
                  conversation={c}
                  currentUserId={user.id}
                  isActive={c._id === conversationId}
                  isOnline={onlineUserIds.has(other?._id)}
                  onClick={() => navigate(`/app/messages/${c._id}`)}
                />
              );
            })
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col ${conversationId ? "flex" : "hidden md:flex"}`}>
        {!conversationId ? (
          <MessagesEmptyState
            existingContactIds={existingContactIds}
            onStartChat={startChatWithUserId}
            onNewChat={() => setShowNewChat(true)}
          />
        ) : (
          <>
            <div className="px-6 lg:px-8 py-5 flex items-center justify-between shrink-0 border-b" style={{ borderColor: "var(--border-soft)" }}>
              <div className="flex items-center gap-3.5">
                <button onClick={() => navigate("/app/messages")} className="md:hidden mr-1" style={{ color: "var(--text-secondary)" }}>
                  <ArrowLeft size={18} />
                </button>
                <Avatar
                  username={otherUser?.username}
                  avatarUrl={otherUser?.avatarUrl}
                  avatarColor={otherUser?.avatarColor}
                  isOnline={onlineUserIds.has(otherUser?._id)}
                  ring
                />
                <div>
                  <p className="font-bold text-[15px]" style={{ color: "var(--text-primary)" }}>
                    {otherUser?.username}
                  </p>
                  <p className="text-xs font-medium" style={{ color: onlineUserIds.has(otherUser?._id) ? "var(--online)" : "var(--text-muted)" }}>
                    {formatLastSeen(otherUser?.lastSeen, onlineUserIds.has(otherUser?._id))}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSearch((v) => !v)}
                className="p-2 rounded-full"
                style={{ color: showSearch ? "var(--accent)" : "var(--text-secondary)", background: showSearch ? "var(--accent-wash)" : "transparent" }}
              >
                <Search size={18} />
              </button>
            </div>

            <ChatSearchPanel
              conversationId={conversationId}
              isOpen={showSearch}
              onClose={() => setShowSearch(false)}
              onJumpToMessage={(messageId) => {
                setShowSearch(false);
                requestAnimationFrame(() => {
                  const el = document.getElementById(`msg-${messageId}`);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    el.classList.add("message-highlight");
                    setTimeout(() => el.classList.remove("message-highlight"), 1500);
                  }
                });
              }}
            />

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 lg:px-6 py-6 space-y-3.5 relative chat-bg">
              {loading ? (
                <p className="text-center text-sm mt-8" style={{ color: "var(--text-muted)" }}>
                  Loading messages...
                </p>
              ) : messages.length === 0 ? (
                <p className="text-center text-sm mt-8" style={{ color: "var(--text-muted)" }}>
                  Say hello to {otherUser?.username} 👋
                </p>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((m, i) => (
                    <MessageBubble
                      key={m._id}
                      id={`msg-${m._id}`}
                      message={m}
                      isMine={m.sender?._id === user.id}
                      showAvatar={messages[i - 1]?.sender?._id !== m.sender?._id}
                      isSeen={i === messages.length - 1 ? m.readBy?.length > 1 : undefined}
                      onReact={reactToMessage}
                      onEdit={editMessage}
                      onDelete={deleteMessage}
                    />
                  ))}
                </AnimatePresence>
              )}
              <AnimatePresence>
                {typingUsers.length > 0 && <TypingIndicator label={`${otherUser?.username} is typing`} />}
              </AnimatePresence>
            </div>

            <ChatComposer onSend={sendMessage} onTyping={startTyping} />
          </>
        )}
      </div>

      <NewChatModal
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        onCreated={(conv) => {
          fetchConversations();
          navigate(`/app/messages/${conv._id}`);
        }}
      />
    </div>
  );
}

function EmptySidebar() {
  return (
    <div className="text-center mt-10 px-6">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
        style={{ background: "var(--card)" }}
      >
        <MessageCircle size={22} style={{ color: "var(--text-muted)" }} />
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
        No conversations yet. Start one with the + New button.
      </p>
    </div>
  );
}
