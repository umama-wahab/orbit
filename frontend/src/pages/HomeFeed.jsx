import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, MessageSquareText, ArrowRight } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import HomeHero from "@/components/home/HomeHero";
import FeaturedCircleCard from "@/components/home/FeaturedCircleCard";
import TrendingConfessionPreview from "@/components/home/TrendingConfessionPreview";
import OnlineFriendsCarousel from "@/components/home/OnlineFriendsCarousel";
import JoinCircleModal from "@/components/circles/JoinCircleModal";

export default function HomeFeed() {
  const { user } = useAuth();
  const { onlineUserIds } = useSocket();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [featuredCircle, setFeaturedCircle] = useState(null);
  const [trendingConfessions, setTrendingConfessions] = useState([]);
  const [stats, setStats] = useState({ activeConversations: 0, circleCount: 0, reactionCount: 0 });
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    api.get("/users/contacts").then(({ data }) => setContacts(data.contacts)).catch(() => {}).finally(() => setLoadingContacts(false));

    api.get("/circles/trending").then(({ data }) => {
      if (data.circles.length > 0) setFeaturedCircle(data.circles[0]);
    }).catch(() => {});

    api.get("/confessions", { params: { sort: "trending", limit: 3 } }).then(({ data }) => {
      setTrendingConfessions(data.confessions.slice(0, 3));
    }).catch(() => {});

    Promise.all([api.get("/conversations"), api.get("/circles"), api.get("/notifications")]).then(
      ([convRes, circleRes, notifRes]) => {
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const active = convRes.data.conversations.filter(
          (c) => c.lastMessage && new Date(c.lastActivity).getTime() > dayAgo
        ).length;
        const reactionNotifs = notifRes.data.notifications.filter(
          (n) => !n.isRead && (n.type === "reaction" || n.type === "confession_like" || n.type === "confession_comment")
        ).length;
        setStats({
          activeConversations: active,
          circleCount: circleRes.data.circles.length,
          reactionCount: reactionNotifs,
        });
      }
    ).catch(() => {});
  }, []);

  const handleJoinFeatured = () => setShowJoin(true);

  return (
    <div className="flex-1 overflow-y-auto p-5 lg:p-7">
      <HomeHero
        user={user}
        activeConversations={stats.activeConversations}
        circleCount={stats.circleCount}
        reactionCount={stats.reactionCount}
      />

      <SectionLabel icon={Sparkles} label="Featured Circle" />
      {featuredCircle ? (
        <div className="mb-7">
          <FeaturedCircleCard circle={featuredCircle} onJoin={handleJoinFeatured} />
        </div>
      ) : (
        <EmptyFeaturedCircle onCreate={() => navigate("/app/circles")} />
      )}

      <div className="flex items-center justify-between mb-3 mt-7">
        <SectionLabel icon={MessageSquareText} label="Trending Confessions" noMargin />
        <button
          onClick={() => navigate("/app/confessions")}
          className="flex items-center gap-1 text-xs font-bold"
          style={{ color: "var(--accent)" }}
        >
          See all <ArrowRight size={12} />
        </button>
      </div>
      {trendingConfessions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
          {trendingConfessions.map((c, i) => (
            <TrendingConfessionPreview
              key={c.id}
              confession={c}
              index={i}
              onClick={() => navigate("/app/confessions")}
            />
          ))}
        </div>
      ) : (
        <EmptyTrending onClick={() => navigate("/app/confessions")} />
      )}

      <SectionLabel icon={null} label="Online Friends" noMargin customClass="mb-3 mt-2" />
      <OnlineFriendsCarousel contacts={contacts} onlineUserIds={onlineUserIds} loading={loadingContacts} />

      <JoinCircleModal
        isOpen={showJoin}
        onClose={() => setShowJoin(false)}
        onJoined={(circle) => navigate(`/app/circles/${circle.id}`)}
      />
    </div>
  );
}

function SectionLabel({ icon: Icon, label, noMargin, customClass }) {
  return (
    <h2
      className={`text-lg font-bold font-display flex items-center gap-2 ${customClass || (noMargin ? "" : "mb-3")}`}
      style={{ color: "var(--text-primary)" }}
    >
      {Icon && <Icon size={16} style={{ color: "var(--accent)" }} />}
      {label}
    </h2>
  );
}

function EmptyFeaturedCircle({ onCreate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onCreate}
      className="mb-7 rounded-[var(--radius-xl)] p-8 text-center cursor-pointer relative overflow-hidden elevated"
      style={{ background: "linear-gradient(160deg, #1A1A22, #0E0E14)" }}
    >
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-25" style={{ background: "#8D47F5" }} />
      <div className="relative z-10">
        <Sparkles size={26} className="mx-auto mb-3" style={{ color: "#E5BE4D" }} />
        <p className="font-bold mb-1" style={{ color: "#F2F2F2" }}>
          No circles trending yet
        </p>
        <p className="text-sm" style={{ color: "#9A9AA4" }}>
          Be the first to start an anonymous circle others can discover.
        </p>
      </div>
    </motion.div>
  );
}

function EmptyTrending({ onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="w-full mb-7 rounded-[var(--radius-lg)] p-7 text-center"
      style={{ background: "var(--card)" }}
    >
      <MessageSquareText size={22} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
      <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
        No confessions yet — be the first to post one.
      </p>
    </motion.button>
  );
}
