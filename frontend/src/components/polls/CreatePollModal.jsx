import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import api from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function CreatePollModal({ isOpen, onClose, context, conversationId, circleId, onCreated }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [creating, setCreating] = useState(false);

  const updateOption = (i, value) => setOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)));
  const addOption = () => options.length < 6 && setOptions((prev) => [...prev, ""]);
  const removeOption = (i) => options.length > 2 && setOptions((prev) => prev.filter((_, idx) => idx !== i));
  const reset = () => {
    setQuestion("");
    setOptions(["", ""]);
  };

  const handleCreate = async () => {
    const validOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || validOptions.length < 2) return;
    setCreating(true);
    try {
      const { data } = await api.post("/polls", { question: question.trim(), options: validOptions, context, conversationId, circleId });
      onCreated(data.poll);
      reset();
      onClose();
    } catch {
      /* noop */
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title="Create a poll">
      <div className="space-y-5">
        <Input label="Question" autoFocus value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Should we attack now?" maxLength={200} />
        <div>
          <label className="block text-[13px] font-semibold mb-2.5" style={{ color: "var(--text-secondary)" }}>
            Options
          </label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                <input
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  maxLength={100}
                  className="flex-1 px-4 py-2.5 rounded-[var(--radius-base)] border-2 border-transparent text-sm outline-none focus:border-[var(--accent)]"
                  style={{ background: "var(--card)", color: "var(--text-primary)" }}
                />
                {options.length > 2 && (
                  <button onClick={() => removeOption(i)} style={{ color: "var(--text-muted)" }}>
                    <X size={16} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
          {options.length < 6 && (
            <button onClick={addOption} className="flex items-center gap-1 text-xs font-bold mt-3" style={{ color: "var(--accent)" }}>
              <Plus size={13} /> Add option
            </button>
          )}
        </div>
        <Button className="w-full" disabled={creating || !question.trim() || options.filter((o) => o.trim()).length < 2} onClick={handleCreate}>
          {creating ? "Creating..." : "Create poll"}
        </Button>
      </div>
    </Modal>
  );
}
