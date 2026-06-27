import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Image as ImageIcon, Paperclip, X } from "lucide-react";
import api from "@/lib/api";

export default function ChatComposer({ onSend, onTyping, placeholder = "Type a message..." }) {
  const [text, setText] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && !pendingAttachment) return;
    onSend(text.trim(), pendingAttachment ? [pendingAttachment] : []);
    setText("");
    setPendingAttachment(null);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPendingAttachment(data);
    } catch {
      /* upload failed silently */
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="px-3 sm:px-5 lg:px-7 py-3 sm:py-5 shrink-0">
      {pendingAttachment && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-3 px-3.5 py-2.5 rounded-[var(--radius-base)] w-fit elevated-sm"
          style={{ background: "var(--card)" }}
        >
          {pendingAttachment.type === "image" ? (
            <img src={pendingAttachment.url} alt="" className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <Paperclip size={14} style={{ color: "var(--text-secondary)" }} />
          )}
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            {pendingAttachment.name}
          </span>
          <button onClick={() => setPendingAttachment(null)}>
            <X size={13} style={{ color: "var(--text-muted)" }} />
          </button>
        </motion.div>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2.5 rounded-[var(--radius-xl)] p-2 elevated"
        style={{ background: "var(--card)" }}
      >
        <input ref={fileInputRef} type="file" hidden onChange={handleFileChange} />
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-3 rounded-full shrink-0"
          style={{ color: "var(--text-secondary)" }}
        >
          {uploading ? <span className="text-xs">...</span> : <ImageIcon size={19} />}
        </motion.button>
        <textarea
          rows={1}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onTyping?.();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder={placeholder}
          className="flex-1 resize-none bg-transparent px-2 py-2.5 text-[14px] outline-none max-h-32"
          style={{ color: "var(--text-primary)" }}
        />
        <motion.button
          type="submit"
          disabled={!text.trim() && !pendingAttachment}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
          className="p-3.5 rounded-full disabled:opacity-30 shrink-0"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-soft))", color: "var(--accent-contrast)" }}
        >
          <Send size={17} />
        </motion.button>
      </form>
    </div>
  );
}
