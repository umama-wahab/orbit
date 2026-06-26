import { useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const DURATIONS = [
  { value: "1h", label: "1 hour" },
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "custom", label: "Custom" },
];

export default function CreateCircleModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isTemporary, setIsTemporary] = useState(false);
  const [duration, setDuration] = useState("24h");
  const [customHours, setCustomHours] = useState(48);
  const [creating, setCreating] = useState(false);

  const reset = () => {
    setName("");
    setDescription("");
    setIsTemporary(false);
    setDuration("24h");
    setCustomHours(48);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const { data } = await api.post("/circles", {
        name: name.trim(),
        description: description.trim(),
        isTemporary,
        duration: isTemporary ? duration : undefined,
        customHours: isTemporary && duration === "custom" ? customHours : undefined,
      });
      onCreated(data.circle);
      reset();
      onClose();
    } catch {
      /* noop */
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title="Create an anonymous circle">
      <div className="space-y-4">
        <Input label="Circle name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Late Night Thoughts" maxLength={50} />
        <div>
          <label className="block text-[13px] font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this circle about?"
            maxLength={200}
            rows={2}
            className="w-full px-4 py-3 rounded-[var(--radius-base)] border-2 border-transparent text-sm outline-none resize-none focus:border-[var(--accent)]"
            style={{ background: "var(--card)", color: "var(--text-primary)" }}
          />
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
            Make this a temporary circle
          </span>
          <button
            onClick={() => setIsTemporary((v) => !v)}
            className="w-12 h-6.5 h-7 rounded-full relative transition-colors"
            style={{ background: isTemporary ? "var(--accent)" : "var(--border)" }}
          >
            <motion.span
              className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow"
              animate={{ x: isTemporary ? 20 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {isTemporary && (
          <div>
            <label className="block text-[13px] font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
              Expires after
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  className="text-xs font-bold py-2.5 rounded-[var(--radius-base)] transition-colors"
                  style={{
                    background: duration === d.value ? "var(--accent)" : "var(--card)",
                    color: duration === d.value ? "var(--accent-contrast)" : "var(--text-secondary)",
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
            {duration === "custom" && (
              <div className="mt-3">
                <Input type="number" label="Hours until expiry" min={1} max={720} value={customHours} onChange={(e) => setCustomHours(e.target.value)} />
              </div>
            )}
          </div>
        )}

        <Button className="w-full" disabled={creating || !name.trim()} onClick={handleCreate}>
          {creating ? "Creating..." : "Create circle"}
        </Button>
      </div>
    </Modal>
  );
}
