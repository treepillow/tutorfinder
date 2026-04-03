import { useState, useEffect, useCallback, useRef } from "react";
import { SwipeableCard } from "../components/SwipeableCard";
import { ProfileDetailDialog } from "../components/ProfileDetailDialog";
import { MatchDialog } from "../components/MatchDialog";
import { getCurrentUser, profileApi, matchApi, enrichProfile } from "../utils/api";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";
import { useRefreshNavCounts } from "../context/NavCountsContext";

export function DiscoveryPage() {
  const refreshNavCounts = useRefreshNavCounts();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [likedByIds, setLikedByIds] = useState<Set<number>>(new Set());
  const [keySwipe, setKeySwipe] = useState<"left" | "right" | null>(null);
  const swipedIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    setCurrentUser(user);
    loadProfiles(user);

    // WebSocket: append newly registered profiles in real time
    const socket: Socket = io(import.meta.env.VITE_PROFILE_SERVICE, {
      transports: ["websocket"],
    });

    socket.on("new_profile", (raw: any) => {
      const profile = enrichProfile(raw);
      const oppositeRole = user.userType === "student" ? "tutor" : "student";
      if (profile.userType !== oppositeRole) return;
      if (swipedIdsRef.current.has(profile.id)) return;
      setProfiles((prev) => {
        if (prev.some((p) => p.id === profile.id)) return prev;
        return [...prev, profile];
      });
      toast(`New ${oppositeRole} joined!`, { description: profile.name });
    });

    // Refresh likedByIds every 5 seconds so the optimistic match path
    // works even when the other user swipes after page load
    const interval = setInterval(async () => {
      try {
        const res = await matchApi.getLikedMe(user.id);
        setLikedByIds(new Set(res.liked_by_ids || []));
      } catch {}
    }, 5000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const loadProfiles = async (user: any) => {
    setLoading(true);
    try {
      // Fetch profiles, swiped IDs, and who liked me — all in parallel
      const [searchRes, swipedRes, likedMeRes] = await Promise.all([
        profileApi.search({ radius: 999 }),
        matchApi.getSwipedIds(user.id),
        matchApi.getLikedMe(user.id),
      ]);

      const swipedIds = new Set<number>(swipedRes.swiped_ids || []);
      swipedIdsRef.current = swipedIds;
      setLikedByIds(new Set(likedMeRes.liked_by_ids || []));

      const unswiped = (searchRes.profiles || [])
        .map(enrichProfile)
        .filter((p: any) => !swipedIds.has(p.id));
      setProfiles(unswiped);
    } catch (err: any) {
      console.error("Failed to load profiles:", err);
      toast.error("Failed to load profiles");
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = useCallback((direction: "left" | "right", profile: any) => {
    const isLike = direction === "right";

    // Move to next card immediately - don't wait for API
    setTimeout(() => setCurrentIndex((i) => i + 1), 350);

    // If we already know they liked us, show match dialog instantly
    if (isLike && likedByIds.has(profile.id)) {
      setTimeout(() => {
        setMatchedProfile(profile);
        setShowMatchDialog(true);
        refreshNavCounts();
      }, 400);
    }

    // Fire API call in background (still needed to record the swipe/match on server)
    matchApi.swipe(currentUser.id, profile.id, isLike)
      .then((res) => {
        // Only show dialog if we didn't already show it optimistically
        if (res.matched && !likedByIds.has(profile.id)) {
          setMatchedProfile(profile);
          setShowMatchDialog(true);
          refreshNavCounts();
        }
      })
      .catch((err: any) => {
        if (err.status !== 409) {
          console.error("Swipe failed:", err);
        }
      });
  }, [currentUser, likedByIds]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!profiles[currentIndex] || selectedProfile || showMatchDialog || keySwipe) return;
      if (e.key === "ArrowLeft") setKeySwipe("left");
      if (e.key === "ArrowRight") setKeySwipe("right");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [profiles, currentIndex, selectedProfile, showMatchDialog, keySwipe]);

  const handleCardClick = (profile: any) => {
    setSelectedProfile(profile);
  };

  const currentProfile = profiles[currentIndex];

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-4xl tracking-tight text-[#2F3B3D] mb-2">
            Discover
          </h1>
          <p className="text-[#2F3B3D]/70">
            {currentUser.userType === "student"
              ? "Find your perfect tutor"
              : "Connect with students"}
          </p>
        </div>

        {!loading && currentIndex < profiles.length ? (
          <div className="relative">
            {profiles.slice(currentIndex, currentIndex + 2).map((profile, idx) => (
              <SwipeableCard
                key={profile.id}
                profile={profile}
                onSwipe={(direction) => { setKeySwipe(null); handleSwipe(direction, profile); }}
                onClick={() => handleCardClick(profile)}
                isTop={idx === 0}
                userType={currentUser.userType}
                forceSwipe={idx === 0 ? keySwipe : null}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#EDE9DF] rounded-3xl p-16 text-center">
            <div className="text-6xl mb-4">
              {profiles.length === 0 ? "🔍" : "🎉"}
            </div>
            <h3 className="text-2xl text-[#2F3B3D] mb-2">
              {profiles.length === 0
                ? "No profiles found"
                : "You've seen everyone!"}
            </h3>
            <p className="text-[#2F3B3D]/70">
              Check back later for new profiles
            </p>
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-white/30">
          <div className="w-12 h-12 rounded-full border-4 border-[#7C8D8C] border-t-transparent animate-spin" />
        </div>
      )}

      {selectedProfile && (
        <ProfileDetailDialog
          profile={selectedProfile}
          userType={currentUser.userType}
          onClose={() => setSelectedProfile(null)}
          showActions={false}
        />
      )}

      {showMatchDialog && matchedProfile && (
        <MatchDialog
          profile={matchedProfile}
          onClose={() => {
            setShowMatchDialog(false);
            setMatchedProfile(null);
          }}
        />
      )}
    </div>
  );
}
