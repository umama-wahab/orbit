import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Orbit, ArrowRight, Sparkles, Users, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/app/messages");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-gradient)" }} data-theme="shadow">
      {/* Left: brand panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-40"
          style={{ background: "var(--purple)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-30"
          style={{ background: "var(--accent)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 relative z-10"
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--purple), var(--accent))" }}
          >
            <Orbit size={22} color="#fff" strokeWidth={2.4} />
          </div>
          <span className="font-bold text-2xl font-display" style={{ color: "var(--text-primary)" }}>
            Orbit
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-md"
        >
          <h1 className="text-5xl font-bold font-display leading-[1.05] mb-5" style={{ color: "var(--text-primary)" }}>
            Connect freely.
            <br />
            Reveal only
            <br />
            <span className="gradient-text">what you choose.</span>
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Private chats, communities, and anonymous circles — all in one premium social space.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 relative z-10"
        >
          {[
            { icon: MessageCircle, label: "Real-time chat" },
            { icon: Sparkles, label: "Anonymous circles" },
            { icon: Users, label: "Communities" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full glass-panel"
            >
              <f.icon size={13} style={{ color: "var(--accent)" }} />
              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                {f.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--purple), var(--accent))" }}
            >
              <Orbit size={20} color="#fff" />
            </div>
            <span className="font-bold text-xl font-display" style={{ color: "var(--text-primary)" }}>
              Orbit
            </span>
          </div>

          <h2 className="text-3xl font-bold font-display mb-2" style={{ color: "var(--text-primary)" }}>
            Welcome back
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
            Sign in to pick up right where you left off.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm rounded-[var(--radius-base)] px-4 py-3 font-medium"
                style={{ background: "rgba(216,79,131,0.12)", color: "var(--notification)" }}
              >
                {error}
              </motion.div>
            )}
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
            <Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={16} />}
            </Button>
          </form>

          <p className="text-center text-sm mt-8" style={{ color: "var(--text-secondary)" }}>
            New to Orbit?{" "}
            <Link to="/register" className="font-bold" style={{ color: "var(--accent)" }}>
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
