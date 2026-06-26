import { useState } from "react";
import { Shield, Crown } from "lucide-react";
import api from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Avatar from "@/components/ui/Avatar";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function GroupInfoModal({ isOpen, onClose, conversation, onUpdated }) {
  const { user } = useAuth();
  const [name, setName] = useState(conversation?.name || "");
  const [saving, setSaving] = useState(false);

  if (!conversation) return null;

  const isAdmin = conversation.admins?.some((a) => a._id === user.id || a === user.id);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/conversations/group/${conversation._id}`, { name });
      onUpdated(data.conversation);
    } finally {
      setSaving(false);
    }
  };

  const handleMakeAdmin = async (userId) => {
    await api.post(`/conversations/group/${conversation._id}/admins`, { userId });
    onUpdated({ ...conversation, admins: [...conversation.admins, userId] });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Group info" maxWidth="max-w-lg">
      <div className="space-y-6">
        {isAdmin && (
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} />
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              Save
            </Button>
          </div>
        )}

        <div>
          <p className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            {conversation.participants.length} members
          </p>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {conversation.participants.map((p) => {
              const memberIsAdmin = conversation.admins?.some((a) => a._id === p._id || a === p._id);
              const isCreator = conversation.createdBy === p._id || conversation.createdBy?._id === p._id;
              return (
                <div key={p._id} className="flex items-center gap-3 px-2 py-2.5 rounded-[var(--radius-base)]">
                  <Avatar username={p.username} avatarUrl={p.avatarUrl} avatarColor={p.avatarColor} size="sm" />
                  <span className="text-sm font-semibold flex-1" style={{ color: "var(--text-primary)" }}>
                    {p.username} {p._id === user.id && "(you)"}
                  </span>
                  {isCreator && <Crown size={14} style={{ color: "var(--accent)" }} />}
                  {memberIsAdmin && !isCreator && <Shield size={14} style={{ color: "var(--text-secondary)" }} />}
                  {isAdmin && !memberIsAdmin && (
                    <button
                      onClick={() => handleMakeAdmin(p._id)}
                      className="text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{ background: "var(--card)", color: "var(--text-secondary)" }}
                    >
                      Make admin
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
