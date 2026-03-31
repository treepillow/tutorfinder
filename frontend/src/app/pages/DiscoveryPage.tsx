import { useState, useEffect } from "react";
import { SwipeableCard } from "../components/SwipeableCard";
import { ProfileDetailDialog } from "../components/ProfileDetailDialog";
import { MatchDialog } from "../components/MatchDialog";
import { getCurrentUser, profileApi, matchApi, enrichProfile } from "../utils/api";
import { toast } from "sonner";

export function DiscoveryPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [likedByIds, setLikedByIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadProfiles(user);
    }
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

      const swipedIds = new Set(swipedRes.swiped_ids || []);
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

  const handleSwipe = (direction: "left" | "right", profile: any) => {
    const isLike = direction === "right";

    // Move to next card immediately - don't wait for API
    setTimeout(() => setCurrentIndex((i) => i + 1), 350);

    // If we already know they liked us, show match dialog instantly
    if (isLike && likedByIds.has(profile.id)) {
      setTimeout(() => {
        setMatchedProfile(profile);
        setShowMatchDialog(true);
      }, 400);
    }

    // Fire API call in background (still needed to record the swipe/match on server)
    matchApi.swipe(currentUser.id, profile.id, isLike)
      .then((res) => {
        // Only show dialog if we didn't already show it optimistically
        if (res.matched && !likedByIds.has(profile.id)) {
          setMatchedProfile(profile);
          setShowMatchDialog(true);
        }
      })
      .catch((err: any) => {
        if (err.status !== 409) {
          console.error("Swipe failed:", err);
        }
      });
  };

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

        {loading ? (
          <div className="bg-[#EDE9DF] rounded-3xl p-16 text-center">
            <div className="text-4xl mb-4 animate-pulse">...</div>
            <p className="text-[#2F3B3D]/70">Loading profiles...</p>
          </div>
        ) : currentIndex < profiles.length ? (
          <div className="relative">
            {profiles.slice(currentIndex, currentIndex + 2).map((profile, idx) => (
              <SwipeableCard
                key={profile.id}
                profile={profile}
                onSwipe={(direction) => handleSwipe(direction, profile)}
                onClick={() => handleCardClick(profile)}
                isTop={idx === 0}
                userType={currentUser.userType}
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
