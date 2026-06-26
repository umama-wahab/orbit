import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/api";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";

export function useConversationMessages(conversationId) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/conversations/${conversationId}/messages`);
      setMessages(data.messages);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("conversation:join", conversationId);

    const onNew = ({ message, tempId }) => {
      if (message.conversation !== conversationId) return;
      setMessages((prev) => {
        // If this message already exists by real _id, do nothing (duplicate broadcast).
        if (prev.some((m) => m._id === message._id)) return prev;
        // If we have a pending optimistic copy for this exact send (tempId provided
        // by the server ack pathway, or matched by sender+pending), replace it
        // in place instead of appending a second entry.
        const optimisticIndex = prev.findIndex(
          (m) => m.pending && (tempId ? m._id === tempId : m.text === message.text && m.sender?._id === message.sender?._id)
        );
        if (optimisticIndex !== -1) {
          const next = [...prev];
          next[optimisticIndex] = message;
          return next;
        }
        return [...prev, message];
      });
    };

    const onEdited = ({ message }) => {
      setMessages((prev) => prev.map((m) => (m._id === message._id ? message : m)));
    };

    const onDeleted = ({ messageId, conversationId: cId }) => {
      if (cId !== conversationId) return;
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    const onReacted = ({ message }) => {
      setMessages((prev) => prev.map((m) => (m._id === message._id ? message : m)));
    };

    const onTyping = ({ room, typingUsers: users }) => {
      if (room !== `conversation:${conversationId}`) return;
      setTypingUsers(users.filter((u) => u !== user?.username));
    };

    socket.on("message:new", onNew);
    socket.on("message:edited", onEdited);
    socket.on("message:deleted", onDeleted);
    socket.on("message:reacted", onReacted);
    socket.on("typing:update", onTyping);

    return () => {
      socket.emit("conversation:leave", conversationId);
      socket.off("message:new", onNew);
      socket.off("message:edited", onEdited);
      socket.off("message:deleted", onDeleted);
      socket.off("message:reacted", onReacted);
      socket.off("typing:update", onTyping);
      setTypingUsers([]);
    };
  }, [socket, conversationId, user?.username]);

  const sendMessage = useCallback(
    (text, attachments = []) => {
      if (!socket || !conversationId) return;
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const optimistic = {
        _id: tempId,
        conversation: conversationId,
        sender: { _id: user.id, username: user.username, avatarUrl: user.avatarUrl, avatarColor: user.avatarColor },
        text,
        attachments,
        reactions: [],
        createdAt: new Date().toISOString(),
        pending: true,
      };
      setMessages((prev) => [...prev, optimistic]);

      socket.emit("message:send", { conversationId, text, attachments, tempId }, (res) => {
        if (res?.error) {
          setMessages((prev) => prev.filter((m) => m._id !== tempId));
          return;
        }
        // The room broadcast (onNew) may have already replaced this optimistic
        // entry by the time the ack arrives. Guard so we never append a second
        // copy of the same message — only replace the tempId placeholder if
        // it's still present, and otherwise leave state untouched.
        setMessages((prev) => {
          const hasTemp = prev.some((m) => m._id === tempId);
          const hasReal = prev.some((m) => m._id === res.message._id);
          if (!hasTemp) return hasReal ? prev : prev; // already reconciled by broadcast
          if (hasReal) return prev.filter((m) => m._id !== tempId); // real one already added, drop placeholder
          return prev.map((m) => (m._id === tempId ? res.message : m));
        });
      });
    },
    [socket, conversationId, user]
  );

  const editMessage = useCallback(
    (messageId, text) => {
      socket?.emit("message:edit", { messageId, text });
    },
    [socket]
  );

  const deleteMessage = useCallback(
    (messageId) => {
      if (!socket) return;
      // Optimistically remove immediately; if the server rejects it (e.g. not
      // the sender, already deleted), restore it from a snapshot.
      let removed;
      setMessages((prev) => {
        removed = prev.find((m) => m._id === messageId);
        return prev.filter((m) => m._id !== messageId);
      });
      socket.emit("message:delete", { messageId }, (res) => {
        if (res?.error && removed) {
          setMessages((prev) => (prev.some((m) => m._id === messageId) ? prev : [...prev, removed]));
        }
      });
    },
    [socket]
  );

  const reactToMessage = useCallback(
    (messageId, emoji) => {
      socket?.emit("message:react", { messageId, emoji });
    },
    [socket]
  );

  const startTyping = useCallback(() => {
    if (!socket || !conversationId) return;
    socket.emit("typing:start", { conversationId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { conversationId });
    }, 2000);
  }, [socket, conversationId]);

  return {
    messages,
    loading,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    startTyping,
    refetch: fetchMessages,
  };
}
