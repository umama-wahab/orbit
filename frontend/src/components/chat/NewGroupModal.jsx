import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, X, Check } from "lucide-react";
import api from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Avatar from "@/components/ui/Avatar";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function NewGroupModal({ isOpen, onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const { data } = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
        setResults(data.users);
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const toggleUser = (u) => {
    setSelected((prev) => (prev.some((s) => s._id === u._id) ? prev.filter((s) => s._id !== u._id) : [...prev, u]));
  };

  const reset = () => {
    setStep(1);
    setName("");
    setQuery("");
    setResults([]);
    setSelected([]);
  };

  const handleCreate = async () => {
    try {
      const { data } = await api.post("/conversations/group", { name, participantIds: selected.map((s) => s._id) });
      onCreated(data.conversation);
      reset();
      onClose();
    } catch {
      /* noop */
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title={step === 1 ? "Name your group" : "Add members"}>
      {step === 1 ? (
        <div className="space-y-5">
          <Input label="Group name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekend Squad" maxLength={50} />
          <Button className="w-full" disabled={!name.trim()} onClick={() => setStep(2)}>
            Next
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map((u) => (
                <span
                  key={u._id}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: "var(--accent-wash)", color: "var(--accent)" }}
                >
                  {u.username}
                  <button onClick={() => toggleUser(u)}>
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users to add..."
              className="w-full pl-10 pr-4 py-3 rounded-[var(--radius-base)] text-sm outline-none border-2 border-transparent focus:border-[var(--accent)]"
              style={{ background: "var(--card)", color: "var(--text-primary)" }}
            />
          </div>
          <div className="space-y-1 max-h-56 overflow-y-auto">
            {results.map((u) => {
              const isSelected = selected.some((s) => s._id === u._id);
              return (
                <motion.button
                  key={u._id}
                  whileHover={{ x: 2 }}
                  onClick={() => toggleUser(u)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-base)] hover:bg-[var(--card)] text-left"
                >
                  <Avatar username={u.username} avatarUrl={u.avatarUrl} avatarColor={u.avatarColor} size="sm" />
                  <span className="text-sm font-semibold flex-1" style={{ color: "var(--text-primary)" }}>
                    {u.username}
                  </span>
                  {isSelected && <Check size={16} style={{ color: "var(--accent)" }} />}
                </motion.button>
              );
            })}
          </div>
          <Button className="w-full" disabled={selected.length === 0} onClick={handleCreate}>
            Create group with {selected.length} member{selected.length !== 1 ? "s" : ""}
          </Button>
        </div>
      )}
    </Modal>
  );
}
