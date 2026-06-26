import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { EyeOff, Users, Flame, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";

export default function FeaturedCircleCard({ circle, onJoin }) {
  const navigate = useNavigate();

  if (!circle) return null;

  const activityLevel = circle.memberCount > 20 ? "Buzzing" : circle.memberCount > 8 ? "Active" : "Just started";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className="rounded-[var(--radius-xl)] relative overflow-hidden elevated cursor-pointer"
      style={{ background: "linear-gradient(160deg, #1A1A22, #0E0E14)" }}
      onClick={() => navigate("/app/circles")}
    >
      {/* ambient mystery glow blobs */}
      <div
        className="absolute -top-16 -right-10 w-56 h-56 rounded-full blur-3xl opacity-35 pointer-events-none"
        style={{ background: "#8D47F5" }}
      />
      <div
        className="absolute -bottom-20 left-10 w-48 h-48 rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{ background: "#D84F83" }}
      />
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1.5px)",
          backgroundSize: "16px 16px",
        }}
      />

      <div className="relative z-10 p-7 lg:p-8 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
        <div className="flex-1 min-w-0">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full mb-4"
            style={{ background: "rgba(229,190,77,0.18)", color: "#F0D98A" }}
          >
            <Flame size={11} /> Featured Circle
          </span>
          <h3 className="text-2xl lg:text-3xl font-bold font-display mb-2.5" style={{ color: "#F5F5F7" }}>
            {circle.name}
          </h3>
          {circle.description && (
            <p className="text-sm leading-relaxed mb-5 max-w-md" style={{ color: "#9A9AA4" }}>
              {circle.description}
            </p>
          )}
          <div className="flex items-center gap-5 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#C8C8D0" }}>
              <Users size={13} /> {circle.memberCount} anonymous members
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#6FCF97" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#6FCF97" }} />
              {activityLevel}
            </span>
          </div>
        </div>

        <div className="flex flex-row lg:flex-col items-center gap-4 shrink-0">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center elevated shrink-0"
            style={{ background: "linear-gradient(135deg, #8D47F5, #D84F83)" }}
          >
            <EyeOff size={28} color="#fff" />
          </div>
          <Button onClick={(e) => { e.stopPropagation(); onJoin(circle); }} size="md" className="shrink-0">
            Join circle <ArrowRight size={14} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
