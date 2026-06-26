import { getInitials, cn } from "@/lib/utils";

const SIZES = {
  xs: "w-7 h-7 text-[10px]",
  sm: "w-9 h-9 text-xs",
  md: "w-11 h-11 text-sm",
  lg: "w-16 h-16 text-lg",
  xl: "w-24 h-24 text-2xl",
};

const RING_SIZES = {
  xs: "p-[1.5px]",
  sm: "p-[1.5px]",
  md: "p-[2px]",
  lg: "p-[2.5px]",
  xl: "p-[3px]",
};

// A curated set of premium gradient pairs (not random hex, hand-picked so
// nothing ever clashes). Each user gets a deterministic pair from their
// username, so the same person always renders the same identity.
const GRADIENT_PAIRS = [
  ["#F07B3F", "#D84F83"],
  ["#8D47F5", "#307092"],
  ["#E5BE4D", "#D97A2B"],
  ["#6FCF97", "#307092"],
  ["#D84F83", "#8D47F5"],
  ["#307092", "#63D2E0"],
  ["#F4A26C", "#E96A5F"],
  ["#A9C5A0", "#6FA869"],
  ["#E96A5F", "#8D47F5"],
  ["#63D2E0", "#6FCF97"],
];

function hashString(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getIdentityGradient(seed, overrideColor) {
  if (overrideColor) return `linear-gradient(135deg, ${overrideColor}, ${overrideColor}cc)`;
  const [a, b] = GRADIENT_PAIRS[hashString(seed) % GRADIENT_PAIRS.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

export default function Avatar({ username, avatarUrl, avatarColor, size = "md", isOnline, ring, className }) {
  const gradient = getIdentityGradient(username, avatarColor);

  const inner = avatarUrl ? (
    <img src={avatarUrl} alt={username} className={cn(SIZES[size], "rounded-full object-cover block")} />
  ) : (
    <div
      className={cn(SIZES[size], "rounded-full flex items-center justify-center font-bold relative overflow-hidden")}
      style={{ background: gradient, color: "#fff" }}
    >
      {/* subtle dot-grid texture so flat initials don't look like a generic CRUD avatar */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1.5px)",
          backgroundSize: "6px 6px",
        }}
      />
      <span className="relative z-10" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
        {getInitials(username)}
      </span>
    </div>
  );

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      {ring ? (
        <div className={cn("rounded-full", RING_SIZES[size])} style={{ background: gradient }}>
          <div className="rounded-full" style={{ background: "var(--surface)", padding: 2 }}>
            {inner}
          </div>
        </div>
      ) : (
        inner
      )}
      {isOnline !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2",
            size === "xs" || size === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5"
          )}
          style={{
            background: isOnline ? "var(--online)" : "var(--text-muted)",
            borderColor: "var(--surface)",
            opacity: isOnline ? 1 : 0.5,
            boxShadow: isOnline ? "0 0 0 2px var(--surface), 0 0 8px var(--online)" : "none",
          }}
        />
      )}
    </div>
  );
}
