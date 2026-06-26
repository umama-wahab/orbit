import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Save, Check } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Avatar from "@/components/ui/Avatar";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const AVATAR_COLORS = ["#F07B3F", "#307092", "#E5BE4D", "#8D47F5", "#D84F83", "#A9C5A0", "#D97A2B", "#63D2E0"];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || AVATAR_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      const { data } = await api.put("/users/profile", { username, bio, avatarColor });
      updateUser(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-9 max-w-2xl">
      <h1 className="text-3xl font-bold font-display mb-7" style={{ color: "var(--text-primary)" }}>
        Your Profile
      </h1>

      <Card className="p-8 space-y-7">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar username={username} avatarColor={avatarColor} size="xl" ring />
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-3 elevated-sm"
              style={{ background: "var(--accent)", borderColor: "var(--surface)" }}
            >
              <Camera size={14} color="var(--accent-contrast)" />
            </motion.div>
          </div>
          <div>
            <p className="font-bold text-lg font-display" style={{ color: "var(--text-primary)" }}>
              {username}
            </p>
            <p className="text-xs font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>
              Member since{" "}
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "—"}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
            Avatar color
          </label>
          <div className="flex gap-2.5">
            {AVATAR_COLORS.map((c) => (
              <motion.button
                key={c}
                onClick={() => setAvatarColor(c)}
                whileHover={{ scale: 1.15 }}
                animate={{ scale: avatarColor === c ? 1.15 : 1 }}
                className="w-9 h-9 rounded-full relative"
                style={{ background: c }}
              >
                {avatarColor === c && (
                  <motion.div layoutId="avatar-color-ring" className="absolute -inset-1 rounded-full border-2" style={{ borderColor: c }} />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm font-medium" style={{ color: "var(--notification)" }}>
            {error}
          </p>
        )}

        <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={24} />
        <Input label="Email" value={user?.email} disabled className="opacity-50" />

        <div>
          <label className="block text-[13px] font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={160}
            rows={3}
            placeholder="Tell people a bit about yourself..."
            className="w-full px-4 py-3 rounded-[var(--radius-base)] border-2 border-transparent text-sm outline-none resize-none focus:border-[var(--accent)]"
            style={{ background: "var(--card)", color: "var(--text-primary)" }}
          />
          <p className="text-xs mt-1.5 text-right font-medium" style={{ color: "var(--text-muted)" }}>
            {bio.length}/160
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} size="lg">
          {saved ? <Check size={16} /> : <Save size={15} />} {saving ? "Saving..." : saved ? "Saved!" : "Save changes"}
        </Button>
      </Card>
    </div>
  );
}
