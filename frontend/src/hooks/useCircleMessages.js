import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/api";
import { useSocket } from "@/context/SocketContext";

export function useCircleMessages(circleId, myAlias) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingAliases, setTypingAliases] = useState([]);
  const [expired, setExpired] = useState(false);
  const typingTimeoutRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!circleId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/circles/${circleId}/messages`);
      setMessages(data.messages);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [circleId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!socket || !circleId) return;

    socket.emit("circle:join_room", circleId);

    const onNew = ({ message, tempId }) => {
      if (message.circle !== circleId) return;
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        const optimisticIndex = prev.findIndex(
          (m) => m.pending && (tempId ? m._id === tempId : m.text === message.text && m.senderAlias === message.senderAlias)
        );
        if (optimisticIndex !== -1) {
          const next = [...prev];
          next[optimisticIndex] = message;
          return next;
        }
        return [...prev, message];
      });
    };

    const onReacted = ({ message }) => {
      setMessages((prev) => prev.map((m) => (m._id === message._id ? message : m)));
    };

    const onTyping = ({ room, typingUsers }) => {
      if (room !== `circle:${circleId}`) return;
      setTypingAliases(typingUsers.filter((a) => a !== myAlias));
    };

    const onExpired = ({ circleId: id }) => {
      if (id === circleId) setExpired(true);
    };

    socket.on("circle:new_message", onNew);
    socket.on("circle:message_reacted", onReacted);
    socket.on("typing:update", onTyping);
    socket.on("circle:expired", onExpired);

    return () => {
      socket.emit("circle:leave_room", circleId);
      socket.off("circle:new_message", onNew);
      socket.off("circle:message_reacted", onReacted);
      socket.off("typing:update", onTyping);
      socket.off("circle:expired", onExpired);
      setTypingAliases([]);
    };
  }, [socket, circleId, myAlias]);

  const sendMessage = useCallback(
    (text) => {
      if (!socket || !circleId || !text.trim()) return;
      const tempId = `temp-${Date.now()}`;
      const optimistic = {
        _id: tempId,
        circle: circleId,
        senderAlias: myAlias,
        text,
        reactions: [],
        type: "text",
        createdAt: new Date().toISOString(),
        pending: true,
      };
      setMessages((prev) => [...prev, optimistic]);

      socket.emit("circle:send_message", { circleId, text, tempId }, (res) => {
        if (res?.error) {
          setMessages((prev) => prev.filter((m) => m._id !== tempId));
          return;
        }
        setMessages((prev) => {
          const hasTemp = prev.some((m) => m._id === tempId);
          const hasReal = prev.some((m) => m._id === res.message._id);
          if (!hasTemp) return prev;
          if (hasReal) return prev.filter((m) => m._id !== tempId);
          return prev.map((m) => (m._id === tempId ? res.message : m));
        });
      });
    },
    [socket, circleId, myAlias]
  );

  const reactToMessage = useCallback(
    (messageId, emoji) => {
      socket?.emit("circle:react", { circleId, messageId, emoji });
    },
    [socket, circleId]
  );

  const startTyping = useCallback(() => {
    if (!socket || !circleId) return;
    socket.emit("circle:typing_start", { circleId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("circle:typing_stop", { circleId });
    }, 2000);
  }, [socket, circleId]);

  return { messages, loading, typingAliases, expired, sendMessage, reactToMessage, startTyping, refetch: fetchMessages };
}
